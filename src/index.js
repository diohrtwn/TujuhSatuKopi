import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './components/app/App';
import MenuOrder from './components/menu-order/menu-order';
import Login from './components/login-page/login';
import Register from './components/register-page/register';
import PesananCheckout from './components/pesanan-checkout/pesanan-checkout';
import HistoryOrder from './components/history-order/history-order';
import Admin from './components/admin-tujuhsatukopi/admin'; // Import komponen Admin
import { UserContextProvider } from './components/user-context/usercontext';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './toast.css';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserContextProvider>
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          className: 'custom-toast', 
          duration: 3000 
        }} 
      />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/menu-order" element={<MenuOrder />} />
        <Route path="/checkout" element={<PesananCheckout />} />
        <Route path="/history" element={<HistoryOrder />} />
        <Route path="/about-tujuhsatu" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} /> {/* Tambahkan rute untuk Admin */}
      </Routes>
    </BrowserRouter>
  </UserContextProvider>
);