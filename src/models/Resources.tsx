export interface Resources {
  connections: ConnInfo[];
  cpu: number;
  mem: number;
  timestamp: Date;
  error: string;
}

export interface ConnInfo {
  latency: number;
  IP: string;
  connUid: string;
}
