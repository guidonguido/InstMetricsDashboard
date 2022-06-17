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
    <>
        <Row justify="center"> CONNECTED PAGES </Row>
        { ( props.resourcesHistory.length === 0 && 
          <Spin tip='Waiting for data'/> ) ||
          <div className="modal-content">
          { props.resourcesHistory.at(-1)!.connections?.map((conn: ConnInfo) => 
              <ConnectedCol key={ conn.connUid + "_plot" } IP={conn.ip} latency={conn.latency} data={getLatencyHistory(props, conn.connUid)}></ConnectedCol>
            ) }
          </div>
        }
    </>
  )

} 

export default ConnMetrics