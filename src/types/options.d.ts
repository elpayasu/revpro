export interface Upstream { url: string; priority?: number; }
export interface ProxyOptions {
  port?: number;
  bind?: string;
  trustProxy?: boolean;
  logFormat?: string;
  maxRequestsPerMinute?: number;
  maxBodyBytes?: number;
  cors?: { enabled: boolean; allowOrigins: string[] };
  basicAuth?: { username: string; password: string } | null;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  upstreams?: Upstream[];
  healthCheckInterval?: number;
  healthCheckPath?: string;
  https?: { enabled: boolean; key: string; cert: string } | null;
  plugins?: any[];
}
