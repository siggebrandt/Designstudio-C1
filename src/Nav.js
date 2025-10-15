import "./Nav.css";
import eggsellent_logo from "./eggsellent_logo.png";

function Nav() {
  return (
    <nav>
      <img src={eggsellent_logo} className="nav-logo" alt="logo" />
      <p>
        <center>Eggsellent Eggs</center>
      </p>
    </nav>
  );
}

export default Nav;
