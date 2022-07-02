import Navbar from "./Navbar/Navbar";
import InstanceList from "./Instances/InstanceList";
import { Layout } from "antd";
import { Content, Footer } from "antd/lib/layout/layout";

const Main = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar/>
      <Content>  
        <InstanceList></InstanceList>
      </Content>
      <Footer> CrownLabs ©2022 </Footer>
    </Layout>
  );
}

export default Main;
