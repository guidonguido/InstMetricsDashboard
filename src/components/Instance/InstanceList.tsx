import { useState, useEffect } from 'react';
import { getFakeResources } from "../../API/fakeResources";
import { InstaceMetricsContent } from "./InstanceMetrics"
import Search from 'antd/lib/input/Search';
import { Resources, getAvgCPU, getAvgMEM, getAvgNET, ConnInfo } from '../../models/Resources';
import WarningStatus from './WarningStatus';
import CPUStatus from './CPUStatus';
import MEMStatus from './MEMStatus';
import Table from 'antd/lib/table/Table';
import TableActions, { TableActionsContent } from './TableActions';
import { Col, Row } from 'antd/lib/grid';
import ipRangeCheck from 'ip-range-check';

interface DataType {
  key: string;
  studentName: string;
  instanceStatus: Resources[];
  CPU: Resources[],
  MEM: Resources[],
  poliWiredCount: number | undefined,
  poliWirelessCount: number | undefined,
  outsideCount: number | undefined,
  closedCount?: number | undefined,
  actions: TableActionsContent
}

const InstanceList = () => {
  // Map<instanceUID, InstanceMetricsContent>
  const [instanceMap, setInstanceMap] = useState<Map<string, InstaceMetricsContent>>(new Map<string, InstaceMetricsContent>());
  const [searchInput, setSearchInput] = useState("");
  const [fakeMapIndex, setFakeMapIndex] = useState(0);
  const [isStateInitialized, setIsStateInitialized] = useState(false);
  const [instanceData, setInstanceData] = useState<DataType[]>([]);

  useEffect(() => {
    let newInstanceMap = new Map(instanceMap);

    newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
      instanceUID: "inst-asdasdas",
      resourcesHistory: [],
      studentName: "Guido Ricioppo",
      studentId: "s279127"
    } as InstaceMetricsContent);

    newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
      instanceUID: "inst-asdda2s",
      resourcesHistory: [],
      studentName: "Petre Ricioppo",
      studentId: "s283341",
      instMetricsHost: "exercise.crownlabs.polito.it/instance/0adc3cd8-3ba0-4581-8e91-68080a2b3734/app/"
    } as InstaceMetricsContent);

    setInstanceMap(newInstanceMap);
  
    /** 
    if ( newInstanceMap.has("inst-asdasdas") ) {
      newInstanceMap.get("inst-asdasdas")!.resourcesHisory.push(resList[0]);
      if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      }
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
        instanceUID: "inst-asdasdas",
        resourcesHisory: [resList[0]],
        studentName: "Guido Ricioppo",
        studentId: "s279127",
      } as InnstaceMetricsContent);
    }

    if ( newInstanceMap.has("inst-asdda2s") ) {
      newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(resList[2]);
      if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      }
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
        instanceUID: "inst-asdda2s",
        resourcesHisory: [],
        studentName: "Petre Ricioppo",
        studentId: "s283341",
      } as InnstaceMetricsContent);
    }*/

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect( () => {

    if( instanceMap.has("inst-asdda2s") && !isStateInitialized ) {
      /* Setup WS connection(s) */
      const updatePeriod = 2; // seconds
      const url = `wss://${instanceMap.get("inst-asdda2s")!.instMetricsHost}usages?updatePeriod=${updatePeriod}`;
      const ws = new WebSocket(url);
      
      setIsStateInitialized(true);

      //WebSocket management
      ws.onopen = () => {
        console.log(`WebSocket connected: ${ws.url}`);
      }
      
      ws.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
      }
      
      ws.onmessage = (e) => {
        try {
          console.log(`WebSocket message: ${e.data.toString()}`);

          let newIM = new Map(instanceMap);
          newIM.get("inst-asdda2s")!.resourcesHistory.push(JSON.parse(e.data.toString()));
          if( newIM.get("inst-asdda2s")!.resourcesHistory.length > 10 )  newIM.get("inst-asdda2s")!.resourcesHistory.shift();

          setInstanceMap(newIM);
          setInstanceData(mapInstanceData(newIM));

          // setInstanceMap( (oldIM) => {
          //   const newIM = new Map(oldIM);
          //   newIM.get("inst-asdda2s")!.resourcesHistory.push(JSON.parse(e.data.toString()));
          //   if( newIM.get("inst-asdda2s")!.resourcesHistory.length > 10 )  newIM.get("inst-asdda2s")!.resourcesHistory.shift();
          //   return newIM;
          // })
          setFakeMapIndex((oldIndex) => oldIndex+1);
        } catch (error) {
          console.log(`WebSocket onmessage error: ${error}`);
        }
      }
    }
  }, [instanceMap, isStateInitialized])

  useEffect( () => {
    if( isStateInitialized ){
      let newInstanceMap = new Map(instanceMap);
      let fr1 = getFakeResources(fakeMapIndex%30);
      // let fr2 = getFakeResources(29- fakeMapIndex%30);
      console.log(fr1);
      newInstanceMap.get("inst-asdasdas")!.resourcesHistory.push(JSON.parse(fr1));
      if(newInstanceMap.get("inst-asdasdas")!.resourcesHistory.length > 10) {
        newInstanceMap.get("inst-asdasdas")!.resourcesHistory.shift();
      };

      // newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(JSON.parse(fr2));
      // if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
      //   newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      // };
      setInstanceMap(newInstanceMap);
      setInstanceData(mapInstanceData(newInstanceMap));
    } 
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fakeMapIndex, isStateInitialized]);

  const mapInstanceData = (instanceMetrics: Map<string, InstaceMetricsContent>): DataType[] =>  {
    return Array.from(instanceMetrics).map( (instanceMetrics) => {
      const connections = instanceMetrics[1].resourcesHistory.at(-1)?.connections;
      let data: DataType = {
        key: instanceMetrics[0],
        studentName: `${instanceMetrics[1].studentName} ${instanceMetrics[1].studentId}`,
        instanceStatus: instanceMetrics[1].resourcesHistory,
        CPU: instanceMetrics[1].resourcesHistory,
        MEM: instanceMetrics[1].resourcesHistory,
        poliWiredCount: connections != null? connections!.filter((c: ConnInfo) =>  ipRangeCheck(c.ip, "130.192.0.0/16")).length : 0,
        poliWirelessCount: connections != null? connections!.filter((c: ConnInfo) =>  ipRangeCheck(c.ip, "130.192.0.0/16")).length : 0,
        outsideCount: connections != null? connections!.filter((c: ConnInfo) =>  !ipRangeCheck(c.ip, "30.192.0.0/16")).length : 0,
        closedCount: connections != null? (instanceMetrics[1].resourcesHistory.at(-1)!.connectionsCount - connections!.length) : 0,
        actions: {instanceRefLink: instanceMetrics[1].instMetricsHost, resourcesHistory: instanceMetrics[1].resourcesHistory}
      } 
      // data.closedCount = (instanceMetrics[1].resourcesHistory.at(-1)?.connectionsCount - (data.poliWiredCount + data.poliWirelessCount + data.outsideCount)) || 0;
      return data;
    })
  }

  const getFilteredInstanceData = (): DataType[] => {
    if (searchInput === "")  return instanceData 
    return instanceData.filter( (data) => data.studentName.toLowerCase().includes(searchInput.toLowerCase()) )
  }

  const onSearch = (value: string) => {
    setSearchInput(value);
  }

  const sortInstanceStatus = (a: DataType, b: DataType): number => {
    const avgCPU_a = getAvgCPU(a.CPU)
    const avgCPU_b = getAvgCPU(b.CPU)
    const avgMEM_a = getAvgMEM(a.MEM)
    const avgMEM_b = getAvgMEM(b.MEM)
    const avgNET_a = getAvgNET(a.instanceStatus)
    const avgNET_b = getAvgNET(b.instanceStatus)

    let warning_a = 0
    let warning_b = 0

    if (avgCPU_a > 98) warning_a += 3
    else if( avgCPU_a > 95 ) warning_a += 1

    if (avgCPU_b > 98) warning_b += 3
    else if( avgCPU_b > 95 ) warning_b += 1

    if (avgMEM_a > 98) warning_a += 3
    else if( avgMEM_a > 95 ) warning_a += 1

    if (avgMEM_b > 98) warning_b += 3
    else if( avgMEM_b > 95 ) warning_b += 1

    if (avgNET_a !== undefined && (avgNET_a!.filter(e => e > 800).length > 0)) warning_a += 3
    else if(avgNET_a !== undefined && (avgNET_a!.filter(e => e > 200).length > 0)) warning_a += 1

    if (avgNET_b !== undefined && (avgNET_b!.filter(e => e > 800).length > 0)) warning_b += 3
    else if(avgNET_b !== undefined && (avgNET_b!.filter(e => e > 200).length > 0)) warning_b += 1

    return warning_a - warning_b

  }

  const tableColumns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a: DataType, b: DataType) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Instance Status",
      dataIndex: "instanceStatus",
      key: "instanceStatus",
      render: (rh: Resources[]) => <WarningStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgCPU(a.CPU) - getAvgCPU(b.CPU),
    },
    {
      title: "CPU",
      dataIndex: "CPU",
      key: "CPU",
      render: (rh: Resources[]) => <CPUStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgCPU(a.CPU) - getAvgCPU(b.CPU),
    },
    {
      title: "MEM",
      dataIndex: "MEM",
      key: "MEM",
      render: (rh: Resources[]) => <MEMStatus resourcesHistory={rh}/>,
      sorter: sortInstanceStatus
    },
    {
      title: 'Connections',
      children: [
        {
          title: "PoliTO wired",
          dataIndex: "poliWiredCount",
          key: "poliWiredCount",
        },
        {
          title: "PoliTO wireless",
          dataIndex: "poliWirelessCount",
          key: "poliWirelessCount",
        },
        {
          title: "Outsiders",
          dataIndex: "outsideCount",
          key: "outsideCount",
        },
        {
          title: "Closed",
          dataIndex: "closedCount",
          key: "closedCount",
        },
      ]
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (cnt: TableActionsContent) => <TableActions { ...cnt }  />
    },
  ]

  return (
    <Row justify='center'>
      < Col lg={23} sm={24} xs={24} className="title instance-el">
        <Search placeholder="Search student name or student id" allowClear onChange={(e) => onSearch(e.target.value)} onSearch={onSearch} style={{ width: 400, marginBottom:40 }}/>
        <Table columns={tableColumns} dataSource={getFilteredInstanceData()} pagination={{ pageSize: 10 }} size="small"/>
      </Col>
    </Row>
  );
}

export default InstanceList;