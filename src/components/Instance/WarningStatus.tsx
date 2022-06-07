import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import Tooltip from 'antd/lib/tooltip';



export interface WarningStatusContent {
  CPUWarningStatus: string;
  MEMWarningStatus: string;
  NETWarningStatus: string;
}

export interface WarningInfo {
  warningGrade: string;
  warningMsg: string;
}

const WarningStatus: FC<WarningStatusContent> = props => {
  const [warningInfo, setWarningInfo] = useState<WarningInfo>()

  useEffect(() => {
    setWarningInfo(getWarningInfo())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.CPUWarningStatus, props.MEMWarningStatus, props.NETWarningStatus])
  
  const getWarningInfo = () => {
    const grnMsg = "System is working correctly,";
    let yelMsg = "System may be subject to high load, check";
    let redMsg = "System is subject to high load, please check";

    const warningInfo: WarningInfo = {warningGrade: "grn", warningMsg: grnMsg};

    if (props.CPUWarningStatus === 'yel') {
      yelMsg += " CPU usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }
    if (props.MEMWarningStatus === 'yel') {
      yelMsg += " Memory usage,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }
    if (props.NETWarningStatus === 'yel') {
      yelMsg += " Connection latencies,";
      warningInfo.warningGrade = "yel";
      warningInfo.warningMsg = yelMsg;
    }

    if (props.CPUWarningStatus === 'red') {
      redMsg += " CPU usage,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }
    if (props.MEMWarningStatus === 'red') {
      redMsg += " Memory usage,";
      warningInfo.warningGrade = "red";
      warningInfo.warningMsg = redMsg;
    }
    if (props.NETWarningStatus === 'red') {
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