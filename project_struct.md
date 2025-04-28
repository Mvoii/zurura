```
zurura/
├── free-react-tailwind-admin-dashboard-main/
    └── src/
        ├── api/
        │   ├── authService.ts
        │   ├── busService.ts
        │   ├── routeService.ts
        │   ├── scheduleService.ts       // New
        │   ├── bookingService.ts      // New
        │   ├── trackingService.ts     // New
        │   └── client.ts
        ├── components/
        │   ├── common/                  // Existing common components
        │   ├── ui/                      // Existing UI primitives (Button, Card, Table, etc.)
        │   ├── form/                    // Existing form elements (Input, Select, etc.)
        │   ├── auth/                    // Existing auth components
        │   ├── operator/                // Existing operator components (will be moved/renamed)
        │   ├── Commuter/                // New: Commuter-specific components
        │   │   ├── ScheduleList.tsx     // Displays list of schedules (uses ui/table) - Fetches from public endpoint
        │   │   ├── ScheduleCard.tsx     // Displays single schedule details (uses ui/card)
        │   │   ├── ScheduleFilter.tsx   // Form/inputs for filtering schedules (uses form/) - Filters public list
        │   │   ├── RouteSearchForm.tsx    // Form for searching routes (uses form/) - Searches public endpoint
        │   │   ├── RouteSearchResultList.tsx // Displays list of route search results (uses ui/table) - Displays public results
        │   │   ├── RouteCard.tsx        // Displays single route details (uses ui/card) - Displays public route
        │   │   ├── BookingForm.tsx      // Form for creating a booking (uses form/)
        │   │   ├── BookingHistoryList.tsx // Displays list of user bookings (uses ui/table)
        │   │   ├── BookingCard.tsx      // Displays single booking details (uses ui/card)
        │   │   ├── MapView.tsx          // Component to render the map
        │   │   ├── BusLocationMarker.tsx // Component to render bus markers on map
        │   │   ├── NearbyBusesList.tsx  // Displays list of nearby buses (uses ui/list or table) - Displays public data
        │   │   ├── BusLocationCard.tsx  // Displays brief bus location details (uses ui/card) - Displays public data
        │   │   ├── UserInfoCard.tsx     // Existing User Profile component (move here if commuter-specific)
        │   │   ├── UserAddressCard.tsx  // Existing User Profile component (move here if commuter-specific)
        │   │   ├── ProfileForm.tsx      // Form for updating user profile (uses form/)
        │   │   └── ProfilePhotoUpload.tsx // Component for photo upload (uses form/fileinput)
        │   ├── Operator/              // New: Operator-specific components (move existing operator/ here)
        │   │   ├── BusList.tsx          // Displays list of operator buses (uses ui/table) - Fetches from operator endpoint
        │   │   ├── BusForm.tsx          // Form for adding/updating buses (uses form/)
        │   │   ├── BusCard.tsx          // Displays single bus details (uses ui/card)
        │   │   ├── RouteForm.tsx        // Form for creating routes (uses form/) - Uses operator endpoint
        │   │   ├── RouteCard.tsx        // Displays single route details (uses ui/card) - Can display details for a route selected for stop management
        │   │   ├── RouteStopList.tsx    // Displays list of stops for a route (uses ui/table) - Fetches from public route details
        │   │   ├── AddStopToRouteForm.tsx // Form for adding stops to a route (uses form/) - Uses operator endpoint
        │   │   ├── RouteStopCard.tsx    // Displays single route stop details (uses ui/card)
        │   │   ├── ScheduleForm.tsx     // Form for creating schedules (uses form/) - Uses operator endpoint
        │   │   ├── ScheduleCard.tsx     // Displays single schedule details (uses ui/card) - Can display details for a schedule listed publicly or created
        │   │   ├── BusAssignmentList.tsx // Displays list of bus assignments (uses ui/table) - Fetches from operator endpoint
        │   │   ├── BusAssignmentForm.tsx // Form for creating/updating assignments (uses form/) - Uses operator endpoint
        │   │   └── BusAssignmentCard.tsx // Displays single assignment details (uses ui/card) - Displays operator assignment details
        │   ├── Driver/                // New: Driver-specific components
        │   │   └── LocationSender.tsx   // Component to handle sending location updates - Uses driver endpoint
        │   │   └── DriverDashboardComponents.tsx // Components specific to driver dashboard (e.g., current assignment status) - Requires backend endpoints
        │   └── tables/                  // Existing table components (used by role-specific lists)
        ├── context/
        │   ├── AppProvider.tsx          // Existing
        │   ├── AuthContext.tsx          // Existing
        │   ├── BusContext.tsx           // Existing (Extend for Operator Buses/Assignments)
        │   ├── RouteContext.tsx         // Existing (Extend for Operator Routes/Stops, Commuter Search/Details)
        │   ├── ScheduleContext.tsx      // New (Manages public schedules)
        │   ├── BookingContext.tsx       // New (Manages user bookings)
        │   ├── TrackingContext.tsx      // New (Manages public tracking data, driver updates)
        │   ├── SidebarContext.tsx       // Existing
        │   └── ThemeContext.tsx         // Existing
        ├── hooks/
        │   ├── useAccess.ts             // Existing
        │   ├── useAuth.ts               // Existing (Extend for Profile Update/Photo Upload)
        │   ├── useBus.ts                // Existing (Extend for Operator Buses)
        │   ├── useRoute.ts              // Existing (Extend for Operator Routes/Stops, Commuter Search/Details, Public Find)
        │   ├── useSchedule.ts           // New (Handles public fetch and operator create)
        │   ├── useBooking.ts            // New (Handles user create, cancel, fetch history)
        │   ├── useTracking.ts           // New (Handles driver update, public nearby, public specific bus)
        │   ├── useGoBack.ts             // Existing
        │   └── useModal.ts              // Existing (Useful for managing form/detail modals)
        ├── layout/                      // Existing layout components
        │   ├── AppHeader.tsx            // Existing (Integrate notifications, user dropdown)
        │   ├── AppLayout.tsx            // Existing (Will wrap all role-specific pages)
        │   ├── AppSidebar.tsx           // Existing (Update navigation based on role)
        │   ├── Backdrop.tsx             // Existing
        │   └── SidebarWidget.tsx        // Existing
        └── pages/
            ├── AuthPages/               // Existing Auth pages
            │   ├── SignIn.tsx           // Existing
            │   └── SignUp.tsx           // Existing
            │   └── AuthPageLayout.tsx     // Existing (Can remain for auth-specific layout if different from main AppLayout)
            ├── Commuter/                // New: Commuter-specific pages
            │   ├── SchedulesPage.tsx      // Hosts ScheduleFilter and ScheduleList (public data)
            │   ├── FindRoutesPage.tsx     // Hosts RouteSearchForm and RouteSearchResultList (public data)
            │   ├── RouteDetailsPage.tsx   // Hosts RouteDetails component/Card (public data)
            │   ├── MyBookingsPage.tsx     // Hosts BookingHistoryList (user data)
            │   ├── TrackBusPage.tsx       // Hosts MapView, NearbyBusesList, search bar (public data, driver update)
            │   └── ProfilePage.tsx        // Hosts UserInfoCard, ProfileForm/Upload (user data)
            ├── Operator/                // New: Operator-specific pages
            │   ├── DashboardPage.tsx      // Operator landing page (can host summary info)
            │   ├── ManageBusesPage.tsx    // Hosts OperatorBusList (operator data)
            │   ├── ManageRoutesPage.tsx   // Hosts CreateRouteForm (modal), and potentially display public routes for context for stop management. *Does NOT list operator-created routes specifically.*
            │   ├── ManageRouteStopsPage.tsx // Hosts OperatorRouteStopList and AddStopToRouteForm (modal) for a *selected* public route.
            │   ├── ManageSchedulesPage.tsx // Hosts ScheduleForm (modal). *Does NOT list operator-created schedules specifically.*
            │   └── ManageAssignmentsPage.tsx // Hosts OperatorBusAssignmentList and AssignmentForm (modal) (operator data)
            ├── Driver/                  // New: Driver-specific pages
            │   └── DashboardPage.tsx      // Hosts LocationSender and other driver components (driver data)
            └── Dashboard/               // Existing Dashboard pages (can be repurposed or removed)
│   
├── backend/                    # Go backend services
│   ├── cmd/                    # Entry points
│   ├── internal/
│   │   ├── auth/               # Authentication service
│   │   ├── tracking/           # Tracking service
│   │   ├── payment/            # Payment service
│   │   └── analytics/          # Analytics service
│   ├── pkg/                    # Shared packages
│   └── api/                    # API definitions
│
│
└── infra/                      # Infrastructure as code
    ├── terraform/              # Infrastructure definition
    └── kubernetes/             # K8s configuration
```
