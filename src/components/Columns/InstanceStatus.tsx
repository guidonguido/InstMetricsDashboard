import { FC, useEffect, useState } from 'react';
import { ReactComponent as StopSvg} from  '../../assets/stop.svg'
import { ReactComponent as SubmittedSvg} from  '../../assets/submitted.svg'
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources, getAvgCPU, getAvgMEM } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';


export interface InstanceStatusContent {
  resourcesHistory: Resources[],
  running: boolean,
  submitted: boolean
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const InstanceStatus: FC<InstanceStatusContent> = props => {
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    const CPUWarningStatus = getCPUWarningStatus(props.resourcesHistory);
    const MEMWarningStatus = getMEMWarningStatus(props.resourcesHistory);
    setWarningInfo(getWarningInfo(CPUWarningStatus, MEMWarningStatus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

  const getCPUWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0) return 'grn'; 

    let CPUWarningStatus;
    
    if( resourcesHistory.at(-1)!.cpu < 90 ) {
      CPUWarningStatus = 'grn';
    } else {
      const avgCPU = getAvgCPU(resourcesHistory);
      CPUWarningStatus = ( (avgCPU > 98) && 'red' ) || ( (avgCPU > 95) && 'yel' ) || 'grn';
    }

    return CPUWarningStatus;
  }

  const getMEMWarningStatus = (resourcesHistory: Resources[]) => {
    if (resourcesHistory.length === 0) return 'grn';

    let MEMWarningStatus;

    if( resourcesHistory.at(-1)!.mem < 90 ) {
      MEMWarningStatus = 'grn';
    } else {
      const avgMEM = getAvgMEM(resourcesHistory);
      MEMWarningStatus = ( (avgMEM > 98) && 'red' ) || ( (avgMEM > 95 ) && 'yel') || 'grn';
    }
    
    return MEMWarningStatus;
  }
  
  const getWarningInfo = (CPUWarningStatus: string, MEMWarningStatus: string) => {
    const grnMsg = "Instance is working correctly,";
    let yelMsg = "Instance may be subject to high load, check";
    let redMsg = "Instance is subject to high load, may want to check";

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
    warningInfo.warningMsg = warningInfo.warningMsg.slice(0, -1);

    return warningInfo;
  }
  
  return (
    <>
      {!props.running && 
        <Tooltip title="Instance Terminated">
          <StopSvg width={'30px'} height={'48px'}/>
        </Tooltip> }
      
      {props.resourcesHistory.length > 0 && 
        <Tooltip title={warningInfo?.warningMsg}>
          { warningInfo?.warningGrade === 'grn' && <GrnSvg width={'30px'} height={'48px'}/>}
          { warningInfo?.warningGrade === 'yel' && <YelSvg width={'30px'} height={'48px'}/>}
          { warningInfo?.warningGrade === 'red' && <RedSvg width={'30px'} height={'48px'}/>}
        </Tooltip>
      }
      
      { props.submitted && 
        <Tooltip title="Report Submitted">
          <SubmittedSvg width={'30px'} height={'48px'} style={{marginLeft:"20px"}}/>
        </Tooltip>}
    </>
  )
}

export default InstanceStatus;