import { Routes, Route, Outlet } from "react-router-dom";
import AppShell from "./src/components/layout/AppShell";
import AuthGuard from "./src/components/layout/AuthGuard";
import Home from "./src/pages/Home";
import Login from "./src/pages/auth/Login";
import Register from "./src/pages/auth/Register";
import CommuterRegistration from "./src/pages/auth/CommuterRegistration";
import OperatorRegistration from "./src/pages/auth/OperatorRegistration";
import RegistrationSuccess from "./src/pages/auth/RegistrationSuccess";
import ProtectedRoute from "./src/components/layout/ProtectedRoute";
import BusProvider from "./src/components/layout/BusProvider";
import Layout from "./src/components/layout/Layout";
import BusFleet from './src/pages/operator/BusFleet';
// Import other components

function App() {
  return (
    <Routes>
      {/* Auth routes - outside AppShell */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/register/commuter" element={<CommuterRegistration />} />
      <Route path="/auth/register/operator" element={<OperatorRegistration />} />
      <Route path="/auth/registration-success" element={<RegistrationSuccess />} />
      
      {/* Routes inside AppShell */}
      <Route element={<AppShell />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        {/* Operator routes */}
        <Route path="/operator" element={
          <ProtectedRoute requiredRole="operator">
            <BusProvider>
              <Layout>
                <Outlet />
              </Layout>
            </BusProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="buses" element={<BusFleet />} />
          {/* Add other operator routes */}
        </Route>
        
        {/* More routes... */}
      </Route>
    </Routes>
  );
}

export default App;