import { FC, useState } from "react";
import { Button } from "antd";
import Row from "antd/lib/row";
import { Resources } from "../../models/Resources";
import Modal from "antd/lib/modal/Modal";
import InstanceMetricsModal from "./InstanceMetricsModal";
import { ArrowsAltOutlined } from '@ant-design/icons';



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
    <>
      <Row justify='center'>
        <a href={`https://${props.instanceRefLink}`} target="_blank" rel="noopener noreferrer">
              Go to instance
        </a>
      </Row>

      {props.resourcesHistory.length > 0 && (
        <>
          <Row justify='center'>
            <Button size='small' onClick={showModal} icon={<ArrowsAltOutlined />} style={{backgroundColor:'transparent'}} > Expand </Button>
          </Row>

          <Modal 
              visible={isModalVisible} 
              closable={false} 
              maskClosable={true}
              keyboard={true}
              bodyStyle={{padding:'0'}}
              onCancel={handleCancel}
              width={'800px'}
              footer={[
                <Button key="close" onClick={handleCancel}> Close </Button>
              ]}>
            <InstanceMetricsModal resourcesHistory={props.resourcesHistory} instanceRefLink={props.instanceRefLink}/>
          </Modal>
        </>)}
    </>
  )
}

export default TableActions;