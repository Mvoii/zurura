import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import { RouteProvider } from "./context/RouteContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RouteList from "./components/operator/RouteList";
import { isAuthenticated, getCurrentUser, isOperator } from './utils/token';
import { BusProvider } from './context/BusContext';
import BusList from "./components/operator/BusList";
import FindRoutesPage from "./pages/Commuter/FindRoutesPage";
import RouteDetailsPage from "./pages/Commuter/RouteDetailsPage";

// Layout component for public routes needing RouteProvider
const PublicRouteLayout = () => (
  <RouteProvider>
    <Outlet />
  </RouteProvider>
);

// Layout component for public routes needing both Route & Bus providers
const PublicTrackingLayout = () => (
  <RouteProvider>
    <BusProvider>
      <Outlet />
    </BusProvider>
  </RouteProvider>
);

export default function App() {
  console.log('App loaded - Auth state:', {
    isAuthenticated: isAuthenticated(),
    currentUser: getCurrentUser(),
    isOperator: isOperator()
  });

  return (
    <>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Group 1: Pure public routes (no providers needed) */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/" element={<Home />} />

            {/* Group 2: Public routes needing RouteProvider */}
            <Route element={<PublicRouteLayout />}>
              <Route path="/routes" element={<FindRoutesPage />} />
              <Route path="/routes/:routeId" element={<RouteDetailsPage />} />
              <Route path="/schedules" element={<div>Schedules List</div>} />
            </Route>

            {/* Group 3: Public routes needing BusProvider + RouteProvider */}
            <Route element={<PublicTrackingLayout />}>
              <Route path="/tracking/:busId" element={<div>Bus Tracking Page</div>} />
              <Route path="/tracking/nearby" element={<div>Nearby Buses Page</div>} />
            </Route>

            {/* Group 4: Authenticated routes within AppLayout */}
            <Route element={
              <RouteProvider>
                <BusProvider>
                  <AppLayout />
                </BusProvider>
              </RouteProvider>
            }>
              {/* Commuter-specific routes */}
              <Route element={<ProtectedRoute requiredRole="commuter" />}>
                <Route path="/dashboard" element={<div>Commuter Dashboard</div>} />
                <Route path="/bookings" element={<div>My Bookings</div>} />
                <Route path="/history" element={<div>Trip History</div>} />
              </Route>

              {/* Operator-specific routes */}
              <Route element={<ProtectedRoute requiredRole="operator" />}>
                <Route path="/operator/dashboard" element={<div>Operator Dashboard</div>} />
                <Route path="/operator/routes" element={<RouteList showOperatorControls={true} />} />
                <Route path="/operator/routes/new" element={<div>Route Form - Consider removing if handled by modal</div>} />
                <Route path="/operator/routes/:routeId/stops" element={<div>Route Stops</div>} />
                <Route path="/operator/buses" element={<BusList />} />
                <Route path="/operator/buses/:id/edit" element={<div>Bus Form</div>} />
                <Route path="/operator/buses/:busId/assignments" element={<div>Bus Assignments List</div>} />
                <Route path="/operator/buses/:busId/assign" element={<div>Bus Assign Form</div>} />
                <Route path="/operator/buses/:assignmentId/edit" element={<div>Bus Assign Form</div>} />
                <Route path="/operator/buses/new" element={<div>Bus Form</div>} />
                <Route path="/operator/drivers" element={<div>Drivers</div>} />
                <Route path="/operator/schedules/new" element={<div>Schedule Form</div>} />
              </Route>

              {/* Driver-specific routes */}
              <Route element={<ProtectedRoute requiredRole="driver" />}>
                <Route path="/driver/dashboard" element={<div>Driver Dashboard</div>} />
                <Route path="/driver/tracking" element={<div>Location Update Form</div>} />
              </Route>

              {/* Other general authenticated routes */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
