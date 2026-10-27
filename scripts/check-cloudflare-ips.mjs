import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { runCommand } from './process-command.mjs';

const CLOUDFLARE_IPV4_URL = 'https://www.cloudflare.com/ips-v4';
const FETCH_TIMEOUT_MS = 15_000;
const RULE_NAME_PREFIX = 'cf-';
const CIDR_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

export const EXIT_OK = 0;
export const EXIT_ACTION_REQUIRED = 1;
export const EXIT_ERROR = 2;
export const EXIT_NOT_CONFIGURED = 3;
export const EXIT_CLEANUP_ONLY = 4;

const USAGE = [
  'Usage:',
  '  node scripts/check-cloudflare-ips.mjs --container-app <name> --resource-group <name>',
  '    [--cloudflare-url <url>] [--json-out <path>] [--markdown-out <path>]',
  '',
  'Compares the IPv4 ranges published by Cloudflare with the allow rules of a container app',
  'ingress and reports the drift. Exit codes: 0 no drift, 1 action required, 2 error,',
  '3 allowlist not configured, 4 cleanup only.',
].join('\n');

export function isIpv4Cidr(value) {
  const match = CIDR_PATTERN.exec(String(value ?? ''));
  if (!match) {
    return false;
  }
  const octets = match.slice(1, 5).map(Number);
  const prefix = Number(match[5]);
  return octets.every((octet) => octet <= 255) && prefix <= 32;
}

export function parseCloudflareRanges(text) {
  const ranges = new Set();
  for (const line of String(text ?? '').split('\n')) {
    const candidate = line.trim();
    if (isIpv4Cidr(candidate)) {
      ranges.add(candidate);
    }
  }
  return [...ranges];
}

export function ruleNameFor(cidr) {
  return `${RULE_NAME_PREFIX}${cidr.replace(/[./]/g, '-')}`;
}

export async function fetchCloudflareRanges(
  url = CLOUDFLARE_IPV4_URL,
  fetchImplementation = fetch,
) {
  const response = await fetchImplementation(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Cloudflare published ranges returned HTTP ${response.status}.`);
  }
  return parseCloudflareRanges(await response.text());
}

function normalizeRestrictions(restrictions) {
  if (!Array.isArray(restrictions)) {
    return [];
  }
  return restrictions
    .map((rule) => ({
      name: typeof rule?.name === 'string' ? rule.name : '',
      cidr: typeof rule?.ipAddressRange === 'string' ? rule.ipAddressRange.trim() : '',
      action: String(rule?.action ?? 'Allow').toLowerCase(),
    }))
    .filter((rule) => rule.cidr !== '');
}

export function computeDrift(cloudflareRanges, restrictions) {
  const rules = normalizeRestrictions(restrictions);
  const allowRules = rules.filter((rule) => rule.action === 'allow');
  const denyRules = rules.filter((rule) => rule.action !== 'allow');
  const allowed = new Set(allowRules.map((rule) => rule.cidr));
  const published = new Set(cloudflareRanges);
  const missing = cloudflareRanges
    .filter((cidr) => !allowed.has(cidr))
    .map((cidr) => ({ cidr, ruleName: ruleNameFor(cidr) }));
  const extra = allowRules
    .filter((rule) => !published.has(rule.cidr))
    .sort((left, right) => left.cidr.localeCompare(right.cidr))
    .map((rule) => ({ cidr: rule.cidr, ruleName: rule.name || ruleNameFor(rule.cidr) }));

  return { configured: rules.length > 0, allowRules, denyRules, missing, extra };
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function allowCommands(containerApp, resourceGroup, ranges) {
  return [
    '```bash',
    `for cidr in ${ranges.map((range) => range.cidr).join(' ')}; do`,
    `  rule="cf-$(echo "$cidr" | tr './' '--')"`,
    '  az containerapp ingress access-restriction set \\',
    `    --name ${containerApp} \\`,
    `    --resource-group ${resourceGroup} \\`,
    '    --rule-name "$rule" \\',
    '    --action Allow \\',
    '    --ip-address "$cidr" \\',
    '    --description "Cloudflare edge"',
    'done',
    '```',
  ].join('\n');
}

function removeCommands(containerApp, resourceGroup, ruleNames) {
  return [
    '```bash',
    ...ruleNames.map(
      (ruleName) =>
        `az containerapp ingress access-restriction remove --name ${containerApp} ` +
        `--resource-group ${resourceGroup} --rule-name "${ruleName}"`,
    ),
    '```',
  ].join('\n');
}

export function buildMarkdown(report) {
  const lines = [
    '## Cloudflare IP allowlist drift',
    '',
    `**Checked:** ${report.checkedAt}`,
    `**Container app:** \`${report.containerApp}\` (resource group \`${report.resourceGroup}\`)`,
    `**Source of truth:** ${report.cloudflareUrl} (${pluralize(report.publishedRanges, 'IPv4 range')})`,
    `**Allow rules on the container app:** ${report.allowRuleCount}`,
    '',
    '### Why this matters',
    '',
    'Cloudflare connects to the container app from a fixed set of IPv4 ranges and the app only',
    'accepts those ranges; any other client receives `403 RBAC: Access Denied`. When Cloudflare',
    'adds a range that the app does not allow, visitors routed through it see the 403 while the',
    'site keeps working for everyone else, so it looks like an intermittent outage. Extra rules',
    'only allow traffic that Cloudflare no longer sends.',
    '',
  ];

  if (report.status === 'unconfigured') {
    lines.push(
      '### The allowlist is not configured (action required)',
      '',
      'The container app currently accepts traffic from any IP address, so Cloudflare can be',
      'bypassed entirely. Allow every Cloudflare range:',
      '',
      allowCommands(report.containerApp, report.resourceGroup, report.missing),
      '',
    );
  } else if (report.missing.length > 0) {
    lines.push(
      '### Missing ranges (action required)',
      '',
      '| Cloudflare range | Expected rule name |',
      '| --- | --- |',
      ...report.missing.map((range) => `| \`${range.cidr}\` | \`${range.ruleName}\` |`),
      '',
      'Run this to allow every missing range:',
      '',
      allowCommands(report.containerApp, report.resourceGroup, report.missing),
      '',
    );
  }

  if (report.denyRules.length > 0) {
    lines.push(
      '### Deny rules are configured (action required)',
      '',
      'Azure Container Apps cannot combine `Allow` and `Deny` rules, so the allowlist is not in',
      'effect. Remove every deny rule and keep only the Cloudflare `Allow` rules:',
      '',
      removeCommands(
        report.containerApp,
        report.resourceGroup,
        report.denyRules.map((rule) => rule.name),
      ),
      '',
    );
  }

  if (report.extra.length > 0) {
    lines.push(
      '### Extra ranges (cleanup, no outage risk)',
      '',
      '| Allow rule | Range |',
      '| --- | --- |',
      ...report.extra.map((range) => `| \`${range.ruleName}\` | \`${range.cidr}\` |`),
      '',
      'Remove them if Cloudflare no longer announces those ranges:',
      '',
      removeCommands(
        report.containerApp,
        report.resourceGroup,
        report.extra.map((range) => range.ruleName),
      ),
      '',
    );
  }

  if (report.publicUrl || report.originUrl) {
    lines.push('### Verify after applying', '', '```bash');
    if (report.publicUrl) {
      lines.push(
        '# Through Cloudflare: must stay 200',
        `curl -s -o /dev/null -w '%{http_code}\\n' ${report.publicUrl}`,
      );
    }
    if (report.originUrl) {
      lines.push(
        '# Direct to the container app: must be 403',
        `curl -s -o /dev/null -w '%{http_code}\\n' ${report.originUrl}`,
      );
    }
    lines.push('```', '');
  }

  lines.push('_Reported by the weekly `cloudflare-ips` workflow._', '');
  return lines.join('\n');
}

function summarize(status, drift, publishedRanges) {
  switch (status) {
    case 'ok':
      return `Cloudflare allowlist matches all ${pluralize(publishedRanges, 'published range')}.`;
    case 'cleanup':
      return `Cloudflare allowlist matches; ${pluralize(drift.extra.length, 'extra allow rule')} could be removed.`;
    case 'unconfigured':
      return `The container app has no IP restrictions: allow the ${pluralize(publishedRanges, 'Cloudflare range')}.`;
    case 'misconfigured':
      return 'The container app uses Deny rules, so the Cloudflare allowlist is not in effect.';
    case 'drift':
      return `${pluralize(drift.missing.length, 'Cloudflare range')} missing from the allowlist.`;
    default:
      return 'Unknown allowlist status.';
  }
}

function errorResult(summary) {
  return { exitCode: EXIT_ERROR, status: 'error', summary, report: null, markdown: '' };
}

export async function checkCloudflareAllowlist(options, dependencies = {}) {
  const { fetchRanges = fetchCloudflareRanges, runner = runCommand } = dependencies;
  const {
    containerApp,
    resourceGroup,
    cloudflareUrl = CLOUDFLARE_IPV4_URL,
  } = options ?? {};

  if (!containerApp || !resourceGroup) {
    return errorResult('Both a container app and a resource group are required.');
  }

  let ranges;
  try {
    ranges = await fetchRanges(cloudflareUrl);
  } catch (error) {
    return errorResult(`Could not read ${cloudflareUrl}: ${error?.message ?? error}`);
  }
  if (ranges.length === 0) {
    return errorResult(`No valid IPv4 ranges found at ${cloudflareUrl}.`);
  }

  const ingress = await runner('az', [
    'containerapp',
    'show',
    '--name',
    containerApp,
    '--resource-group',
    resourceGroup,
    '--query',
    'properties.configuration.ingress',
    '-o',
    'json',
  ]);
  if (ingress.code !== 0) {
    const detail = ingress.stderr.trim() || `exit code ${ingress.code}`;
    return errorResult(`az containerapp show failed: ${detail}`);
  }

  let configuration;
  try {
    configuration = JSON.parse(ingress.stdout);
  } catch {
    return errorResult('az containerapp show did not return valid JSON.');
  }
  if (!configuration) {
    return errorResult(`Container app ${containerApp} has no ingress to compare.`);
  }

  const drift = computeDrift(ranges, configuration.ipSecurityRestrictions);
  let status = 'ok';
  if (!drift.configured) {
    status = 'unconfigured';
  } else if (drift.denyRules.length > 0) {
    status = 'misconfigured';
  } else if (drift.missing.length > 0) {
    status = 'drift';
  } else if (drift.extra.length > 0) {
    status = 'cleanup';
  }

  const report = {
    status,
    checkedAt: new Date().toISOString(),
    containerApp,
    resourceGroup,
    cloudflareUrl,
    publishedRanges: ranges.length,
    allowRuleCount: drift.allowRules.length,
    originUrl: configuration.fqdn ? `https://${configuration.fqdn}/` : undefined,
    publicUrl: configuration.customDomains?.[0]?.name
      ? `https://${configuration.customDomains[0].name}/`
      : undefined,
    missing: drift.missing,
    extra: drift.extra,
    denyRules: drift.denyRules,
  };

  const exitCodes = {
    ok: EXIT_OK,
    cleanup: EXIT_CLEANUP_ONLY,
    unconfigured: EXIT_NOT_CONFIGURED,
    misconfigured: EXIT_ACTION_REQUIRED,
    drift: EXIT_ACTION_REQUIRED,
  };

  return {
    exitCode: exitCodes[status],
    status,
    summary: summarize(status, drift, ranges.length),
    report,
    markdown: status === 'ok' ? '' : buildMarkdown(report),
  };
}

function parseArguments(argv) {
  const options = {
    containerApp: process.env.CONTAINER_APP,
    resourceGroup: process.env.RESOURCE_GROUP,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    switch (flag) {
      case '--container-app':
        options.containerApp = value;
        index += 1;
        break;
      case '--resource-group':
        options.resourceGroup = value;
        index += 1;
        break;
      case '--cloudflare-url':
        options.cloudflareUrl = value;
        index += 1;
        break;
      case '--json-out':
        options.jsonOut = value;
        index += 1;
        break;
      case '--markdown-out':
        options.markdownOut = value;
        index += 1;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }

  return options;
}

async function runCli(argv) {
  const options = parseArguments(argv);
  if (options.help) {
    console.info(USAGE);
    return EXIT_OK;
  }

  const result = await checkCloudflareAllowlist(options);

  if (options.jsonOut && result.report) {
    await writeFile(options.jsonOut, `${JSON.stringify(result.report, null, 2)}\n`);
  }
  if (options.markdownOut && result.markdown) {
    await writeFile(options.markdownOut, result.markdown);
  }

  if (result.exitCode === EXIT_OK) {
    console.info(result.summary);
  } else {
    console.error(result.summary);
  }
  return result.exitCode;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  try {
    process.exitCode = await runCli(process.argv.slice(2));
  } catch (error) {
    console.error(`${error?.message ?? error}\n\n${USAGE}`);
    process.exitCode = EXIT_ERROR;
  }
}
