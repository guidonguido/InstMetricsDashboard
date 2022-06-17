import { FC } from "react";

import { Resources } from "../../models/Resources";
import { Row, Col, Spin } from "antd";
import GaugeChart from '../Chart/GaugeChart';
import LinePlot, { PlotData } from "../Chart/LinePlot";

import './ModalContent.css';

export interface SysMetricsContent {
  resourcesHistory: Resources[];
}

const SysMetrics: FC<SysMetricsContent> = props => {  

  const getCPUHistory = (props: SysMetricsContent) => {
    const historyLen = props.resourcesHistory.length;
    const history: PlotData[] = [];
    let i = 0;
    if( historyLen < 10 ) {
      for( ; i < 10-historyLen; i++ ) {
        history.push({type:'CPU', value: undefined, timestamp: i});
      }
    }
    props.resourcesHistory.forEach( (res: Resources) => { 
      const cpu = res.cpu > 100 ? 100 : res.cpu;
      history.push({type:'CPU', value: cpu, timestamp: i++});
    } );
    return history;
  };

  return (
    <Row justify="center" className="body-row">
      < Col span={7} className="modal-content">
        <Row justify="center">SYSTEM LOAD</Row>
        { ( props.resourcesHistory!.length === 0 && 
          <Spin tip='Waiting for data'/> ) ||
          <div>
            <Row className="gauge-chart" justify="center">  
              <GaugeChart title="CPU" percent={ props.resourcesHistory.at(-1)!.cpu }/>
            </Row>  
            <Row className="gauge-chart" justify="center">
              <GaugeChart title="MEM" percent={ props.resourcesHistory.at(-1)!.mem }/>
            </Row>
          </div>}
      </Col>
      < Col span={17} className="modal-content">
        <Row justify='center'> CPU HYSTORIC PLOT </Row>
        { ( props.resourcesHistory.length === 0 && <Spin tip='Waiting for data'/> ) || <LinePlot data={getCPUHistory(props)}/> }
      </Col>
    </Row>
  )

} 

export default SysMetrics