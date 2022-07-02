
import { Row } from "antd";
import { Content } from "antd/lib/layout/layout";
import { ReactComponent as GrnSvg } from  '../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../assets/red-stat.svg';

/**
 * Homapege Table Columns Popover content
 */
export const InstanceStatusPopoverCont = (
  <Content>
    <Row> <GrnSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Current CPU, Memory are under warning threshold. </Row>
    <Row> <YelSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 CPU or Memory registered values is over alarm thresholds. </Row>
    <Row> <RedSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 CPU or Memory registered values is over critical thresholds. Experience may be degraded. </Row>
  </Content>
);

export const CPUPopoverCont = (
  <Content>
    <Row> <GrnSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Current CPU usage is under warning threshold. </Row>
    <Row> <YelSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 CPU registered values is over alarm thresholds. </Row>
    <Row> <RedSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 CPU registered values is over critical thresholds. Experience may be degraded. </Row>
  </Content>
);

export const MEMPopoverCont = (
  <Content>
    <Row> <GrnSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Current Memory is under warning threshold. </Row>
    <Row> <YelSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 Memory registered values is over alarm thresholds. </Row>
    <Row> <RedSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Avg of the last 10 Memory registered values is over critical thresholds. Experience may be degraded. </Row>
  </Content>
);

export const NETPopoverCont = (
  <Content>
    <Row>
      Color signals indicates the quality of the network connection(s) based on RTT of ping packets from the server to the browser client.
    </Row>
    <Row>
      RTT typically increases when a network is congested, C/S distance increases or when the server and/or client is under heavy load.
    </Row>
    <Row> <GrnSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> Current RTTs are under warning threshold. </Row>
    <Row> <YelSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> (Maximum) Avg of the last 10 RTT values is over alarm thresholds. </Row>
    <Row> <RedSvg width={'15px'} height={'15px'} style={{paddingTop:'5px'}}/> (Maximum) Avg of the last 10 RTT values is over critical thresholds. Experience may be degraded. </Row>
  </Content>
);

export const ActiveConnPopoverCont = (
  <div>
    Number of current connections to the instance.
  </div>
);

export const TotalConnPopoverCont = (
  <div>
    Total number of connections to the instance. It includes active and closed connections.
  </div>
);