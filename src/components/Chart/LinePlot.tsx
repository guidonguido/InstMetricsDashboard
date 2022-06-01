import { FC } from 'react';
import { Line } from "@ant-design/plots";
import "./LinePlot.css";

export interface PlotData {
  type: string;
  value?: number;
  timestamp: number;
}

export interface LinePlotContent {
  data: PlotData[];
}

const LinePlot: FC<LinePlotContent> = (props) => {
  let config = {
    style:{transition:"none"},
    renderer: "svg" as const,
    height:150,
    autoFit: true,
    data: props.data,
    xField: 'timestamp',
    yField: 'value',
    tooltip: {
      fields: ['value'], 
      title: props.data[0].type === 'CPU' ? 'CPU %' : 'Latency ms',  
    },
    label: {
      type: 'inner',
      style: {
        fill: 'red',
        opacity: 0.6,
        fontSize: 24
      }
    },
    xAxis: {
      tickCount: 0,
      animate: false,
    },
    yAxis: { },
    smooth: false,
    connectNulls: false,
  };

  props.data[0].type === 'CPU' && (config.yAxis = 
    { label: {
        formatter: (v:number) => `${v} %`,
      },
      max:100,
      animate: false,
    });
  
  props.data[0].type === 'Latency' && (config.yAxis = 
    { label: {
        autoHide: true,
        formatter: (v:number) => `${v} ms`,
      },
      animate: false,
    });
  

  return <Line {...config} />;
};

export default LinePlot;
