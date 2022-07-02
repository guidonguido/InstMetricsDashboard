import { FC, useEffect, useState } from 'react';
import Tooltip from 'antd/lib/tooltip';
import { Resources, getAvgCPU } from "../../models/Resources";
import { ReactComponent as GrnSvg } from  '../../assets/grn-stat.svg';
import { ReactComponent as YelSvg } from  '../../assets/yel-stat.svg';
import { ReactComponent as RedSvg } from  '../../assets/red-stat.svg';

interface CPUStatusContent {
  resourcesHistory: Resources[],
}

const CPUStatus: FC<CPUStatusContent> = props => {
  const [currentCPU, setCurrentCPU] = useState(0);
  const [warningStatus, setWarningStatus] = useState<string>("grn");

  // update CPU worning status when a new CPU metric is received
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
      { warningStatus === 'grn' && <GrnSvg width={'25px'} height={'25px'}/>}
      { warningStatus === 'yel' && <YelSvg width={'25px'} height={'25px'}/>}
      { warningStatus === 'red' && <RedSvg width={'25px'} height={'25px'}/>}
    </Tooltip>
  )
}

export default CPUStatus;
