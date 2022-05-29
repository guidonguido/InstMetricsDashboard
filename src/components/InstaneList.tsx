import { FC, useState, useEffect } from 'react';
import {Row, Col} from 'antd/lib/grid';
import { ConnInfo, Resources } from "../models/Resources";
import GaugeChart from "./GaugeChart";
import { List } from 'antd';
import "./InstanceList.css"

export interface InnstaceMetricsContent {
  instanceUID: string;
  resourcesHisory: Resources[];
  studentName: string;
  studentId: string;
}

const InstanceList = () => {
  const [instanceMap, setInstanceMap] = useState<Map<string, InnstaceMetricsContent>>(new Map<string, InnstaceMetricsContent>());

  useEffect(() => {
    const resJsonObj1 = JSON.parse(`
    {
      "connections":[
         {
            "latency":212,
            "IP":"1.1.1.1",
            "connUid":"aadsas3"
         },
         {
            "latency":12,
            "IP":"1.1.1.1",
            "connUid":"a22adsas"
         }
      ],
      "timestamp": "2021-01-01T00:00:00.000Z",
      "cpu":5,
      "mem":5
   }`);
    
    const resJsonObj2 = JSON.parse(`
    {
      "connections":[
         {
            "latency":12,
            "IP":"2.3.1.1",
            "connUid":"aa2dsas3"
         },
         {
            "latency":12,
            "IP":"1.4.1.1",
            "connUid":"a2221adsas"
         }
      ],
      "timestamp": "2020-01-01T00:00:00.000Z",
      "cpu":80,
      "mem":12
   }`);

    const resList: Resources[] = [resJsonObj1 as Resources, resJsonObj2 as Resources];

    let newInstanceMap = new Map(instanceMap);

    if ( newInstanceMap.has("inst-asdasdas") ) {
      newInstanceMap.get("inst-asdasdas")!.resourcesHisory.push(resList[0]);
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
        instanceUID: "inst-asdasdas",
        resourcesHisory: [resList[0]],
        studentName: "Guido Ricioppo",
        studentId: "s279127",
      } as InnstaceMetricsContent);
    }

    if ( newInstanceMap.has("inst-asdda2s") ) {
      newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(resList[1]);
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
        instanceUID: "inst-asdda2s",
        resourcesHisory: [resList[1]],
        studentName: "Petre Ricioppo",
        studentId: "s283341",
      } as InnstaceMetricsContent);
    }

    console.log("setting InstanceMap: ", newInstanceMap);
    setInstanceMap(newInstanceMap);
    console.log("intancemap new Array values: ", Array.from(newInstanceMap.values()));
    console.log("intancemap old Array values: ", Array.from(instanceMap.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {Array.from(instanceMap.values()).map((imc: InnstaceMetricsContent) => < InstanceMetrics key={imc.instanceUID} {...imc} />)}
    </>
  );
}

const InstanceMetrics: FC<InnstaceMetricsContent> = props => {
  console.log("InstanceMetrics" + props.instanceUID);
  return (
    <div className='instance-box'>
      <Row justify="center">
        < Col span={18} className="title instance-el">{props.studentName.toUpperCase()} {props.studentId.toLowerCase()}</Col>
      </Row>
      <Row justify="center">
        < Col span={6} className="utilization-box instance-el">
          CPU UTILIZATION
          <Row>
            <Col span={12}> <GaugeChart title="CPU" percent={props.resourcesHisory.at(-1)!.cpu}/> </Col>
            <Col span={12}><GaugeChart title="MEM" percent={props.resourcesHisory.at(-1)!.mem}/></Col>
          </Row>
        </Col>
        < Col span={12} className="utilization-grp instance-el">
          <Row justify='center'> CPU HYSTORIC GRAPH </Row>
          {props.resourcesHisory.map((res: Resources, index: number) => <Row key={"cpu"+props.instanceUID+index} justify="start">{`Time: ${new Date(res.timestamp)} CPU:${res.cpu}%`}</Row>)}
        </Col>
      </Row>
      <Row justify="center">
        < Col span={18} className="connections-box instance-el">
          <Row justify="center">CONNECTED PAGES</Row>
          <List>
            {props.resourcesHisory.at(-1)!.connections.map((conn: ConnInfo) => <List.Item key={conn.connUid}>IP: {conn.IP} Latency: {conn.latency}ms</List.Item>)}
          </List>
        </Col>
      </Row>
    </div>
  )
}

export default InstanceList;