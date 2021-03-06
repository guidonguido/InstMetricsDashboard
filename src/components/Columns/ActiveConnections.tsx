import { FC } from 'react';
import { ConnInfo } from '../../models/Resources';
import { getLabelFromIP } from '../../global/argument';
import { Popover, Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';


interface ActiveConnectionsContent {
  connections: ConnInfo[],
}

interface ConnectedInfo {
  key: string;
  ip: string,
  label: string,
  latency: string,
}

const ActiveConnections: FC<ActiveConnectionsContent> = props => {

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
      title: 'Latency',
      dataIndex: 'latency',
      align: "center" as const,
    },
  ];

  const getConnectedInfoList = (connections: ConnInfo[]) => {
    return connections.map( conn => { return {key:conn.connUid, label:getLabelFromIP(conn.ip).label, ip: conn.ip, latency: `${conn.latency}ms`} } )
  }

  const allEqual = (arr: ConnInfo[]) => arr.every( (v: ConnInfo) => v.ip === arr[0].ip )

  const popoverContent = (
      <Table columns={columns} dataSource={getConnectedInfoList(props.connections)} size="small" pagination={{ position: [] }} />
  );


  return (
    <>
      { ( props.connections.length === 0 && <span>0</span> )||
        <Popover content={popoverContent} title="Active connections to instance from">
          <Tag color="blue">{ getLabelFromIP(props.connections.sort((a,b) => a.connUid.localeCompare(b.connUid))[0].ip).label }</Tag>
          {props.connections.length > 1 && <Tag color={(allEqual(props.connections) && "blue") || "volcano"}>+{props.connections.length-1} </Tag>}
        </Popover>
      }
    </>
  )
}

export default ActiveConnections;
