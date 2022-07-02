import { useState, useEffect } from 'react';
import { getInstances } from '../../API/ExamAgentAPI';
import { Col, Row, Table, Popover, Alert } from 'antd';
import Search from 'antd/lib/input/Search';
import { SortOrder } from 'antd/lib/table/interface';
import { Resources, getAvgCPU, getAvgMEM, ConnInfo } from '../../models/Resources';
import { InstanceStatusPopoverCont, CPUPopoverCont, 
  MEMPopoverCont, NETPopoverCont, ActiveConnPopoverCont, TotalConnPopoverCont } from '../../models/PopoverContent';
import { DashboardError } from '../../models/DashboardError';
import Filters from './Filters';
import InstanceStatus, { InstanceStatusContent } from '../Columns/InstanceStatus';
import TableActions, { TableActionsContent } from '../Columns/TableActions';
import ActiveConnections from '../Columns/ActiveConnections';
import TotalConnections from '../Columns/TotalConnections';
import CPUStatus from '../Columns/CPUStatus';
import MEMStatus from '../Columns/MEMStatus';
import NETStatus from '../Columns/NETStatus';
import { getLabelFromIP } from '../../global/argument';

interface DataType {
  key: string;
  studentName: string;
  instanceStatus: InstanceStatusContent;
  CPU: Resources[],
  MEM: Resources[],
  NET: Resources[],
  activeConn: ConnInfo[],
  totalConn: ConnInfo[],
  actions: TableActionsContent
}

export interface InstanceMetricsContent {
  phase: string,
  running: boolean,
  submitted: boolean,
  instanceUID: string,
  instMetricsHost?: string,
  resourcesHistory: Resources[],
  studentName: string | undefined,
  studentId: string | undefined,
  codIns: string,
  quizID: string,
}

const InstanceList = () => {
  // Map<instanceUID, InstanceMetricsContent>
  const [instanceMap, setInstanceMap] = useState<Map<string, InstanceMetricsContent>>(new Map<string, InstanceMetricsContent>());
  const [connectedInstances, setConnectedInstances] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [instanceData, setInstanceData] = useState<DataType[]>([]);
  const [runningOnly, setRunningOnly] = useState(false);
  const [error, setError] = useState<DashboardError>({ activeError: false, errorMessage: "" });
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [lastWsMessage, setLastWsMessage] = useState<Date>(new Date());
  // const [quizList, setQuizList] = useState<QuizIns[]>([]);

  // on component mount
  useEffect(() => {
    updateInstanceMap();
    const interval = setInterval(async () => {
      updateInstanceMap();
    }, 10000);

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when instanceMap is updated
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
          console.log(`WebSocket error: `, error);
          instanceMap.get(instance.instanceUID)!.resourcesHistory = [];
          setConnectedInstances((oldCI) => oldCI.filter(ci => ci !== instance.instanceUID));
        }
        
        ws.onmessage = (e) => {
          try {
            if( !instanceMap.has(instance.instanceUID) || instanceMap.get(instance.instanceUID)?.phase !== "Ready" ) {
              ws.close();
              setConnectedInstances((oldCI) => oldCI.filter(ci => ci !== instance.instanceUID));
              console.log(`WebSocket connected closed due to ${instanceMap.get(instance.instanceUID)?.phase} instance: ${ws.url}`);
              return;
            }
            
            setInstanceMap( oldInstanceMap => {
              let newIM = new Map(oldInstanceMap);
              if( newIM.has(instance.instanceUID) ) {
                newIM.get(instance.instanceUID)!.resourcesHistory.push(JSON.parse(e.data.toString()));
                if( newIM.get(instance.instanceUID)!.resourcesHistory.length > 10 )  {
                  newIM.get(instance.instanceUID)!.resourcesHistory.shift();
                }
              }
              setLastWsMessage(new Date());
              setInstanceData(mapInstanceData(newIM));
              return newIM;
            })
          } catch (error) {
            console.log(`WebSocket onmessage error: `, error);
          }
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceMap])

  const updateInstanceMap = async () => {
    try {
      const instances: InstanceMetricsContent[] = await getInstances();

      setLastWsMessage( oldData => {
        if(oldData.getTime() + 15000 < new Date().getTime() && instances.filter(i => i.phase === "Ready").length > 0) {
          setError({ activeError: true, errorMessage: "Page data may not be up to date. Please refresh the page." });
        } else {
          setError({ activeError: false, errorMessage: "" });
        }
        return oldData;
      })

      // setQuizList( instances.map(i => ({ codIns: i.codIns, quizID: i.quizID })).filter(i => i.codIns !== undefined || i.quizID !== undefined) );

      setInstanceMap( oldInstanceMap => {
        let newInstanceMap = new Map(oldInstanceMap);
        instances.forEach(instance => {
          if (newInstanceMap.get(instance.instanceUID)?.phase !== instance.phase ) newInstanceMap = newInstanceMap.set(instance.instanceUID, instance)
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
        studentName: instanceMetrics[1].studentId ? instanceMetrics[1].studentId : instanceMetrics[1].instanceUID,
        instanceStatus: {resourcesHistory: instanceMetrics[1].resourcesHistory, running: instanceMetrics[1].running, phase: instanceMetrics[1].phase, submitted: instanceMetrics[1].submitted},
        CPU: instanceMetrics[1].resourcesHistory,
        MEM: instanceMetrics[1].resourcesHistory,
        NET: instanceMetrics[1].resourcesHistory,
        activeConn: connections != null? connections.filter((conn: ConnInfo) => conn.active) : [],
        totalConn: connections != null? connections : [],
        actions: {instanceRefLink: instanceMetrics[1].instMetricsHost, resourcesHistory: instanceMetrics[1].resourcesHistory}
       } 
      return data;
    })
  }

  const getFilteredInstanceData = (): DataType[] => {
    let newInstanceData  = instanceData;
    if (searchInput !== "")  newInstanceData = instanceData.filter( (data) => data.studentName.toLowerCase().includes(searchInput.toLowerCase()) )
    if( runningOnly ) newInstanceData = newInstanceData.filter(i => i.instanceStatus.running);
    return newInstanceData;
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
    if( a.NET.at(-1)?.connections?.length === 0 || a.NET.length === 0 ) return -1;

    const maxLatency_a = Math.max(...a.NET.at(-1)?.connections?.map((conn: ConnInfo) => conn.latency) || [0]);
    const maxLatency_b = Math.max(...b.NET.at(-1)?.connections?.map((conn: ConnInfo) => conn.latency) || [0]);
    return maxLatency_a - maxLatency_b;
  }

  const sortActiveConnections = (a: DataType, b: DataType): number => {
    if( a.NET.at(-1)?.connections?.length === 0 || a.NET.length === 0 ) return -1;
    if (a.totalConn.length !== b.totalConn.length) return a.totalConn.length - b.totalConn.length;
    
    const label_a = getLabelFromIP(a.NET.at(-1)?.connections?.sort((a,b) => a.connUid.localeCompare(b.connUid))[0].ip || "1.1.1.1").label  
    const label_b = getLabelFromIP(b.NET.at(-1)?.connections?.sort((a,b) => a.connUid.localeCompare(b.connUid))[0].ip || "1.1.1.1").label  
    return label_a.localeCompare(label_b);
  }

  const tableColumns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      width: "12%",
      render: (name: string) => <div style={{maxWidth:"170px", textOverflow:"ellipsis", overflow:"hidden", whiteSpace: "nowrap" }}>{name}</div>,
      sorter: (a: DataType, b: DataType) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: <Popover content={InstanceStatusPopoverCont} title="Instance Health Status">Instance Status</Popover>,
      dataIndex: "instanceStatus",
      key: "instanceStatus",
      align: "center" as const,
      render: (rh: InstanceStatusContent) => <InstanceStatus {...rh}/>,
      sorter: sortInstanceStatus,
      showSorterTooltip: false,
      sortDirections: ["descend" as SortOrder]  
    },
    {
      title: <Popover content={CPUPopoverCont} title="Instance CPU Warning Level">CPU</Popover>,
      dataIndex: "CPU",
      key: "CPU",
      align: "center" as const,
      render: (rh: Resources[]) => <CPUStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgCPU(a.CPU) - getAvgCPU(b.CPU),
      showSorterTooltip: false,
      sortDirections: ["descend" as SortOrder]
    },
    {
      title: <Popover content={MEMPopoverCont} title="Instance Memory Warning Level">MEM</Popover>,
      dataIndex: "MEM",
      key: "MEM",
      align: "center" as const,
      render: (rh: Resources[]) => <MEMStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => getAvgMEM(a.MEM) - getAvgMEM(b.MEM),
      showSorterTooltip: false,
      sortDirections: ["descend" as SortOrder]
    },
    {
      title: <Popover content={NETPopoverCont} title="Coonnections Health">NET</Popover>,
      dataIndex: "NET",
      key: "NET",
      align: "center" as const,
      render: (rh: Resources[]) => <NETStatus resourcesHistory={rh}/>,
      sorter: (a: DataType, b: DataType) => sortNET(a, b),
      showSorterTooltip: false,
      sortDirections: ["descend" as SortOrder]
    },
    {
      title: <Popover content={ActiveConnPopoverCont} title="Active Connections to the Instance">Active Conn.</Popover>,
      dataIndex: "activeConn",
      key: "activeConn",
      align: "center" as const,
      render: (ci: ConnInfo[]) => <ActiveConnections connections={ci}/>,
      sorter: (a: DataType, b: DataType) => sortActiveConnections(a,b),
      showSorterTooltip: false,
    },
    {
      title: <Popover content={TotalConnPopoverCont} title="Total Connections to the Instance">Total Conn.</Popover>,
      dataIndex: "totalConn",
      key: "totalConn",
      align: "center" as const,
      render: (ci: ConnInfo[]) => <TotalConnections connections={ci}/>,
      sorter: (a: DataType, b: DataType) => a.totalConn.length - b.totalConn.length,
      showSorterTooltip: false,
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
      <Filters runningOnly={runningOnly} setRunningOnly={setRunningOnly}/>
      <Row justify='center'>
        <Col lg={23} sm={24} xs={24} className="title instance-el">
          <Search placeholder="Search for student id" allowClear onChange={(e) => onSearch(e.target.value)} onSearch={onSearch} style={{ width: 400, marginBottom:40 }}/>
          <Table pagination={{ showTotal: total => `Total ${total} instances`, showSizeChanger: true}} 
                 size="small" columns={tableColumns} dataSource={getFilteredInstanceData()} />
        </Col>
      </Row>
    </>
    
  );
}

export default InstanceList;
