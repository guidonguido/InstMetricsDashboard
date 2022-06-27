import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources, getAvgNET, ConnInfo } from "../../models/Resources";
import { getLabelFromIP } from '../../global/argument';
import Tooltip from 'antd/lib/tooltip';

export interface NETStatusContent {
  resourcesHistory: Resources[],
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const NETStatus: FC<NETStatusContent> = props => {
  const [currentHighestLat, setCurrentHighestLat] = useState(0);
  const [warningStatus, setWarningStatus] = useState<string>("grn");

  useEffect(() => {
    setWarningStatus(getNETWarningStatus(props.resourcesHistory));
    setCurrentHighestLat(getHighestLat(props.resourcesHistory.at(-1)?.connections || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

  const getNETWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0 || resourcesHistory.at(-1)!.connections === null) return 'grn';
    
    let NETWarningStatus;
    if( resourcesHistory.at(-1)!.connections.find(conn => latencyIsWarning(conn)) === undefined ) {
      NETWarningStatus = 'grn';
    } else {
      const avgNETMap = getAvgNET(resourcesHistory);
      NETWarningStatus = 'grn'
      for ( const el of Array.from(avgNETMap) ){
        if( getLabelFromIP(el[0]).latencyWarning < el[1] ){
          NETWarningStatus = 'yel';
          break;
        }
      }

      for ( const el of Array.from(avgNETMap) ){
        if (el[1] > 800){
          NETWarningStatus = 'red';
          break;
        }
      }

    }
    return NETWarningStatus;
  }

  const getHighestLat = (connections: ConnInfo[]) => {
    if( connections.length === 0) return 0;
    return Math.max(...connections.map(conn => conn.latency));
  }
  
  // latencyIsWarning returns true if the latency is greater than the 
  // warning level set in the corrisponging global label
  const latencyIsWarning = (connInfo: ConnInfo): boolean => {
    const connLabel = getLabelFromIP(connInfo.ip);
    return connInfo.latency > connLabel.latencyWarning
  }
  
  return (
    ( props.resourcesHistory.length === 0 && <></> ) ||
    <Tooltip title={`Latency ${currentHighestLat}ms`}>
      { warningStatus === 'grn' && <GrnSvg width={'25px'} height={'25px'}/>}
      { warningStatus === 'yel' && <YelSvg width={'25px'} height={'25px'}/>}
      { warningStatus === 'red' && <RedSvg width={'25px'} height={'25px'}/>}
    </Tooltip>
  )
}

export default NETStatus;