import { FC } from "react";
import { Row, Spin, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { ConnectedFrom, ConnectedProvider } from "./ConnctedColumns";
import { ConnInfo } from "../../models/Resources";

export interface ConnMetricsContent {
  connections: ConnInfo[]
}
interface ConnectedInfo {
  key:string,
  status: boolean,
  ip: string,
  latency: string,
  from: string,
  provider: string,
  connTime: string,
  disconnTime: string,
}

const ConnMetrics: FC<ConnMetricsContent> = props => { 

  const columns: ColumnsType<ConnectedInfo> = [
    {
      title: 'Status',
      dataIndex: 'status',
      align: "center" as const,
      render: (active: boolean) => (active && <Tag color='green'>Connected</Tag> ) || <Tag color='red'>Disconnected</Tag> ,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: "center" as const,
    },
    {
      title: 'Latency',
      dataIndex: 'latency',
      align: "center" as const,
    },
    {
      title: 'From',
      dataIndex: 'from',
      align: "center" as const,
      render: (ip: string) => <ConnectedFrom ip={ip}/>,
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      align: "center" as const,
      render: (ip: string) => <ConnectedProvider ip={ip}/>,
    },
    {
      title: 'Conn. Time',
      dataIndex: 'connTime',
      align: "center" as const,
    },
    {
      title: 'Disconn. Time',
      dataIndex: 'disconnTime',
      align: "center" as const,
    },
  ];

  const getConnectedInfoList = (connections: ConnInfo[]) => {
    return connections
          .sort((a,b) => new Date(b.connTime).getTime() - new Date(a.connTime).getTime())
          .map( conn => { return {
            key: conn.connUid, status: conn.active, ip: conn.ip,
            from: conn.ip, provider: conn.ip, 
            latency: (conn.latency !== 0 && `${conn.latency}ms`) || "-", 
            connTime: new Date(conn.connTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'}),
            disconnTime: (conn.active && '-')|| new Date(conn.disconnTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'})
          } } )
  }

  return (
    <>
        <Row justify="center"> CONNECTED PAGES </Row>
        { ( props.connections.length === 0 && 
          <Spin tip='Waiting for Connections'/> ) ||
          <Row className="modal-content">
            <Table columns={columns} size="small" dataSource={getConnectedInfoList(props.connections)}/>
          </Row>
        }
    </>
  )
} 

export default ConnMetrics
