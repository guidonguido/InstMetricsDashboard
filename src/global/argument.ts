import ipRangeCheck from "ip-range-check";

export interface ConnLabel {
  label: string,
  subnet: string,
  latencyWarning: number
}

declare global {
  interface Window {
      connLabels: ConnLabel[],
      quizID: string | null,
      codIns: string | null,
  }
}

window.quizID = new URLSearchParams(window.location.search).get("quizID");
window.codIns = new URLSearchParams(window.location.search).get("codIns");

// <key:label; val:subnet>
window.connLabels = [
  {label: "EDUROAM",         subnet: "172.22.0.0/16",     latencyWarning: 120} as ConnLabel,
  {label: "POLITO",          subnet: "172.21.0.0/16",     latencyWarning: 120} as ConnLabel,
  {label: "Laib1B",          subnet: "192.168.32.65/26",  latencyWarning: 120} as ConnLabel,
  {label: "Laib2B",          subnet: "192.168.32.128/26", latencyWarning: 120} as ConnLabel,
  {label: "Laib3B",          subnet: "192.168.32.192/26", latencyWarning: 120} as ConnLabel,
  {label: "Laib1",           subnet: "192.168.41.0/24",   latencyWarning: 120} as ConnLabel,
  {label: "Laib3",           subnet: "192.168.43.0/24",   latencyWarning: 120} as ConnLabel,
  {label: "Laib4",           subnet: "192.168.44.0/24",   latencyWarning: 120} as ConnLabel,
  {label: "Laib5",           subnet: "192.168.45.0/24",   latencyWarning: 120} as ConnLabel,
  {label: "Aula3D",          subnet: "172.29.2.0/24",     latencyWarning: 120} as ConnLabel,
  {label: "Aula5D",          subnet: "172.29.3.0/24",     latencyWarning: 120} as ConnLabel,
  {label: "Laib1M",          subnet: "192.168.55.64/27",  latencyWarning: 120} as ConnLabel,
  {label: "Laib2M",          subnet: "192.168.55.128/27", latencyWarning: 120} as ConnLabel,
  {label: "Laib3M",          subnet: "192.168.55.192/27", latencyWarning: 120} as ConnLabel,
  {label: "Laib1N",          subnet: "192.168.37.64/26",  latencyWarning: 120} as ConnLabel,
  {label: "Laib1T",          subnet: "192.168.35.64/27",  latencyWarning: 120} as ConnLabel,
  {label: "Aula5T",          subnet: "192.168.35.96/27",  latencyWarning: 120} as ConnLabel,
  {label: "Laib1S",          subnet: "192.168.158.0/26",  latencyWarning: 120} as ConnLabel,
  {label: "Laib2S",          subnet: "192.168.158.64/26", latencyWarning: 120} as ConnLabel,
  {label: "Laib1MV",         subnet: "192.168.1.64/26",   latencyWarning: 120} as ConnLabel,
  {label: "VLAIB",           subnet: "192.168.64.0/23",   latencyWarning: 120} as ConnLabel,
  {label: "POLITO-WIRED",   subnet: "130.192.0.0/16",    latencyWarning: 120} as ConnLabel,

  
];

export const getLabelFromIP = (IP: string): ConnLabel => {
  for (const connLabel of window.connLabels) {
    if( ipRangeCheck(IP, connLabel.subnet) ) return connLabel; 
  }
  return {label: "EXTERNAL", subnet: "0.0.0.0/0", latencyWarning: 200} as ConnLabel
}