export interface Resources {
  connections: ConnInfo[];
  connectionsCount: number;
  cpu: number;
  mem: number;
  timestamp: Date;
  error: string;
}

export interface ConnInfo {
  latency: number;
  ip: string;
  connUid: string;
}

export const getAvgMEM = (resourcesHistory: Resources[]): number =>{
  return resourcesHistory.map((e) => e.mem).reduce((a, b) => a + b, 0) / resourcesHistory.length;
}

export const getAvgNET = (resourcesHistory: Resources[]): number[] | undefined =>{
  return resourcesHistory.at(-1)!.connections.map((conn: ConnInfo) => {
    const wantedRes = resourcesHistory.filter((e) => e.connections?.find(c => c.connUid === conn.connUid)!== undefined)
    return wantedRes.map((e) => e.connections?.find(c => c.connUid === conn.connUid)!.latency)
                    .reduce((a, b) => a + b, 0) / wantedRes.length;
  }) 
}

export const getAvgCPU = (resourcesHistory: Resources[]): number =>{
  return resourcesHistory.map((e) => e.cpu).reduce((a, b) => a + b, 0) / resourcesHistory.length;
}