import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app, storeFirebase } from "../../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { doc, setDoc } from "firebase/firestore";
import "./register.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = storeFirebase;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError(
        `Please include an '@' in the email address. '${email}' is missing an '@'.`
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        userID: user.uid,
        email: user.email,
        firstName,
        lastName,
      });
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email Tersebut Sudah Terdaftar");
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <div className="icon">
          <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
        </div>
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="firstName">Nama Depan</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="lastName">Nama Belakang</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Masukan Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Masukan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Masukan Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              className="password-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
        </div>
        <button type="submit" className="register-button">
          Daftar
        </button>
        <p className="login-link">
          Sudah Punya Akun? <a href="/login">Silahkan Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
