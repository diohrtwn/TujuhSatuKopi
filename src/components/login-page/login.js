import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app, storeFirebase } from '../../firebaseConfig'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../user-context/usercontext';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);
  const { user, login } = useUserContext();

  useEffect(() => {
    // Cek apakah admin sudah ada di database
    const checkAdmin = async () => {
      const adminRef = doc(storeFirebase, 'admin', 'admintujuhsatukopi');
      const adminSnap = await getDoc(adminRef);

      // Jika admin belum ada, buat data admin di database
      if (!adminSnap.exists()) {
        try {
          await setDoc(adminRef, {
            email: 'admintujuhsatukopi',
            password: 'tujuhsatukopi' 
          });
          console.log('Data admin berhasil dibuat!');
        } catch (error) {
          console.error('Gagal membuat data admin:', error);
        }
      }
    };
    checkAdmin();
  }, []); 

  useEffect(() => {
    if (user) {
      navigate('/'); 
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cek apakah user adalah admin
      const adminRef = doc(storeFirebase, 'admin', 'admintujuhsatukopi');
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists() && adminSnap.data().email === email) {
        // Redirect ke halaman admin
        await login(user);
        toast.success('Selamat Datang Admin!', {
          className: 'custom-toast custom-toast-success'
        });
        navigate('/admin'); 
      } else {
        // Redirect ke halaman user
        await login(user);
        toast.success('Selamat Datang di TujuhSatuKopi!', {
          className: 'custom-toast custom-toast-success'
        });
        navigate('/'); 
      }

    } catch (error) {
      setError('Email atau Password Salah');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <div className="icon">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            className="large-font-input" 
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
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              className="large-font-input" 
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
        <button type="submit" className="login-button">Masuk</button>
        <p className="register-link">Tidak Punya Akun? <a href="/register">Register Sekarang</a></p>
      </form>
    </div>
  );
};

export default Login;
