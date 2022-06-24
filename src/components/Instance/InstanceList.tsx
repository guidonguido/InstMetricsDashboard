import { useState, useEffect } from 'react';
import { InstanceMetricsContent } from "./InstanceMetrics"
import Search from 'antd/lib/input/Search';
import { Resources, getAvgCPU, getAvgMEM, getAvgNET, ConnInfo } from '../../models/Resources';
import { DashboardError } from '../../models/DashboardError';
import InstanceStatus, { InstanceStatusContent } from '../Columns/InstanceStatus';
import CPUStatus from '../Columns/CPUStatus';
import MEMStatus from '../Columns/MEMStatus';
import NETStatus from '../Columns/NETStatus';
import Table from 'antd/lib/table/Table';
import TableActions, { TableActionsContent } from '../Columns/TableActions';
import { Col, Row } from 'antd/lib/grid';
import { getInstances } from '../../API/ExamAgentAPI';
import Alert from 'antd/lib/alert';
import { getLabelFromIP } from '../../global/argument';
import ActiveConnections from '../Columns/ActiveConnections';
interface DataType {
  key: string;
  studentName: string;
  instanceStatus: InstanceStatusContent;
  CPU: Resources[],
  MEM: Resources[],
  NET: Resources[],
  activeConn: ConnInfo[],
  totalConn: number,
  actions: TableActionsContent
}

const InstanceList = () => {
  // Map<instanceUID, InstanceMetricsContent>
  const [instanceMap, setInstanceMap] = useState<Map<string, InstanceMetricsContent>>(new Map<string, InstanceMetricsContent>());
  const [connectedInstances, setConnectedInstances] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [instanceData, setInstanceData] = useState<DataType[]>([]);
  const [error, setError] = useState<DashboardError>({ activeError: false, errorMessage: "" });

  useEffect(() => {
    updateInstanceMap();
    const interval = setInterval(async () => {
      updateInstanceMap();
    }, 10000);

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect( () => {
    instanceMap.forEach(instance => {
      if (connectedInstances.indexOf(instance.instanceUID) === -1 && instance.phase === "Ready" && instance.instMetricsHost !== "unknown" ) {
        const updatePeriod = 4; // seconds
        const url = `wss://${instance.instMetricsHost}usages?updatePeriod=${updatePeriod}`;
        console.log("Connecting to ws: ", url)
        const ws = new WebSocket(url);
        setConnectedInstances((oldCI) => [...oldCI, instance.instanceUID]);

        //WebSocket management
        ws.onopen = () => {
          console.log(`WebSocket connected: ${ws.url}`);
        }
        
        ws.onerror = (error) => {
          console.log(`WebSocket error: ${error}`);
          instanceMap.get(instance.instanceUID)!.resourcesHistory = [];
          setConnectedInstances((oldCI) => oldCI.filter(ci => ci !== instance.instanceUID));
        }
        
        ws.onmessage = (e) => {
          try {
            setInstanceMap( oldInstanceMap => {
              let newIM = new Map(oldInstanceMap);
              if( newIM.has(instance.instanceUID) ) newIM.get(instance.instanceUID)!.resourcesHistory.push(JSON.parse(e.data.toString()));
              if( newIM.get(instance.instanceUID)!.resourcesHistory.length > 10 )  newIM.get(instance.instanceUID)!.resourcesHistory.shift();
              
              setInstanceData(mapInstanceData(newIM));
              return newIM;
            })
          } catch (error) {
            console.log(`WebSocket onmessage error: ${error}`);
          }
        }
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceMap])

  const updateInstanceMap = async () => {
    try {
      const instances: InstanceMetricsContent[] = await getInstances();

      setInstanceMap( oldInstanceMap => {
        let newInstanceMap = new Map(oldInstanceMap);
        instances.forEach(instance => {
          if (newInstanceMap.get(instance.instanceUID)?.phase != instance.phase ) newInstanceMap = newInstanceMap.set(instance.instanceUID, instance)
          if (!newInstanceMap.has(instance.instanceUID)) newInstanceMap = newInstanceMap.set(instance.instanceUID, instance)
        });

        // Remove instances that are no longer running or have been deleted
        Array.from(newInstanceMap).forEach(instance => {
          if (!instances.find(inst => inst.instanceUID === instance[0])) {
            newInstanceMap.delete(instance[0])
            setConnectedInstances((oldCI) => oldCI.filter(ci => ci !== instance[0]));
          }
        });
        setInstanceData(mapInstanceData(newInstanceMap));
        return newInstanceMap;
      })
    } catch (error) {
      console.log(`Error updating InstanceMap: `, error);
      setError({ activeError: true, errorMessage: "Error fetching instance list, please reload the page or check your authorizations" });
      setInstanceMap(new Map<string, InstanceMetricsContent>());
    }    
  }

  const mapInstanceData = (instanceMetrics: Map<string, InstanceMetricsContent>): DataType[] =>  {
    return Array.from(instanceMetrics).map( (instanceMetrics) => {
      const connections = instanceMetrics[1].resourcesHistory.at(-1)?.connections;
      let data: DataType = {
        key: instanceMetrics[0],
        studentName: `${instanceMetrics[1].studentName} ${instanceMetrics[1].studentId}`,
        instanceStatus: {resourcesHistory: instanceMetrics[1].resourcesHistory, running: instanceMetrics[1].running, submitted: instanceMetrics[1].submitted},
        CPU: instanceMetrics[1].resourcesHistory,
        MEM: instanceMetrics[1].resourcesHistory,
        NET: instanceMetrics[1].resourcesHistory,
        activeConn: connections != null? connections : [],
        totalConn: instanceMetrics[1].resourcesHistory.at(-1)?.connectionsCount || 0,
        actions: {instanceRefLink: instanceMetrics[1].instMetricsHost, resourcesHistory: instanceMetrics[1].resourcesHistory}
       } 
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
    const avgCPU_a = getAvgCPU(a.CPU);
    const avgCPU_b = getAvgCPU(b.CPU);
    const avgMEM_a = getAvgMEM(a.MEM);
    const avgMEM_b = getAvgMEM(b.MEM);

    let warning_a = 0;
    let warning_b = 0;

    if (avgCPU_a > 98) warning_a += 3;
    else if( avgCPU_a > 95 ) warning_a += 1;

    if (avgCPU_b > 98) warning_b += 3;
    else if( avgCPU_b > 95 ) warning_b += 1;

    if (avgMEM_a > 98) warning_a += 3;
    else if( avgMEM_a > 95 ) warning_a += 1;

    if (avgMEM_b > 98) warning_b += 3;
    else if( avgMEM_b > 95 ) warning_b += 1;

    if( !a.instanceStatus.running ) warning_a += -1;
    if( !b.instanceStatus.running ) warning_b += -1;

    return warning_a - warning_b;
  }

  const sortNET = (a: DataType, b: DataType): number => {
    let warning_a = 0;
    let warning_b = 0;
    const avgNET_a = getAvgNET(a.NET);
    const avgNET_b = getAvgNET(b.NET);
    
    if ( Array.from(avgNET_a).filter(e => e[1] > 800).length > 0 ) warning_a += 2;
    else if(Array.from(avgNET_a).filter(e => e[1] > getLabelFromIP(e[0]).latencyWarning).length > 0) warning_a += 1;

    if ( Array.from(avgNET_b).filter(e => e[1] > 800).length > 0 ) warning_b += 2;
    else if(Array.from(avgNET_b).filter(e => e[1] > getLabelFromIP(e[0]).latencyWarning).length > 0) warning_b += 1;
    
    return warning_a - warning_b;;
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
      align: "center" as const,
      render: (rh: InstanceStatusContent) => <InstanceStatus {...rh}/>,
      sorter: sortInstanceStatus,
    },
    {
      title: "CPU",
      dataIndex: "CPU",
      key: "CPU",
      align: "center" as const,
      render: (rh: Resources[]) => <CPUStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgCPU(a.CPU) - getAvgCPU(b.CPU),
    },
    {
      title: "MEM",
      dataIndex: "MEM",
      key: "MEM",
      align: "center" as const,
      render: (rh: Resources[]) => <MEMStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgMEM(a.MEM) - getAvgMEM(b.MEM),
    },
    {
      title: "NET",
      dataIndex: "NET",
      key: "NET",
      align: "center" as const,
      render: (rh: Resources[]) => <NETStatus resourcesHistory={rh}/>,
      sorter: sortNET
    },
    {
      title: 'Connections',
      children: [
        {
          title: "Active",
          dataIndex: "activeConn",
          key: "activeConn",
          align: "center" as const,
          render: (rh: ConnInfo[]) => <ActiveConnections connections={rh}/>,
          sorter: (a: DataType, b: DataType) => a.activeConn.length - b.activeConn.length,
        },
        {
          title: "Total from Start",
          dataIndex: "totalConn",
          key: "totalConn",
          align: "center" as const,
          sorter: (a: DataType, b: DataType) => a.totalConn - b.totalConn,
        },
      ]
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center" as const,
      render: (cnt: TableActionsContent) => <TableActions { ...cnt }  />
    },
  ]

  return (
    <>
    { error.activeError && 
      <Row justify='center' style={{paddingBottom:"30px"}}> 
        <Alert message={error.errorMessage} type="error" closable={false} showIcon/> 
      </Row> }
      <Row justify='center'>
        <Col lg={23} sm={24} xs={24} className="title instance-el">
          <Search placeholder="Search for student id" allowClear onChange={(e) => onSearch(e.target.value)} onSearch={onSearch} style={{ width: 400, marginBottom:40 }}/>
          <Table columns={tableColumns} dataSource={getFilteredInstanceData()} pagination={{ pageSize: 7 }} size="small"/>
        </Col>
      </Row>
    </>
    
  );
}

export default InstanceList;