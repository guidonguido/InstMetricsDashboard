import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources, getAvgMEM } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';

export interface MEMStatusContent {
  resourcesHistory: Resources[],
}

const MEMStatus: FC<MEMStatusContent> = props => {
  const [currentMEM, setCurrentMEM] = useState(0);
  const [wargingStatus, setWargingStatus] = useState<string>("grn");

  useEffect(() => {
    setWargingStatus(getMEMWarningStatus(props.resourcesHistory));
    setCurrentMEM(props.resourcesHistory.at(-1)?.mem || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resourcesHistory.at(-1)]);

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
  
  return (
    ( props.resourcesHistory.length === 0 && <></> ) ||
    <Tooltip title={`MEM ${currentMEM}%`}>
      { wargingStatus === 'grn' && <GrnSvg width={'25px'} height={'25px'}/>}
      { wargingStatus === 'yel' && <YelSvg width={'25px'} height={'25px'}/>}
      { wargingStatus === 'red' && <RedSvg width={'25px'} height={'25px'}/>}
    </Tooltip>
  )
}

export default MEMStatus;