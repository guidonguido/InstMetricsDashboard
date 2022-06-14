import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources, ConnInfo } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';



export interface WarningStatusContent {
  resourcesHistory: Resources[],
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const WarningStatus: FC<WarningStatusContent> = props => {
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    const CPUWarningStatus = getCPUWarningStatus(props.resourcesHistory);
    const MEMWarningStatus = getMEMWarningStatus(props.resourcesHistory);
    const NETWarningStatus = getNETWarningStatus(props.resourcesHistory);
    setWarningInfo(getWarningInfo(CPUWarningStatus, MEMWarningStatus, NETWarningStatus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

  const getCPUWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0) return 'grn'; 
    const getAvgCPU: () => number = () => {
      return resourcesHistory.map((e) => e.cpu).reduce((a, b) => a + b, 0) / resourcesHistory.length;
    }

    let CPUWarningStatus;
    
    if( resourcesHistory.at(-1)!.cpu < 90 ) {
      CPUWarningStatus = 'grn';
    } else {
      const avgCPU = getAvgCPU();
      console.log("##### AVG CPU: ", avgCPU);
      CPUWarningStatus = ( (avgCPU > 98) && 'red' ) || ( (avgCPU > 95) && 'yel' ) || 'grn';
      console.log("##### CPUWarningStatus: ", CPUWarningStatus);
    }

    return CPUWarningStatus;
  }

  const getMEMWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0) return 'grn'; 
    const getAvgMEM: () => number = () => {
      return resourcesHistory.map((e) => e.mem).reduce((a, b) => a + b, 0) / resourcesHistory.length;
    }

    let MEMWarningStatus;

    if( resourcesHistory.at(-1)!.mem < 90 ) {
      MEMWarningStatus = 'grn';
    } else {
      const avgMEM = getAvgMEM();
      MEMWarningStatus = ( (avgMEM > 98) && 'red' ) || ( (avgMEM > 95 ) && 'yel') || 'grn';
    }
    
    return MEMWarningStatus;
  }

  const getNETWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0 || resourcesHistory.at(-1)!.connections === null) return 'grn';
    
    const getAvgNET: () => number[] | undefined = () => {
      return resourcesHistory.at(-1)!.connections.map((conn: ConnInfo) => {
        const wantedRes = resourcesHistory.filter((e) => e.connections?.find(c => c.connUid === conn.connUid)!== undefined)
        return wantedRes.map((e) => e.connections?.find(c => c.connUid === conn.connUid)!.latency)
                        .reduce((a, b) => a + b, 0) / wantedRes.length;
      }) 
    }

    let NETWarningStatus;
    
    if( resourcesHistory.at(-1)!.connections.find(conn => conn.latency > 200) === undefined ) {
      NETWarningStatus = 'grn';
    } else {
      const avgNET = getAvgNET();
      NETWarningStatus = ( (avgNET === undefined) && 'grn' ) || ( (avgNET!.filter(e => e > 800).length > 0) && 'red' ) || ( (avgNET!.filter(e => e > 200).length > 0) && 'yel' ) || 'grn';
    }
    return NETWarningStatus;
  }
  
  const getWarningInfo = (CPUWarningStatus: string, MEMWarningStatus: string, NETWarningStatus: string) => {
    const grnMsg = "System is working correctly,";
    let yelMsg = "System may be subject to high load, check";
    let redMsg = "System is subject to high load, please check";

    const warningInfo: WarningInfo = {warningGrade: "grn", warningMsg: grnMsg};

    if (CPUWarningStatus === 'yel') {
      yelMsg += " CPU usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }
    if (MEMWarningStatus === 'yel') {
      yelMsg += " Memory usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }
    if (NETWarningStatus === 'yel') {
      yelMsg += " Connection latencies,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }

    if (CPUWarningStatus === 'red') {
      redMsg += " CPU usage,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }
    if (MEMWarningStatus === 'red') {
      redMsg += " Memory usage,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }
    if (NETWarningStatus === 'red') {
      redMsg += " Connection latencies,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }
    warningInfo.warningMsg = warningInfo.warningMsg.slice(0, -1);

    return warningInfo;
  }
  
  return (
    <Tooltip title={warningInfo?.warningMsg}>
      { warningInfo?.warningGrade === 'grn' && <GrnSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'yel' && <YelSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'red' && <RedSvg width={'30px'} height={'48px'}/>}
    </Tooltip>
  )
}

export default WarningStatus;