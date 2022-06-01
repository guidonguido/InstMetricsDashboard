import { FC, useState } from 'react';

import { ConnInfo, Resources } from "../../models/Resources";
import LinePlot, { PlotData } from "../Chart/LinePlot";
import GaugeChart from "../Chart/GaugeChart";
import ConnectedCol from "./ConnectedCol";

import {Row, Col} from 'antd/lib/grid';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export interface InstaceMetricsContent {
  instanceUID: string;
  instMetricsHost?: string;
  resourcesHisory: Resources[];
  studentName: string;
  studentId: string;
}

const InstanceMetrics: FC<InstaceMetricsContent> = props => {
  const [showMetrics, setShowMetrics] = useState(false);

  const hideMetrics = () => {
    setShowMetrics((oldVal) => !oldVal);
  }

  const getCPUHistory = (props: InstaceMetricsContent) => {
    const historyLen = props.resourcesHisory.length;
    const history: PlotData[] = [];
    let i = 0;
    if( historyLen < 10 ) {
      for( ; i < 10-historyLen; i++ ) {
        history.push({type:'CPU', value: undefined, timestamp: i});
      }
    }
    props.resourcesHisory.forEach( (res: Resources) => { 
      history.push({type:'CPU', value: res.cpu, timestamp: i++});
    } );
    return history;
  };

  const getLatencyHistory = (props: InstaceMetricsContent, connUid: string) => {
    const history: PlotData[] = props.resourcesHisory.map( (res: Resources, index: number) => { 
      const lat = res.connections.find(conn => conn.connUid === connUid)?.latency;
      return {type:'Latency', value: lat, timestamp: index}
    } );
    return history;
  }

  return (
    <div className='instance-box'>
      <Row justify="center">
        < Col span={18} className="title instance-el">
          {`${props.studentName.toUpperCase()} ${props.studentId.toLowerCase()} `}
          <Button type="text" onClick={hideMetrics} icon={ (showMetrics && <CaretDownOutlined />) || <CaretUpOutlined />} />
          <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" style={{position: "absolute", right: "10px", bottom:"0px", fontSize: "0.8em", fontWeight: "lighter"}}>Go to instance</a> 
        </Col>
      </Row>
      {showMetrics && <Row justify="center">
        < Col span={4} className="utilization-box instance-el">
          CPU UTILIZATION
          <Row>
            <Col span={12}> <GaugeChart title="CPU" percent={props.resourcesHisory.at(-1)!.cpu}/> </Col>
            <Col span={12}><GaugeChart title="MEM" percent={props.resourcesHisory.at(-1)!.mem}/></Col>
          </Row>
        </Col>
        < Col span={14} className="utilization-plt instance-el">
          <Row justify='center'> CPU HYSTORIC PLOT </Row>
          <LinePlot data={getCPUHistory(props)}/>
        </Col>
      </Row>}
      { showMetrics && <Row justify="center" >
        < Col span={18} className="connections-box instance-el">
          <Row justify="center">CONNECTED PAGES</Row>
          <Row justify="center" gutter={[16, 16]}>
            {props.resourcesHisory.at(-1)!.connections.map((conn: ConnInfo) => <ConnectedCol key={conn.connUid + "_plot"} IP={conn.IP} latency={conn.latency} data={getLatencyHistory(props, conn.connUid)}></ConnectedCol>)}
          </Row>
        </Col>
      </Row>}
    </div>
  )
}

export default InstanceMetrics;