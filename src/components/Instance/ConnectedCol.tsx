import { FC, useEffect, useState } from 'react';
import LinePlot, { PlotData } from "../Chart/LinePlot";
import Col from "antd/lib/col";

export interface ConnectedColContet {
  IP: string,
  latency: number,
  data: PlotData[],
}

const ConnectedCol: FC<ConnectedColContet> = (props) => {
  const [IPCountry, setIPCountry] = useState<string>("IT");
  const [IPCity, setIPCity] = useState<string>("Campobasso");

  useEffect(() => {
    const getGeoInfo = () => {
      fetch(`https://ipapi.co/${props.IP}/json/`)
        .then((response) => {
          let data = response.json();
          data.then(response => {
            setIPCountry(response.country_code || "unknown");
            setIPCity(response.city || "unknown");
          })
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (props.IP && props.IP !== '') getGeoInfo();
  }, [props.IP]);

  return (
    <Col span={24} >
      <Col span={5} className="modal-content">
        <span> IP: {props.IP} FROM: {IPCity},{IPCountry}  Latency: {props.latency}ms </span>
      </Col>
      <Col span={19} className="modal-content">
        <LinePlot data={props.data}/>
      </Col>  
    </Col>
  )
}

export default ConnectedCol;