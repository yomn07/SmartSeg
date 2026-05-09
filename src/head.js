// Header.js
import React from "react";
import { Link } from "react-router-dom";
import "./head.css";

export default function Header({ loggedIn }) {
  return (
    <header className="main-header">
      <h1 className="logo">SmartSeg</h1>
      <nav className="nav-links">
        {loggedIn ? (
          <>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/logout">Sign Out</Link>
          </>
        ) : (
          <>
            
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
             <Link to="/contact">Contact</Link>
             <Link to="/about">About Us</Link>
          </>
        )}
      </nav>
    </header>
  );
}