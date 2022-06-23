import { FC } from "react";

import { Resources } from "../../models/Resources";
import { Row, Spin } from "antd";
import GaugeChart from '../Chart/GaugeChart';

import './ModalContent.css';

export interface SysMetricsContent {
  resourcesHistory: Resources[];
}

const SysMetrics: FC<SysMetricsContent> = props => {
  return (
    <>
      <Row justify="center">SYSTEM LOAD</Row>
      { ( props.resourcesHistory!.length === 0 && 
        <Spin tip='Waiting for data'/> ) ||
        <div style={{marginBottom:"10px"}}>
          <Row className="gauge-chart" justify="center">  
            <GaugeChart title="CPU" percent={ props.resourcesHistory.at(-1)!.cpu }/>
          </Row>  
          <Row className="gauge-chart" justify="center">
            <GaugeChart title="MEM" percent={ props.resourcesHistory.at(-1)!.mem }/>
          </Row>
        </div>}
    </>
  )

} 

export default SysMetrics