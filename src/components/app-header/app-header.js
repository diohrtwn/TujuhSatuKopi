import React from "react";
import "./app-header.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useUserContext } from "../user-context/usercontext";

const AppHeader = ({ password }) => {
  const navigate = useNavigate();
  const { user, logout } = useUserContext();

  const scrollToAbout = (e) => {
    e.preventDefault();
    navigate("/#about");
    setTimeout(() => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`header ${password}`}>
      <nav className="header-nav">
        <div className="header-logo">
          <Link to="/" className="header-nav_item">
            <img
              src="/LOGO_KOPI.jpg"
              alt="TujuhSatuKopi Logo"
              className="header-logo_img"
            />
          </Link>
        </div>
        <div className="header-nav_main">
          <Link to="/" className="header-nav_item">
            Home
          </Link>
          <a href="/#about" className="header-nav_item" onClick={scrollToAbout}>
            About
          </a>
          <Link to="/menu-order" className="header-nav_item">
            Menu
          </Link>
          <Link to="/checkout" className="header-nav_item">
            Checkout
          </Link>
          <Link to="/history" className="header-nav_item">
            History
          </Link>
        </div>
        <div className="header-nav_login">
          {user ? (
            <button
              onClick={handleLogout}
              className="header-nav_item header-nav_item--login"
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="login-icon"
              />{" "}
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="header-nav_item header-nav_item--login"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="login-icon" />{" "}
              Login
            </Link>
          )}
        </div>
      </nav>
      {password === "main" && (
        <div className="header-leadingtext">
          <h1>Welcome to TujuhSatuKopi!</h1>
          <h2>We make every day full of energy and taste</h2>
          <h2>Explore Our Exclusive Coffee Blends Now!</h2>
          <Link to="/menu-order">
            <button className="header-button">More</button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
