import type { CommandRunner } from './process-command.mjs';

export type AllowlistStatus =
  | 'ok'
  | 'drift'
  | 'cleanup'
  | 'unconfigured'
  | 'misconfigured'
  | 'error';

export interface AllowlistRange {
  cidr: string;
  ruleName: string;
}

export interface AllowlistRule {
  name: string;
  cidr: string;
  action: string;
}

export interface AllowlistDrift {
  configured: boolean;
  allowRules: AllowlistRule[];
  denyRules: AllowlistRule[];
  missing: AllowlistRange[];
  extra: AllowlistRange[];
}

export interface AllowlistReport {
  status: AllowlistStatus;
  checkedAt: string;
  containerApp: string;
  resourceGroup: string;
  cloudflareUrl: string;
  publishedRanges: number;
  allowRuleCount: number;
  originUrl?: string;
  publicUrl?: string;
  missing: AllowlistRange[];
  extra: AllowlistRange[];
  denyRules: AllowlistRule[];
}

export interface CheckOptions {
  containerApp?: string;
  resourceGroup?: string;
  cloudflareUrl?: string;
}

export interface CheckDependencies {
  fetchRanges?: (url?: string) => Promise<string[]>;
  runner?: CommandRunner;
}

export interface CheckResult {
  exitCode: number;
  status: AllowlistStatus;
  summary: string;
  report: AllowlistReport | null;
  markdown: string;
}

export const EXIT_OK: number;
export const EXIT_ACTION_REQUIRED: number;
export const EXIT_ERROR: number;
export const EXIT_NOT_CONFIGURED: number;
export const EXIT_CLEANUP_ONLY: number;

export function isIpv4Cidr(value: string): boolean;

export function parseCloudflareRanges(text: string): string[];

export function ruleNameFor(cidr: string): string;

export function fetchCloudflareRanges(
  url?: string,
  fetchImplementation?: typeof fetch,
): Promise<string[]>;

export function computeDrift(cloudflareRanges: string[], restrictions: unknown): AllowlistDrift;

export function buildMarkdown(report: AllowlistReport): string;

export function checkCloudflareAllowlist(
  options: CheckOptions,
  dependencies?: CheckDependencies,
): Promise<CheckResult>;
