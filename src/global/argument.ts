import ipRangeCheck from "ip-range-check";

export interface ConnLabel {
  label: string,
  subnet: string,
  latencyWarning: number
}

declare global {
  interface Window {
      connLabels: ConnLabel[],
      quizID: string
  }
}

window.quizID = "";

// <key:label; val:subnet>
window.connLabels = [
  {label: "EDUROAM", subnet: "172.22.0.0/16", latencyWarning: 120} as ConnLabel,
  {label: "POLITO", subnet: "172.21.0.0/16", latencyWarning: 120} as ConnLabel,
  {label: "GUIDO", subnet: "93.51.20.186/32", latencyWarning: 12} as ConnLabel,
];

export const getLabelFromIP = (IP: string): ConnLabel => {
  for (const connLabel of window.connLabels) {
    if( ipRangeCheck(IP, connLabel.subnet) ) return connLabel; 
  }
  return {label: "EXTERNAL", subnet: "0.0.0.0/0", latencyWarning: 200} as ConnLabel
}