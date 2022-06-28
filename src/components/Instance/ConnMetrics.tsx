import { FC } from "react";
import { ConnInfo, Resources } from "../../models/Resources";
import { Row, Spin } from "antd";
import ConnectedCol from "./ConnectedCol";

export interface ConnMetricsContent {
  resourcesHistory: Resources[];
}

const ConnMetrics: FC<ConnMetricsContent> = props => { 

  return (
    <>
        <Row justify="center"> CONNECTED PAGES </Row>
        { ( props.resourcesHistory.length === 0 && 
          <Spin tip='Waiting for data'/> ) ||
          <Row className="modal-content">
          { props.resourcesHistory.at(-1)!.connections?.sort((a, b) => a.connUid.localeCompare(b.connUid)).map((conn: ConnInfo) => 
              <ConnectedCol key={ conn.connUid + "_plot" } connInfo={conn}/>
            ) }
          </Row>
        }
    </>
  )

} 

export default ConnMetrics