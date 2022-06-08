import { FC } from 'react';
import { Gauge } from '@ant-design/plots';

export interface GaugeChartContent {
  percent: number;
  title: string;
  height?: string;
  width?: string;
  titleOffsetY?: number;
  titleFontSize?: string,
}

const GaugeChart: FC<GaugeChartContent> = props => {
  const config = {
    style:{height:"60px", width:"90px"},
    percent: (props.percent / 100) + 0.01 || 0.0,
    range: {
      color: 'l(1) 0:#B8E1FF 1:#3D76DD'
    },
    autoFit: true,
    startAngle: Math.PI,
    endAngle: 2 * Math.PI,
    indicator: false,
    statistic: {
      title: {
        offsetY: -36,
        style: {
          fontSize: "1.1em",
          color: '#4B535E'
        },
        formatter: () => '0%',
      },
      content: {
        style: {
          fontSize: '1em',
          lineHeight: '14px',
          color: '#4B535E',
          fontWeight: 'normal',
        },
        formatter: () => 'None',
      },
    },
  };

  props.percent > 99 && ( config.statistic.title.style.fontSize = "0.9em" );
  props.percent && (config.statistic.title.formatter = () => `${props.percent > 100 ? 100 : props.percent}%`);
  props.title && (config.statistic.content.formatter = () => props.title);
  props.height && (config.style.height = props.height);
  props.width && (config.style.width = props.width);
  props.titleOffsetY && (config.statistic.title.offsetY = props.titleOffsetY);
  props.titleFontSize && (config.statistic.title.style.fontSize = props.titleFontSize);
  
  return(
    <Gauge {...config} />
  ) 
};

export default GaugeChart;