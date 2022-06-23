import { FC, useEffect, useState } from 'react';
import { Col, Row } from "antd/lib";
import "./ModalContent.css";

export interface ConnectedColContet {
  IP: string,
  latency: number,
}

const ConnectedCol: FC<ConnectedColContet> = (props) => {
  const [IPCountry, setIPCountry] = useState<string>("IT");
  const [IPCity, setIPCity] = useState<string>(",Campobasso");
  const [IPprovider, setIPprovider] = useState<string>("");

  useEffect(() => {
    const getGeoInfo = () => {
      fetch(`https://ipapi.co/${props.IP}/json/`)
        .then((response) => {
          let data = response.json();
          data.then(response => {
            setIPCountry(`,${response.country_code}` || "unknown");
            setIPCity(response.city || "");
            setIPprovider(response.org || "unknown");
          })
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (props.IP && props.IP !== '') getGeoInfo();
  }, [props.IP]);

  return (
    <Col span={7} className="modal-content conn-text body-row">
      <Row justify="start"> IP: <span> {props.IP}</span> </Row>
      <Row justify="start"> From: <span> {IPCity}{IPCountry}</span> </Row>
      <Row justify="start"> Latency: <span> {props.latency}ms</span> </Row>
      <Row justify="start"> Provider: <span> {IPprovider}</span> </Row>
    </Col>
  )
}

export default ConnectedCol;