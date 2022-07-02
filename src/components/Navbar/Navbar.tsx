import { Header } from "antd/lib/layout/layout";
import Logo from '../Logo/Logo';
import './Navbar.css';

const Navbar = () => {
  return (
    <>
      <Header className="menu-bar">
        <Logo widthPx={55} color="#cae2ff" className="logo" />
        <div className="page-title"> CrownLabs Exams Dashboard </div> 
      </Header>
    </>
  );
}

export default Navbar;
