import { FC } from "react";

import { ConnInfo, Resources } from "../../models/Resources";
import { Row, Spin } from "antd";
import { PlotData } from "../Chart/LinePlot";
import ConnectedCol from "./ConnectedCol";


export interface ConnMetricsContent {
  resourcesHistory: Resources[];
}

const ConnMetrics: FC<ConnMetricsContent> = props => {  

  const getLatencyHistory = (props: ConnMetricsContent, connUid: string) => {
    const history: PlotData[] = props.resourcesHistory.map( (res: Resources, index: number) => { 
      const lat = res.connections?.find(conn => conn.connUid === connUid)?.latency;
      return {type:'Latency', value: lat, timestamp: index}
    } );
    return history;
  };

  return (
    <Row justify="center" className="body-row">
        <Row justify="center">CONNECTED PAGES</Row>
        { ( props.resourcesHistory.length === 0 && 
          <Spin tip='Waiting for data'/> ) ||
          <Row justify="center" gutter={[16, 16]} className="modal-content">
          { props.resourcesHistory.at(-1)!.connections?.map((conn: ConnInfo) => 
              <ConnectedCol key={ conn.connUid + "_plot" } IP={conn.IP} latency={conn.latency} data={getLatencyHistory(props, conn.connUid)}></ConnectedCol>
            ) }
          </Row>
        }
    </Row>
  )

} 

export default ConnMetrics