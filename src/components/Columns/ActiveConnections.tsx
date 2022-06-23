import { FC } from 'react';
import { ConnInfo } from '../../models/Resources';
import { getLabelFromIP } from '../../global/argument';
import { Popover } from 'antd';
import { Tag } from 'antd';


export interface ActiveConnectionsContent {
  connections: ConnInfo[],
}

const ActiveConnections: FC<ActiveConnectionsContent> = props => {
  const content = (
    <div>
      {props.connections.map( conn => <Tag key={`conn-${conn.connUid}`}>{ getLabelFromIP(conn.ip).label }</Tag> )}
    </div>
  );

  return (
    <>
      { ( props.connections.length === 0 && <span>0</span> )||
        <Popover content={content} title="Active connections to instance from">
          <Tag color="blue">{ getLabelFromIP(props.connections.sort((a,b) => a.connUid.localeCompare(b.connUid))[0].ip).label }</Tag>
          {props.connections.length > 1 && <Tag color="volcano">+{props.connections.length-1} </Tag>}
        </Popover>
      }
    </>
  )
}

export default ActiveConnections;