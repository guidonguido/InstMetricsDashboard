import { FC, useEffect, useState } from 'react';
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';
import { Resources, getAvgCPU } from "../../models/Resources";
import Tooltip from 'antd/lib/tooltip';

export interface CPUStatusContent {
  resourcesHistory: Resources[],
}

const CPUStatus: FC<CPUStatusContent> = props => {
  const [currentCPU, setCurrentCPU] = useState(0);
  const [warningStatus, setWarningStatus] = useState<string>("grn");

  useEffect(() => {
    setWarningStatus(getCPUWarningStatus(props.resourcesHistory));
    setCurrentCPU(props.resourcesHistory.at(-1)?.cpu || 0);
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
  
  return (
    ( props.resourcesHistory.length === 0 && <></> ) ||
    <Tooltip title={`CPU ${currentCPU}%`}>
      { warningStatus === 'grn' && <GrnSvg width={'30px'} height={'48px'}/>}
      { warningStatus === 'yel' && <YelSvg width={'30px'} height={'48px'}/>}
      { warningStatus === 'red' && <RedSvg width={'30px'} height={'48px'}/>}
    </Tooltip>
  )
}

export default CPUStatus;