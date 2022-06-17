import { FC, useState } from "react";

import { LineChartOutlined, ClusterOutlined } from "@ant-design/icons";
import { Resources } from "../../models/Resources";
import SysMetrics from './SysMetrics';
import ConnMetrics from './ConnMetrics';
import Logo from '../Logo/Logo';
import { Menu } from "antd";

export interface InstanceMetricsModalContent {
  instanceRefLink?: string,
  resourcesHistory: Resources[]
}  


const InstanceMetricsModal: FC<InstanceMetricsModalContent> = (props) => {
  const [activeMenu, setActiveMenu] = useState("sys");

  return (
    <>
      <Menu mode='horizontal' defaultSelectedKeys={['sysMetrics']}>
        <Menu.Item key="sys" icon={<LineChartOutlined />} onClick={() => setActiveMenu("sys")}>
          System Metrics
        </Menu.Item>
        <Menu.Item key="con" icon={<ClusterOutlined />} onClick={() => setActiveMenu("con")}>
          Connections Info
        </Menu.Item>
        <Menu.Item key='go-link' icon={<Logo widthPx={20}/>}>
          <a href={`https://${props.instanceRefLink}`} target="_blank" rel="noopener noreferrer">
            Go to instance
          </a>
        </Menu.Item>
      </Menu>
      { activeMenu === 'sys' && <SysMetrics resourcesHistory={props.resourcesHistory}/> }
      { activeMenu === 'con' && <ConnMetrics resourcesHistory={props.resourcesHistory}/> }
    </>
  )

}

export default InstanceMetricsModal;