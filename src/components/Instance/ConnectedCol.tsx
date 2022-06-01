import { FC } from 'react';
import LinePlot, { PlotData } from "../Chart/LinePlot";
import Col from "antd/lib/col";

export interface ConnectedColContet {
  IP: string,
  latency: number,
  data: PlotData[],
}

const ConnectedCol: FC<ConnectedColContet> = (props) => {
  return (
    <Col  lg={12} sm={24} xs={24}  >
      <span> IP: {props.IP} Latency: {props.latency}ms </span>
      <LinePlot data={props.data}/>
    </Col>
  )
}

export default ConnectedCol;