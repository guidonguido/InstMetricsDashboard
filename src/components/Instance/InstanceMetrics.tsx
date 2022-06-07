import { FC, useEffect, useState } from 'react';

import { Resources, ConnInfo } from "../../models/Resources";
import GaugeChart from "../Chart/GaugeChart";
import InstanceMetricsModal from './InstanceMetricsModal';
import WarningStatus from './WarningStatus';

import { ArrowsAltOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import {Row, Col} from 'antd/lib/grid';
import { Button, Spin } from 'antd';

import './InstanceMetrics.css';


export interface InstaceMetricsContent {
  instanceUID: string;
  instMetricsHost?: string;
  resourcesHistory: Resources[];
  studentName: string;
  studentId: string;
}

const InstanceMetrics: FC<InstaceMetricsContent> = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [CPUWarningStatus, setCPUWarningStatus] = useState("");
  const [MEMWarningStatus, setMEMWarningStatus] = useState("");
  const [NETWarningStatus, setNETWarningStatus] = useState("");

  useEffect(() => {
    props.resourcesHistory.length > 0 && setCPUWarningStatus(getCPUWarningStatus(props.resourcesHistory));
    props.resourcesHistory.length > 0 && setMEMWarningStatus(getMEMWarningStatus(props.resourcesHistory));
    props.resourcesHistory.length > 0 && setNETWarningStatus(getNETWarningStatus(props.resourcesHistory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const getCPUWarningStatus = (resourcesHistory: Resources[]) => {
    const getAvgCPU: () => number = () => {
      return resourcesHistory.map((e) => e.cpu).reduce((a, b) => a + b, 0) / resourcesHistory.length;
    }

    let CPUWarningStatus;
    
    if( resourcesHistory.at(-1)!.cpu < 90 ) {
      CPUWarningStatus = 'grn';
    } else {
      const avgCPU = getAvgCPU();
      console.log("##### AVG CPU: ", avgCPU);
      CPUWarningStatus = ( (avgCPU > 98) && 'red' ) || ( (avgCPU > 95) && 'yel' ) || 'grn';
      console.log("##### CPUWarningStatus: ", CPUWarningStatus);
    }

    return CPUWarningStatus;
  }

  const getMEMWarningStatus = (resourcesHistory: Resources[]) => {
    const getAvgMEM: () => number = () => {
      return resourcesHistory.map((e) => e.mem).reduce((a, b) => a + b, 0) / resourcesHistory.length;
    }

    let MEMWarningStatus;

    if( resourcesHistory.at(-1)!.mem < 90 ) {
      MEMWarningStatus = 'grn';
    } else {
      const avgMEM = getAvgMEM();
      MEMWarningStatus = ( (avgMEM > 98) && 'red' ) || ( (avgMEM > 95 ) && 'yel') || 'grn';
    }
    
    return MEMWarningStatus;
  }

  const getNETWarningStatus = (resourcesHistory: Resources[]) => {
    const getAvgNET: () => number[] | undefined = () => {
      return resourcesHistory.at(-1)!.connections!.map((conn: ConnInfo) => {
        const wantedRes = resourcesHistory.filter((e) => e.connections?.find(c => c.connUid === conn.connUid)!== undefined)
        return wantedRes.map((e) => e.connections?.find(c => c.connUid === conn.connUid)!.latency)
                        .reduce((a, b) => a + b, 0) / wantedRes.length;
      }) 
    }

    let NETWarningStatus;
    
    if( resourcesHistory.at(-1)!.connections.find(conn => conn.latency > 200) === undefined ) {
      NETWarningStatus = 'grn';
    } else {
      const avgNET = getAvgNET();
      NETWarningStatus = ( (avgNET === undefined) && 'grn' ) || ( (avgNET!.filter(e => e > 800).length > 0) && 'red' ) || ( (avgNET!.filter(e => e > 200).length > 0) && 'yel' ) || 'grn';
    }
    return NETWarningStatus;
  }


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
                <Col lg={4} sm={24} xs={24}>
                  { props.resourcesHistory.length > 0 && 
                    <WarningStatus CPUWarningStatus={CPUWarningStatus} MEMWarningStatus={MEMWarningStatus} NETWarningStatus={NETWarningStatus}/>}
                </Col>
                <Col lg={4} sm={24} xs={24} style={{height:'30px', width:'60px'}}> 
                  { (props.resourcesHistory.length === 0 && <Spin/>) ||  
                    <GaugeChart height='30px' width='60px' titleOffsetY={-20} titleFontSize='0.9em' title="CPU" percent={ props.resourcesHistory.at(-1)!.cpu }/> }
                </Col>
                <Col lg={4} sm={24} xs={24}> 
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
          maskClosable={true}
          keyboard={true}
          bodyStyle={{padding:'0'}}
          onCancel={handleCancel}
          footer={[
            <Button key="close" onClick={handleCancel}> Close </Button>
          ]}>
        <InstanceMetricsModal resourcesHistory={props.resourcesHistory}/>
      </Modal>
    </div>
  )
}

export default InstanceMetrics;