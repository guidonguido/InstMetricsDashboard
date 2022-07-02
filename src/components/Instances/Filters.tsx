import { Col, Row, Switch } from "antd";
import { FC } from "react";

// export interface QuizIns {
//   codIns: string;
//   quizID: string;
// }

export interface FiltersContent {
  // changeQuizFilter : (quizFilter: QuizIns) => void;
  setRunningOnly: (runningOnly: boolean) => void;
  runningOnly: boolean;
  // quizList: QuizIns[];
}

const Filters: FC<FiltersContent> = props => { 

  return (
    <Row justify="start">
        <Col offset={0} span={4}>
            <Switch  checked={props.runningOnly} onChange={props.setRunningOnly} />
            <span style={{padding:"4px"}}>Show Running Only</span>
        </Col>
    </Row>
  );
} 

export default Filters
