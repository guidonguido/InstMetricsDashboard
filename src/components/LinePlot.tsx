import { FC } from 'react';
import { Line } from '@ant-design/plots';

export interface PlotData {
  type: string;
  value?: number;
  timestamp: number;
}

export interface LinePlotContent {
  data: PlotData[];
}

const LinePlot: FC<LinePlotContent> = (props) => {
  const config = {
    width:400,
    height:150,
    autoFit: true,
    data: props.data,
    xField: 'timestamp',
    yField: 'CPU',
    xAxis: {
      tickCount: 10,
    },
    yAxis: { max: NaN },
    smooth: true,
    connectNulls: false,
  };

  props.data[0].type === 'CPU' && (config.yAxis.max = 100);

  return <Line {...config} />;
};

export default LinePlot;
