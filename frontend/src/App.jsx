import { Routes, Route, Link } from 'react-router-dom'
import { ArrowRight, Bus, MapPin, Clock, Shield } from 'lucide-react'
import { AuthProvider } from '../lib/context/AuthContext'
import { UserProvider } from '../lib/context/UserContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CommuterRegisterPage from './pages/auth/CommuterRegisterPage'
import OperatorRegisterPage from './pages/auth/OperatorRegisterPage'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Zurura</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link to="/auth/register" className="button">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Your Matatu Journey Made Simple
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Book, track, and pay for your matatu rides with ease. The most convenient way to navigate public
                  transport.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/auth/register" className="button button-lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/about" className="button button-outline button-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/placeholder.svg?height=550&width=550"
                alt="Matatu App Preview"
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Zurura?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform offers a seamless experience for all your public transport needs.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <MapPin className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Real-time Tracking</h3>
              <p className="text-center text-muted-foreground">
                Know exactly where your matatu is and when it will arrive.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Clock className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Save Time</h3>
              <p className="text-center text-muted-foreground">
                Book your rides in advance and avoid waiting in long queues.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Shield className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-center text-muted-foreground">Pay for your rides securely through our platform.</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Bus className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Multiple Routes</h3>
              <p className="text-center text-muted-foreground">Access all matatu routes and schedules in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Commute?
              </h2>
              <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of commuters who have simplified their daily journeys.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/auth/register" className="button button-lg button-secondary">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">© 2025 Zurura. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/register/commuter" element={<CommuterRegisterPage />} />
          <Route path="/auth/register/operator" element={<OperatorRegisterPage />} />
          
          {/* Protected routes with AppLayout */}
          <Route element={<AppLayout />}>
            {/* Commuter routes */}
            <Route path="/routes" element={<ProtectedRoute element={<div>Routes List</div>} />} />
            <Route path="/bookings" element={<ProtectedRoute element={<div>My Bookings</div>} />} />
            <Route path="/history" element={<ProtectedRoute element={<div>Trip History</div>} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            
            {/* Operator routes */}
            <Route path="/operator/dashboard" element={<ProtectedRoute element={<div>Operator Dashboard</div>} role="operator" />} />
            <Route path="/operator/buses" element={<ProtectedRoute element={<div>Buses Management</div>} role="operator" />} />
            <Route path="/operator/routes" element={<ProtectedRoute element={<div>Routes Management</div>} role="operator" />} />
            <Route path="/operator/schedules" element={<ProtectedRoute element={<div>Schedules</div>} role="operator" />} />
            <Route path="/operator/bookings" element={<ProtectedRoute element={<div>Bookings</div>} role="operator" />} />
            <Route path="/operator/drivers" element={<ProtectedRoute element={<div>Drivers</div>} role="operator" />} />
            <Route path="/operator/settings" element={<ProtectedRoute element={<div>Settings</div>} role="operator" />} />
          </Route>
          
          {/* Fallback for 404 */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  )
}

export default App