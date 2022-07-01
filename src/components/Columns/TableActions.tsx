import { FC, useState } from "react";
import { Button } from "antd";
import {Row, Col} from "antd/es/grid";
import Tooltip from "antd/es/tooltip";
import Modal from "antd/lib/modal/Modal";
import { Resources } from "../../models/Resources";
import InstanceMetricsModal from "../Instance/InstanceMetricsModal";
import { ReactComponent as Link } from  '../../assets/link.svg';
import { ReactComponent as View } from  '../../assets/spy.svg';
import { ReactComponent as More } from  '../../assets/more.svg';

export interface TableActionsContent {
  instanceRefLink?: string,
  resourcesHistory: Resources[]
}

const TableActions: FC<TableActionsContent> = props => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <Row justify="end">
      { props.resourcesHistory.length > 0 && 
        <>
          <Col span={4}>
            <Tooltip title={"Get more system and connections info"}>
              <More onClick={showModal} width={'25px'} height={'25px'} style={{cursor:"pointer"}}/>
            </Tooltip>
          </Col>

          <Modal 
            visible={isModalVisible} 
            closable={true} 
            maskClosable={true}
            keyboard={true}
            bodyStyle={{padding:'0'}}
            onCancel={handleCancel}
            width={'800px'}
            title={"Instance Info"}
            footer={[
              <Button key="close" onClick={handleCancel}> Close </Button>
          ]}>
            <InstanceMetricsModal resourcesHistory={props.resourcesHistory} instanceRefLink={props.instanceRefLink}/>
          </Modal>
        </>
      }

      { props.instanceRefLink !== "unknown" && 
        <>
          <Col span={4} offset={4}>
            <Tooltip title={"Go to instance"}>
              <a href={`https://${props.instanceRefLink}`} target="_blank" rel="noopener noreferrer">
                <Link width={'25px'} height={'25px'}/>
              </a>
            </Tooltip>
          </Col>
          <Col span={5} offset={4}>
            <Tooltip title={"Go to instance in View Mode"}>
              <a href={`https://${props.instanceRefLink}#readonly,noresize`} target="_blank" rel="noopener noreferrer">
                    <View width={'25px'} height={'25px'}/>
              </a>
            </Tooltip>
          </Col>
        </>
      }

    </Row>
  )
}

export default TableActions;