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
  const menuItems = [
    {
      key: "sys",
      icon: <LineChartOutlined />,
      label: "System metrics",
    },
    {
      key: "go-link",
      icon: <Logo widthPx={20}/>,
      label: <a href={`https://${props.instanceRefLink}`} target="_blank" rel="noopener noreferrer">
              Go to instance
            </a>
    }
  ]

  return (
    <>
      <Menu mode='horizontal' items={menuItems} defaultSelectedKeys={['sysMetrics']}/>
      <Row>
        <Col span={4}>
          <SysMetrics resourcesHistory={props.resourcesHistory}/> 
        </Col>
        <Col span={20} offset={0}>
          <ConnMetrics connections={props.resourcesHistory.at(-1)?.connections || []}/> 
        </Col>
      </Row>
    </>
  )

}

export default InstanceMetricsModal;