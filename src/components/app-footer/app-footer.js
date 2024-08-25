import "./app-footer.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const AppFooter = () => {
  const navigate = useNavigate();

  const scrollToTop = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = () => {
    navigate("/");
    scrollToTop("home");
  };

  return (
    <footer
      className="footer"
      style={{ backgroundImage: "url('/img/bg_header.png')" }}
    >
      <div className="footer-left">
        <h1 className="footer-title">TujuhSatuKopi</h1>
        <nav className="footer-nav">
          <Link to="/" className="footer-nav_item" onClick={handleHomeClick}>
            Home
          </Link>
          <Link
            to="/#about"
            className="footer-nav_item"
            onClick={() => scrollToTop("about")}
          >
            About
          </Link>
          <Link
            to="/menu-order"
            className="footer-nav_item"
            onClick={() => scrollToTop("menu")}
          >
            Menu
          </Link>
          <Link
            to="/checkout"
            className="footer-nav_item"
            onClick={() => scrollToTop("checkout")}
          >
            Checkout
          </Link>
        </nav>
        <div className="footer-social">
          <a
            href="https://www.instagram.com/tujuhsatukopi/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </div>
      <div className="footer-right">
        <div className="footer-contact">
          <h2>Contact Us</h2>
          <hr />
          <p>Jl. Kihajar Dewantoro No.119, Kota Tangerang, Banten 15146</p>
          <p>Phone: 0895-3769-04401</p>
          <p>Instragram: TujuhSatuKopi</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
