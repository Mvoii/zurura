import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RouteList from "./components/operator/RouteList";
import { isAuthenticated, getCurrentUser, isOperator } from './utils/token';
import BusList from "./components/operator/BusList";
import FindRoutesPage from "./pages/Commuter/FindRoutesPage";
import RouteDetailsPage from "./pages/Commuter/RouteDetailsPage";
import ManageRouteStopsPage from "./pages/Operator/ManageRouteStopsPage";
import ManageAssignmentsPage from "./pages/Operator/ManageAssignmentsPage";

// Import AppProvider instead of all individual providers
import AppProvider from "./context/AppProvider";

export default function App() {
  console.log('App loaded - Auth state:', {
    isAuthenticated: isAuthenticated(),
    currentUser: getCurrentUser(),
    isOperator: isOperator()
  });

  return (
    <Router>
      <AppProvider>
        <ScrollToTop />
        <Routes>
          {/* Auth routes - NO AppLayout */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />

          {/* All other routes USE AppLayout */}
          <Route element={<AppLayout />}>
            {/* === Public Routes === */}
            <Route path="/" element={<Home />} />
            <Route path="/routes" element={<FindRoutesPage />} />
            <Route path="/routes/:routeId" element={<RouteDetailsPage />} />
            <Route path="/schedules" element={<div>Schedules List</div>} />
            <Route path="/tracking/:busId" element={<div>Bus Tracking Page</div>} />
            <Route path="/tracking/nearby" element={<div>Nearby Buses Page</div>} />

            {/* === Authenticated Routes === */}
            {/* Commuter */}
            <Route element={<ProtectedRoute requiredRole="commuter" />}>
              <Route path="/dashboard" element={<div>Commuter Dashboard</div>} />
              <Route path="/bookings" element={<div>My Bookings</div>} />
              <Route path="/history" element={<div>Trip History</div>} />
            </Route>

            {/* Operator */}
            <Route element={<ProtectedRoute requiredRole="operator" />}>
              <Route path="/operator/dashboard" element={<div>Operator Dashboard</div>} />
              <Route path="/operator/routes" element={<RouteList showOperatorControls={true} />} />
              <Route path="/operator/routes/new" element={<div>Route Form</div>} />
              <Route path="/operator/routes/:routeId/stops" element={<ManageRouteStopsPage />} />
              <Route path="/operator/buses" element={<BusList />} />
              <Route path="/operator/buses/:id/edit" element={<div>Bus Form</div>} />
              <Route path="/operator/buses/:busId/assignments" element={<ManageAssignmentsPage />} />
              <Route path="/operator/buses/:busId/assign" element={<div>Bus Assign Form</div>} />
              <Route path="/operator/buses/:assignmentId/edit" element={<div>Bus Assign Form</div>} />
              <Route path="/operator/buses/new" element={<div>Bus Form</div>} />
              <Route path="/operator/drivers" element={<div>Drivers</div>} />
              <Route path="/operator/schedules/new" element={<div>Schedule Form</div>} />
            </Route>

            {/* Driver */}
            <Route element={<ProtectedRoute requiredRole="driver" />}>
              <Route path="/driver/dashboard" element={<div>Driver Dashboard</div>} />
              <Route path="/driver/tracking" element={<div>Location Update Form</div>} />
            </Route>

            {/* General Authenticated (requires login, any role) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>

            {/* Legacy/Demo Routes (assuming they need login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
            </Route>

            {/* Fallback Route INSIDE layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </Router>
  );
}
