import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AdminProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Landing from './pages/public/Landing';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import VerifyEmail from './pages/public/VerifyEmail';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import Builder from './pages/user/Builder';
import OrderSummary from './pages/user/OrderSummary';
import OrderTracking from './pages/user/OrderTracking';
import AdminLogin from './pages/admin/AdminLogin';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
            <Route path="/tracking/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}
