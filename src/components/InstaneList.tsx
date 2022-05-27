import {Row, Col} from 'antd/lib/grid';
import "./InstanceList.css"

const InstanceList = () => {
  return (
    <>
      <Row justify="center">
      < Col span={18} className="title">GUIDO RICIOPPO s279127</Col>
      </Row>
      <Row justify="center">
        < Col span={3} className="utilization-box">CPU UTILIZATION</Col>
        < Col span={15} className="utilization-grp">CPU HYSTORIC GRAPH</Col>
      </Row>
      <Row justify="center">
        < Col span={18} className="connections-box">Connected Pages</Col>
      </Row>
    </>
  );
}

export default InstanceList;