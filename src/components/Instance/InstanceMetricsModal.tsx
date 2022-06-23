import { FC } from "react";

import { LineChartOutlined } from "@ant-design/icons";
import { Resources } from "../../models/Resources";
import SysMetrics from './SysMetrics';
import ConnMetrics from './ConnMetrics';
import Logo from '../Logo/Logo';
import { Col, Menu, Row } from "antd";

export interface InstanceMetricsModalContent {
  instanceRefLink?: string,
  resourcesHistory: Resources[]
}  


const InstanceMetricsModal: FC<InstanceMetricsModalContent> = (props) => {
  return (
    <>
      <Menu mode='horizontal' defaultSelectedKeys={['sysMetrics']}>
        <Menu.Item key="sys" icon={<LineChartOutlined />}>
          System Metrics
        </Menu.Item>
        <Menu.Item key='go-link' icon={<Logo widthPx={20}/>}>
          <a href={`https://${props.instanceRefLink}`} target="_blank" rel="noopener noreferrer">
            Go to instance
          </a>
        </Menu.Item>
      </Menu>
      <Row>
        <Col span={4}>
          <SysMetrics resourcesHistory={props.resourcesHistory}/> 
        </Col>
        <Col span={18} offset={2}>
          <ConnMetrics resourcesHistory={props.resourcesHistory}/> 
        </Col>
      </Row>
    </>
  )

}

export default InstanceMetricsModal;