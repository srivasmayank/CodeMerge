import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">My App</div>
      <div className="navbar-buttons">
        <button className="navbar-button">CSS</button>
        <button className="navbar-button">Save</button>
        <Link to="/Result"><button className="navbar-button">Result</button></Link>
      </div>
    </nav>
  );
};

export default Navbar;
