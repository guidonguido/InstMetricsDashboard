import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';



export interface MEMStatusContent {
  resourcesHistory: Resources[],
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const MEMStatus: FC<MEMStatusContent> = props => {
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    const MEMWarningStatus = getMEMWarningStatus(props.resourcesHistory);
    setWarningInfo(getWarningInfo(MEMWarningStatus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

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
  
  const getWarningInfo = (MEMWarningStatus: string) => {
    const grnMsg = "System is working correctly,";
    let yelMsg = "System may be subject to high load, check";
    let redMsg = "System is subject to high load, please check";

    const warningInfo: WarningInfo = {warningGrade: "grn", warningMsg: grnMsg};
    
    if (MEMWarningStatus === 'yel') {
      yelMsg += " Memory usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
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
    <Tooltip title={warningInfo?.warningMsg}>
      { warningInfo?.warningGrade === 'grn' && <GrnSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'yel' && <YelSvg width={'30px'} height={'48px'}/>}
      { warningInfo?.warningGrade === 'red' && <RedSvg width={'30px'} height={'48px'}/>}
    </Tooltip>
  )
}

export default MEMStatus;