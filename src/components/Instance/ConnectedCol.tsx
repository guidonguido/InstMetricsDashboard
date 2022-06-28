import { FC, useEffect, useState } from 'react';
import { ConnInfo } from '../../models/Resources';
import { Col, Row, Tag } from "antd/lib";
import "./ModalContent.css";

export interface ConnectedColContet {
  connInfo: ConnInfo;
}

const ConnectedCol: FC<ConnectedColContet> = (props) => {
  const [IPCountry, setIPCountry] = useState<string>("IT");
  const [IPCity, setIPCity] = useState<string>(",Campobasso");
  const [IPprovider, setIPprovider] = useState<string>("");

  useEffect(() => {
    const getGeoInfo = () => {
      fetch(`https://ipapi.co/${props.connInfo.ip}/json/`)
        // fetch(`https://cldashboard.guidongui.it/api/ipapi/${props.IP}`)
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

    if (props.connInfo.ip && props.connInfo.ip !== '') getGeoInfo();
  }, [props.connInfo.ip]);

  return (
    <Col span={7} className="modal-content conn-text body-row">
      <Row justify="start"> State: {( props.connInfo.active && <Tag color='green'>Connected</Tag> ) || <Tag color='red'>Disconnected</Tag> } </Row>
      <Row justify="start"> IP: <span> {props.connInfo.ip}</span> </Row>
      <Row justify="start"> From: <span> {IPCity}{IPCountry}</span> </Row>
      {props.connInfo.active && <Row justify="start"> Latency: <span> {props.connInfo.latency} ms</span> </Row>}
      <Row justify="start"> Connection Time: <span> {new Date(props.connInfo.connTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'})}</span> </Row>
      {!props.connInfo.active && <Row justify="start"> Disconnection Time: <span> {new Date(props.connInfo.disconnTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'})}</span> </Row>}
      <Row justify="start"> Provider: <span> {IPprovider}</span> </Row>
    </Col>
  )
}

export default ConnectedCol;