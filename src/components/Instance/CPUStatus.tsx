import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';



export interface CPUStatusContent {
  resourcesHistory: Resources[],
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const CPUStatus: FC<CPUStatusContent> = props => {
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    const CPUWarningStatus = getCPUWarningStatus(props.resourcesHistory);
    setWarningInfo(getWarningInfo(CPUWarningStatus));
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
  
  const getWarningInfo = (CPUWarningStatus: string) => {
    const grnMsg = "System is working correctly,";
    let yelMsg = "System may be subject to high load, check";
    let redMsg = "System is subject to high load, please check";

    const warningInfo: WarningInfo = {warningGrade: "grn", warningMsg: grnMsg};

    if (CPUWarningStatus === 'yel') {
      yelMsg += " CPU usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }

    if (CPUWarningStatus === 'red') {
      redMsg += " CPU usage,";
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

export default CPUStatus;