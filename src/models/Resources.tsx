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

// getAvgNET returns a map of <key:IP, val:avgNET>
export const getAvgNET = (resourcesHistory: Resources[]): Map<string, number> =>{
  if(resourcesHistory.length === 0) return new Map<string, number>();
  let avgNETMap =  new Map<string, number>();
  let connections = resourcesHistory.at(-1)!.connections;

  connections != null && connections!.forEach((conn: ConnInfo) => {

    const wantedRes = resourcesHistory.filter((e) => e.connections?.find(c => c.connUid === conn.connUid)!== undefined)

    const avgLat = wantedRes.map((e) => e.connections?.find(c => c.connUid === conn.connUid)!.latency)
                    .reduce((a, b) => a + b, 0) / wantedRes.length;

    avgNETMap = avgNETMap.set(conn.ip, avgLat)
  }) 

  return avgNETMap;
}

export const getAvgCPU = (resourcesHistory: Resources[]): number =>{
  return resourcesHistory.map((e) => e.cpu).reduce((a, b) => a + b, 0) / resourcesHistory.length;
}