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
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    const NETWarningStatus = getNETWarningStatus(props.resourcesHistory);
    setWarningInfo(getWarningInfo(NETWarningStatus));
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
  const getWarningInfo = (MEMWarningStatus: string) => {
    const grnMsg = "Instance is working correctly,";
    let yelMsg = "Instance experience quality may be degraded, may want to check";
    let redMsg = "Instance experience quality is degraded due to ";

    const warningInfo: WarningInfo = {warningGrade: "grn", warningMsg: grnMsg};
    
    if (MEMWarningStatus === 'yel') {
      yelMsg += " Connection Quality,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }
    if (MEMWarningStatus === 'red') {
      redMsg += " Connection Quality,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }

    warningInfo.warningMsg = warningInfo.warningMsg.slice(0, -1);
    return warningInfo;
  }

  const latencyIsWarning = (connInfo: ConnInfo): boolean => {
    const connLabel = getLabelFromIP(connInfo.ip);
    return connInfo.latency > connLabel.latencyWarning
  }
  
  return (
    ( props.resourcesHistory.length === 0 && <></> ) ||
    <Tooltip title={warningInfo?.warningMsg}>
      { warningInfo?.warningGrade === 'grn' && <GrnSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'yel' && <YelSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'red' && <RedSvg width={'30px'} height={'48px'}/>}
    </Tooltip>
  )
}

export default NETStatus;