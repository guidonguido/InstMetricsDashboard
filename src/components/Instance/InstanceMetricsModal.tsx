import { FC } from "react";
import { Resources } from "../../models/Resources";
import SysMetrics from './SysMetrics';
import ConnMetrics from './ConnMetrics';
import { Col, Row } from "antd";

export interface InstanceMetricsModalContent {
  instanceRefLink?: string,
  resourcesHistory: Resources[]
}  

const InstanceMetricsModal: FC<InstanceMetricsModalContent> = (props) => {
  return (
    <>
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