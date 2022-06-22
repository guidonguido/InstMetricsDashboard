import { useState, useEffect } from 'react';
import { InstanceMetricsContent } from "./InstanceMetrics"
import Search from 'antd/lib/input/Search';
import { Resources, getAvgCPU, getAvgMEM, getAvgNET, ConnInfo } from '../../models/Resources';
import { DashboardError } from '../../models/DashboardError';
import WarningStatus from './WarningStatus';
import CPUStatus from './CPUStatus';
import MEMStatus from './MEMStatus';
import Table from 'antd/lib/table/Table';
import TableActions, { TableActionsContent } from './TableActions';
import { Col, Row } from 'antd/lib/grid';
import ipRangeCheck from 'ip-range-check';
import { getInstances } from '../../API/ExamAgentAPI';
import Alert from 'antd/lib/alert';
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
      if (connectedInstances.indexOf(instance.instanceUID) === -1 ) {
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
            console.log(`WebSocket message: ${e.data.toString()}`);
            setInstanceMap( oldInstanceMap => {
              let newIM = new Map(oldInstanceMap);
              newIM.get(instance.instanceUID)!.resourcesHistory.push(JSON.parse(e.data.toString()));
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
      console.log(`Error updating InstanceMap: ${error}`);
      setError({ activeError: true, errorMessage: "Error fetching instance list" });
      setInstanceMap(new Map<string, InstanceMetricsContent>());
    }    
  }

  const mapInstanceData = (instanceMetrics: Map<string, InstanceMetricsContent>): DataType[] =>  {
    return Array.from(instanceMetrics).map( (instanceMetrics) => {
      const connections = instanceMetrics[1].resourcesHistory.at(-1)?.connections;
      const connectionsCount = instanceMetrics[1].resourcesHistory.at(-1)?.connectionsCount || 0;
      let data: DataType = {
        key: instanceMetrics[0],
        studentName: `${instanceMetrics[1].studentName} ${instanceMetrics[1].studentId}`,
        instanceStatus: instanceMetrics[1].resourcesHistory,
        CPU: instanceMetrics[1].resourcesHistory,
        MEM: instanceMetrics[1].resourcesHistory,
        poliWiredCount: connections != null? connections!.filter((c: ConnInfo) =>  ipRangeCheck(c.ip, "130.192.0.0/16")).length : 0,
        poliWirelessCount: connections != null? connections!.filter((c: ConnInfo) =>  ipRangeCheck(c.ip, "130.192.0.0/16")).length : 0,
        outsideCount: connections != null? connections!.filter((c: ConnInfo) =>  !ipRangeCheck(c.ip, "30.192.0.0/16")).length : 0,
        closedCount: connections != null? (connectionsCount - connections!.length) : connectionsCount,
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
      align: "center" as const,
      render: (rh: Resources[]) => <WarningStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgCPU(a.CPU) - getAvgCPU(b.CPU),
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
      sorter: sortInstanceStatus
    },
    {
      title: 'Connections',
      children: [
        {
          title: "PoliTO wired",
          dataIndex: "poliWiredCount",
          key: "poliWiredCount",
          align: "center" as const,
        },
        {
          title: "PoliTO wireless",
          dataIndex: "poliWirelessCount",
          key: "poliWirelessCount",
          align: "center" as const,
        },
        {
          title: "Outsiders",
          dataIndex: "outsideCount",
          key: "outsideCount",
          align: "center" as const,
        },
        {
          title: "Closed",
          dataIndex: "closedCount",
          key: "closedCount",
          align: "center" as const,
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
          <Search placeholder="Search student name or student id" allowClear onChange={(e) => onSearch(e.target.value)} onSearch={onSearch} style={{ width: 400, marginBottom:40 }}/>
          <Table columns={tableColumns} dataSource={getFilteredInstanceData()} pagination={{ pageSize: 10 }} size="small"/>
        </Col>
      </Row>
    </>
    
  );
}

export default InstanceList;