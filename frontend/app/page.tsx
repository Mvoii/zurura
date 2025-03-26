import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bus, Clock, CreditCard, MapPin, Shield, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-zurura-500" />
            <span className="text-xl font-bold gradient-text">Zurura</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Benefits
            </a>
            <a
              href="#apps"
              className="text-sm font-medium text-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Our Apps
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="hover:text-zurura-500 hover:border-zurura-500">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-zurura-500 hover:bg-zurura-600">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-zurura-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none gradient-text">
                    Revolutionizing Urban Transport in Kenya
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect with matatus in real-time, book seats, and travel with ease. The smart way to commute in the
                    city.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register">
                    <Button size="lg" className="gap-1 bg-zurura-500 hover:bg-zurura-600">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#apps">
                    <Button size="lg" variant="outline" className="hover:text-zurura-500 hover:border-zurura-500">
                      Explore Apps
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=550&width=450"
                  width={550}
                  height={450}
                  alt="Zurura App Screenshot"
                  className="rounded-lg object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zurura-500 px-3 py-1 text-sm text-white">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need for Your Daily Commute
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a comprehensive suite of features designed to make your commute seamless and
                  efficient.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="h-12 w-12 text-zurura-500" />
                <h3 className="text-xl font-bold">Real-time Tracking</h3>
                <p className="text-center text-muted-foreground">
                  Track matatus in real-time on an interactive map to know exactly when your ride will arrive.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <CreditCard className="h-12 w-12 text-zurura-600" />
                <h3 className="text-xl font-bold">Digital Passes</h3>
                <p className="text-center text-muted-foreground">
                  Purchase and manage digital matatu passes with QR codes for quick and contactless boarding.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <Users className="h-12 w-12 text-zurura-700" />
                <h3 className="text-xl font-bold">Seat Booking</h3>
                <p className="text-center text-muted-foreground">
                  Reserve your seat in advance and avoid the rush hour scramble for space.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <Clock className="h-12 w-12 text-zurura-800" />
                <h3 className="text-xl font-bold">Route Planning</h3>
                <p className="text-center text-muted-foreground">
                  Plan your journey with optimized routes and schedules to save time on your commute.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <Star className="h-12 w-12 text-zurura-900" />
                <h3 className="text-xl font-bold">Ratings & Reviews</h3>
                <p className="text-center text-muted-foreground">
                  Rate your experience and read reviews to choose the best matatu services.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
                <Shield className="h-12 w-12 text-ocean-500" />
                <h3 className="text-xl font-bold">Secure Payments</h3>
                <p className="text-center text-muted-foreground">
                  Pay securely via M-Pesa integration with instant confirmation of transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-zurura-500">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-zurura-200 px-3 py-1 text-sm text-white">For Commuters</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simplify Your Daily Travel</h2>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zurura-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Save time with real-time tracking and arrival predictions</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zurura-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Avoid queues with digital passes and seat reservations</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zurura-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Enjoy cashless travel with secure M-Pesa payments</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zurura-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Plan your journey with optimized routes and schedules</div>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-ocean-500 px-3 py-1 text-sm text-white">For Operators</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Optimize Your Business</h2>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Increase revenue with digital ticketing and reduced cash handling</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Gain insights with comprehensive analytics and reporting</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Manage your fleet, drivers, and routes efficiently</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white">
                      ✓
                    </div>
                    <div className="text-base">Improve customer satisfaction with better service delivery</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="apps" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight gradient-text">
                  Our Web Applications
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Access our dedicated web apps for commuters and matatu operators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  width={300}
                  height={300}
                  alt="Commuter App"
                  className="rounded-lg"
                />
                <h3 className="text-2xl font-bold">Commuter Web App</h3>
                <p className="text-center text-muted-foreground">
                  Track matatus, book seats, and manage your digital passes all in one place.
                </p>
                <Link href="/commuter">
                  <Button className="gap-1 bg-zurura-500 hover:bg-zurura-600">
                    Access Commuter App
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  width={300}
                  height={300}
                  alt="Operator App"
                  className="rounded-lg"
                />
                <h3 className="text-2xl font-bold">Operator Web App</h3>
                <p className="text-center text-muted-foreground">
                  Manage your matatu business with comprehensive analytics and operational tools.
                </p>
                <Link href="/operator">
                  <Button className="gap-1 bg-ocean-500 hover:bg-ocean-600">
                    Access Operator App
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-zurura-50 to-ocean-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight gradient-text">Get In Touch</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions or need support? We're here to help.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex flex-col space-y-4">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your name"
                    type="text"
                  />
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your email"
                    type="email"
                  />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your message"
                  ></textarea>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-zurura-500 to-ocean-500 hover:from-zurura-600 hover:to-ocean-600"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-zurura-500" />
            <span className="text-xl font-bold gradient-text">Zurura</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">© 2025 Zurura. All rights reserved.</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-zurura-500 hover:underline underline-offset-4"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

