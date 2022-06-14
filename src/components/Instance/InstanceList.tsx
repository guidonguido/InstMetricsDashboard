import { useState, useEffect } from 'react';
import { getFakeResources } from "../../API/fakeResources";
import { InstaceMetricsContent } from "./InstanceMetrics"
import Search from 'antd/lib/input/Search';
import { Resources } from '../../models/Resources';
import WarningStatus from './WarningStatus';
import CPUStatus from './CPUStatus';
import MEMStatus from './MEMStatus';
import Table from 'antd/lib/table/Table';

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
  actions: string | undefined
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
      studentId: "s279127",
    } as InstaceMetricsContent);

    newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
      instanceUID: "inst-asdda2s",
      resourcesHistory: [],
      studentName: "Petre Ricioppo",
      studentId: "s283341",
      instMetricsHost: "192.168.122.251:6080"
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
      const url = `ws://${instanceMap.get("inst-asdda2s")!.instMetricsHost}/usages?updatePeriod=${updatePeriod}`;
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
      let data: DataType = {
        key: instanceMetrics[0],
        studentName: instanceMetrics[1].studentName,
        instanceStatus: instanceMetrics[1].resourcesHistory,
        CPU: instanceMetrics[1].resourcesHistory,
        MEM: instanceMetrics[1].resourcesHistory,
        poliWiredCount: instanceMetrics[1].resourcesHistory.at(-1)?.connections !== null? instanceMetrics[1].resourcesHistory.at(-1)?.connections.length : 0,
        poliWirelessCount: instanceMetrics[1].resourcesHistory.at(-1)?.connections !== null? instanceMetrics[1].resourcesHistory.at(-1)?.connections.length : 0,
        outsideCount: instanceMetrics[1].resourcesHistory.at(-1)?.connections !== null? instanceMetrics[1].resourcesHistory.at(-1)?.connections.length : 0,
        //closedCount: instanceMetrics[1].resourcesHistory.at(-1)?.connections !== null? instanceMetrics[1].resourcesHistory.at(-1)?.connections.length : 0,
        actions: instanceMetrics[1].instMetricsHost
      } 
      // data.closedCount = (instanceMetrics[1].resourcesHistory.at(-1)?.connectionsCount - (data.poliWiredCount + data.poliWirelessCount + data.outsideCount)) || 0;
      return data;
    })
  }

  const getFilteredInstanceMap = () => {
    return new Map(
      Array.from(instanceMap).filter( ([_, value]) => {
        return value.studentName.toLowerCase().includes(searchInput.toLowerCase()) ||
        value.studentId.toLowerCase().includes(searchInput.toLowerCase()) 
      })
    )
  }

  const onSearch = (value: string) => {
    setSearchInput(value);
    if (value !== "") setInstanceData(mapInstanceData(getFilteredInstanceMap()));
  }

  const tableColumns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Instance Status",
      dataIndex: "instanceStatus",
      key: "instanceStatus",
      render: (rh: Resources[]) => <WarningStatus resourcesHistory={rh}/>
    },
    {
      title: "CPU",
      dataIndex: "CPU",
      key: "CPU",
      render: (rh: Resources[]) => <CPUStatus resourcesHistory={rh}/>
    },
    {
      title: "MEM",
      dataIndex: "MEM",
      key: "MEM",
      render: (rh: Resources[]) => <MEMStatus resourcesHistory={rh}/>
    },
    {
      title: "PoliTO wired conn.",
      dataIndex: "poliWiredCount",
      key: "poliWiredCount",
    },
    {
      title: "PoliTO wireless conn.",
      dataIndex: "poliWirelessCount",
      key: "poliWirelessCount",
    },
    {
      title: "Outside connections",
      dataIndex: "outsideCount",
      key: "outsideCount",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
    },
  ]

  return (
    <>
      <Search placeholder="Search student name or student id" allowClear onChange={(e) => onSearch(e.target.value)} onSearch={onSearch} style={{ width: 400, marginBottom:40 }}/>
      <Table columns={tableColumns} dataSource={instanceData} pagination={{ pageSize: 10 }}/>
    </>
  );
}

export default InstanceList;