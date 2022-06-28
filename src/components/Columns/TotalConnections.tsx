import { FC } from 'react';
import { ConnInfo } from '../../models/Resources';
import { getLabelFromIP } from '../../global/argument';
import { Popover, Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';


export interface TotalConnectionsContent {
  connections: ConnInfo[];
}

interface ConnectedInfo {
  key:string,
  ip: string,
  label: string,
  connTime: string,
  disconnTime: string
}

const TotalConnections: FC<TotalConnectionsContent> = props => {
  const columns: ColumnsType<ConnectedInfo> = [
    {
      title: 'Label',
      dataIndex: 'label',
      align: "center" as const,
      render: (label: string) => <Tag color="blue">{label}</Tag> ,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: "center" as const,
      render: (ip: string) => <Tag color="orange">{ip}</Tag>,
    },
    {
      title: 'Conn. time',
      dataIndex: 'connTime',
      align: "center" as const,
      render: (connTime: string) => <Tag color="default">{connTime}</Tag>,
    },
    {
      title: 'Disconn. time',
      dataIndex: 'disconnTime',
      align: "center" as const,
      render: (disconnTime: string) => <Tag color="default">{disconnTime}</Tag>,
    },
  ];

  const getDataSource = (connections: ConnInfo[]) => {
    return connections.map( conn => { return {
      key:conn.connUid, 
      label:getLabelFromIP(conn.ip).label, 
      ip: conn.ip, 
      connTime: new Date(conn.connTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'}),
      disconnTime: (conn.active && '-')|| new Date(conn.disconnTime).toLocaleDateString("it-IT", {hour: '2-digit', minute:'2-digit'})} } )
  }

  const content = (
      <Table columns={columns} dataSource={getDataSource(props.connections)} size="small" pagination={{ position: [] }} />
  );

  return (
    <>
      <Popover content={content} title="Active connections to instance from">
        <Tag color="volcano">{props.connections.length}</Tag>
      </Popover>
    </>
  )
}

export default TotalConnections;