import { describe, expect, it, vi } from 'vitest';

import {
  EXIT_ACTION_REQUIRED,
  EXIT_CLEANUP_ONLY,
  EXIT_ERROR,
  EXIT_NOT_CONFIGURED,
  EXIT_OK,
  checkCloudflareAllowlist,
  computeDrift,
  parseCloudflareRanges,
  ruleNameFor,
} from '../../../scripts/check-cloudflare-ips.mjs';

const publishedRanges = ['104.16.0.0/13', '172.64.0.0/13'];

function ingress(restrictions: unknown) {
  return {
    fqdn: 'conjuros-web.example.azurecontainerapps.io',
    customDomains: [{ name: 'conjuros.app' }],
    ipSecurityRestrictions: restrictions,
  };
}

function dependencies(restrictions: unknown = []) {
  return {
    fetchRanges: vi.fn().mockResolvedValue(publishedRanges),
    runner: vi.fn().mockResolvedValue({
      code: 0,
      stdout: JSON.stringify(ingress(restrictions)),
      stderr: '',
    }),
  };
}

const allowRules = publishedRanges.map((cidr) => ({
  name: ruleNameFor(cidr),
  ipAddressRange: cidr,
  action: 'Allow',
}));

describe('parseCloudflareRanges', () => {
  it('keeps only valid IPv4 ranges', () => {
    const body = ['# comment', '104.16.0.0/13', '', 'not-a-range', '999.1.1.1/24', '172.64.0.0/13'].join(
      '\n',
    );

    expect(parseCloudflareRanges(body)).toEqual(['104.16.0.0/13', '172.64.0.0/13']);
  });
});

describe('ruleNameFor', () => {
  it('turns a range into the expected rule name', () => {
    expect(ruleNameFor('104.16.0.0/13')).toBe('cf-104-16-0-0-13');
  });
});

describe('computeDrift', () => {
  it('reports missing, extra and deny rules separately', () => {
    const drift = computeDrift(publishedRanges, [
      { name: 'cf-104-16-0-0-13', ipAddressRange: '104.16.0.0/13', action: 'Allow' },
      { name: 'legacy', ipAddressRange: '10.0.0.0/8', action: 'Allow' },
      { name: 'blocked', ipAddressRange: '192.168.0.0/16', action: 'Deny' },
    ]);

    expect(drift.missing).toEqual([{ cidr: '172.64.0.0/13', ruleName: 'cf-172-64-0-0-13' }]);
    expect(drift.extra).toEqual([{ cidr: '10.0.0.0/8', ruleName: 'legacy' }]);
    expect(drift.denyRules).toEqual([{ name: 'blocked', cidr: '192.168.0.0/16', action: 'deny' }]);
    expect(drift.configured).toBe(true);
  });
});

describe('checkCloudflareAllowlist', () => {
  it('passes when the allowlist matches Cloudflare', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      dependencies(allowRules),
    );

    expect(result.exitCode).toBe(EXIT_OK);
    expect(result.status).toBe('ok');
    expect(result.markdown).toBe('');
    expect(result.report?.allowRuleCount).toBe(2);
  });

  it('fails with the exact command when a Cloudflare range is missing', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      dependencies([allowRules[0]]),
    );

    expect(result.exitCode).toBe(EXIT_ACTION_REQUIRED);
    expect(result.status).toBe('drift');
    expect(result.report?.missing).toEqual([{ cidr: '172.64.0.0/13', ruleName: 'cf-172-64-0-0-13' }]);
    expect(result.markdown).toContain('az containerapp ingress access-restriction set');
    expect(result.markdown).toContain('--ip-address "$cidr"');
    expect(result.markdown).toContain('for cidr in 172.64.0.0/13; do');
  });

  it('reports the allowlist as not configured with every range to allow', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      dependencies(null),
    );

    expect(result.exitCode).toBe(EXIT_NOT_CONFIGURED);
    expect(result.status).toBe('unconfigured');
    expect(result.markdown).toContain('The allowlist is not configured');
    expect(result.markdown).toContain('for cidr in 104.16.0.0/13 172.64.0.0/13; do');
  });

  it('warns about extra rules without failing the check', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      dependencies([
        ...allowRules,
        { name: 'legacy', ipAddressRange: '10.0.0.0/8', action: 'Allow' },
      ]),
    );

    expect(result.exitCode).toBe(EXIT_CLEANUP_ONLY);
    expect(result.status).toBe('cleanup');
    expect(result.markdown).toContain('access-restriction remove');
    expect(result.markdown).toContain('--rule-name "legacy"');
  });

  it('includes the verification commands for both hostnames', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      dependencies(null),
    );

    expect(result.markdown).toContain('https://conjuros.app/');
    expect(result.markdown).toContain('https://conjuros-web.example.azurecontainerapps.io/');
  });

  it('reports an error when Azure cannot be queried', async () => {
    const result = await checkCloudflareAllowlist(
      { containerApp: 'conjuros-web', resourceGroup: 'conjuros-rg' },
      {
        fetchRanges: vi.fn().mockResolvedValue(publishedRanges),
        runner: vi.fn().mockResolvedValue({ code: 1, stdout: '', stderr: 'not logged in' }),
      },
    );

    expect(result.exitCode).toBe(EXIT_ERROR);
    expect(result.status).toBe('error');
    expect(result.report).toBeNull();
    expect(result.markdown).toBe('');
    expect(result.summary).toContain('not logged in');
  });

  it('requires a container app and a resource group', async () => {
    const result = await checkCloudflareAllowlist({}, dependencies());

    expect(result.exitCode).toBe(EXIT_ERROR);
    expect(result.summary).toContain('required');
  });
});
