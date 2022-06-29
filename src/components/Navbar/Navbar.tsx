import { Header } from "antd/lib/layout/layout";
import Logo from '../Logo/Logo';
import './Navbar.css';
const Navbar = () => {
  return (
    <>
      <Header className="menuBar">
        <Logo widthPx={55} color="#cae2ff" className="logo" />
        <div className="pageTitle"> CrownLabs Exams Dashboard </div> 
      </Header>
    </>
  );
}

export default Navbar;