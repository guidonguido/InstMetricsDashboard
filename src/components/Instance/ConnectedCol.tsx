import { FC, useEffect, useState } from 'react';
import LinePlot, { PlotData } from "../Chart/LinePlot";
import { Col, Row } from "antd/lib";

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
    <Row justify="start" style={{width:'100%'}} className="body-row">
      <Col span={7} className="modal-content conn-text">
        <Row justify="start"> IP: <span>{props.IP}</span> </Row>
        <Row justify="start"> From: <span>{IPCity},{IPCountry}</span> </Row>
        <Row justify="start"> Latency: <span>{props.latency}ms</span> </Row>
      </Col>
      <Col span={17} className="modal-content">
        <LinePlot data={props.data}/>
      </Col>  
    </Row>
  )
}

export default ConnectedCol;