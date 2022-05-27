import { Header } from "antd/lib/layout/layout";
import { ReactComponent as SvgLogo } from  '../assets/logo.svg';
import './Navbar.css';
const Navbar = () => {
  return (
    <>
      <Header className="menuBar">
        <SvgLogo className="logo" />
        <div className="pageTitle"> CrownLabs Exams Dashboard </div> 
      </Header>
    </>
  );
}

export default Navbar;