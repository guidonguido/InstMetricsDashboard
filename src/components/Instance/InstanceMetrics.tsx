import { FC, useState } from 'react';

import { Resources } from "../../models/Resources";
import GaugeChart from "../Chart/GaugeChart";
import InstanceMetricsModal from './InstanceMetricsModal';

import {Row, Col} from 'antd/lib/grid';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';

import './InstanceMetrics.css';
import Modal from 'antd/lib/modal/Modal';


export interface InstaceMetricsContent {
  instanceUID: string;
  instMetricsHost?: string;
  resourcesHistory: Resources[];
  studentName: string;
  studentId: string;
}

const InstanceMetrics: FC<InstaceMetricsContent> = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <div className='instance-box'>
      <Row justify="center">
        < Col lg={18} sm={24} xs={24} className="title instance-el">
          <Row style={{height:'45px'}}>
            <Col lg={8} sm={24} xs={24}>
              <Row justify="start">
                <span className='title-text'>{`${props.studentName.toUpperCase()} ${props.studentId.toLowerCase()} `}</span>
              </Row>
            </Col>
            <Col lg={13} sm={24} xs={24}>
              <Row justify="start">
                <Col lg={6} sm={24} xs={24} style={{height:'30px', width:'60px'}}> 
                  { (props.resourcesHistory.length === 0 && <Spin/>) ||  
                    <GaugeChart height='30px' width='60px' titleOffsetY={-20} titleFontSize='0.9em' title="CPU" percent={ props.resourcesHistory.at(-1)!.cpu }/> }
                </Col>
                <Col lg={6} sm={24} xs={24}> 
                  { (props.resourcesHistory.length === 0 && <Spin/>) || 
                    <GaugeChart height='30px' width='60px' titleOffsetY={-20} titleFontSize='0.9em' title="MEM" percent={ props.resourcesHistory.at(-1)!.mem }/> }
                </Col>
                <Col lg={12} sm={24} xs={24}> 
                  <Row justify='center' style={{fontSize: "1em", fontWeight: "normal", fontFamily:"Courier New", color: '#4B535E'}}># Active Connections(Total)</Row>
                  { (props.resourcesHistory.length === 0 && <Spin/>) || 
                    <Row justify='center' style={{fontSize: "1em", fontWeight: "normal", fontFamily:"Courier New"}}>{ props.resourcesHistory.at(-1)!.connections?.length || 0 }({ props.resourcesHistory.at(-1)?.connectionsCount })</Row> }
                </Col>
              </Row>
            </Col>
            <Col lg={3} sm={24} xs={24}>
              <Button size='small' onClick={showModal} icon={<ArrowsAltOutlined />} style={{backgroundColor:'transparent'}} > Expand </Button>
              <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" style={{position: "absolute", right: "15px", bottom:"0px", fontSize: "0.8em", fontWeight: "lighter"}}>Go to instance</a> 
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal 
          visible={isModalVisible} 
          closable={false} 
          bodyStyle={{padding:'0'}}
          footer={[
            <Button key="close" onClick={handleCancel}> Close </Button>
          ]}>
        <InstanceMetricsModal resourcesHistory={props.resourcesHistory}/>
      </Modal>
    </div>
  )
}

export default InstanceMetrics;