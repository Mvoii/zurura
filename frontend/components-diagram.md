# Zurura Component Architecture

This document outlines the component hierarchy and structure for the Zurura application, providing a blueprint for frontend development.

## Core Layout Structure

```
AppShell
├── AuthGuard (conditional wrapper for protected routes)
├── Sidebar
│   ├── Logo
│   ├── NavMenu
│   │   ├── NavSection
│   │   │   ├── NavSectionTitle
│   │   │   └── NavItem
│   │   └── NavFooter
│   └── SidebarToggle
├── Header
│   ├── BreadcrumbNav
│   ├── SearchBar
│   ├── NotificationsMenu
│   └── UserMenu
│       ├── ProfileLink
│       ├── SettingsLink
│       └── LogoutButton
└── MainContent
    ├── PageHeader
    │   ├── PageTitle
    │   └── PageActions
    └── PageContainer
```

## Authentication Components

```
AuthModule
├── LoginPage
│   ├── LoginForm
│   │   ├── EmailField (with validation)
│   │   ├── PasswordField (with visibility toggle)
│   │   ├── RememberMeCheckbox
│   │   ├── ForgotPasswordLink
│   │   └── SubmitButton
│   └── RegistrationLink
│
├── RegistrationPage
│   ├── UserTypeSelector (commuter/operator)
│   ├── RegistrationForm
│   │   ├── PersonalInfoStep
│   │   │   ├── NameFields
│   │   │   ├── EmailField
│   │   │   └── PhoneField
│   │   ├── AccountDetailsStep
│   │   │   ├── PasswordField
│   │   │   ├── PasswordConfirmField
│   │   │   └── SchoolSelector (commuter only)
│   │   ├── CompanyDetailsStep (operator only)
│   │   │   ├── CompanyNameField
│   │   │   └── CompanyDetailsFields
│   │   └── TermsAcceptanceStep
│   └── LoginLink
│
└── ForgotPasswordPage
    └── PasswordResetForm
```

## Commuter Interface Components

### Route Discovery & Navigation

```
RouteFinderModule
├── RouteSearch
│   ├── SearchInput
│   │   ├── Autocomplete
│   │   └── SearchButton
│   ├── LocationSelector
│   │   ├── CurrentLocationButton
│   │   └── LocationInput
│   └── FilterOptions
│       ├── TimeFilter
│       └── DistanceFilter
├── RouteResults
│   ├── RouteList
│   │   └── RouteCard
│   │       ├── RouteInfo
│   │       ├── TimeInfo
│   │       └── ActionButtons
│   └── EmptyState
└── RouteDetails
    ├── RouteSummary
    │   ├── RouteHeader
    │   ├── TimingInfo
    │   └── FareInfo
    ├── RouteMap
    │   ├── MapContainer
    │   ├── RoutePathLayer
    │   └── StopMarkers
    └── StopsList
        └── StopItem
            ├── StopInfo
            └── TimetableInfo
```

### Bus Schedules

```
ScheduleViewerModule
├── ScheduleControls
│   ├── DateSelector
│   │   ├── DatePicker
│   │   └── QuickDateButtons
│   ├── RouteSelector
│   └── RefreshButton
├── ScheduleDisplay
│   ├── TimelineView
│   │   └── BusTimeSlot
│   └── TableView
│       ├── ScheduleRow
│       │   ├── TimeColumn
│       │   ├── RouteColumn
│       │   ├── BusColumn
│       │   └── StatusColumn
│       └── TableFooter
└── NoSchedulesState
```

### Live Tracking

```
BusTrackingModule
├── TrackingMap
│   ├── MapContainer
│   ├── BusMarkerLayer
│   │   └── BusMarker (with popup)
│   ├── StopMarkerLayer
│   │   └── StopMarker (with popup)
│   ├── UserLocationMarker
│   └── MapControls
│       ├── ZoomControls
│       └── LayerControls
├── NearbyBusesList
│   ├── BusCard
│   │   ├── RouteInfo
│   │   ├── TimingInfo
│   │   ├── OccupancyIndicator
│   │   └── TrackButton
│   └── ListControls
│       ├── SortOptions
│       └── FilterOptions
└── BusDetailsPanel
    ├── BusHeader
    │   ├── BusInfo
    │   └── OperatorInfo
    ├── ETADisplay
    ├── RouteProgress
    └── OccupancyStatus
```

### Booking System

```
BookingModule
├── BookingWizard
│   ├── BusSelection
│   │   ├── BusList
│   │   │   └── BusCard
│   │   └── RouteFilter
│   ├── SeatSelection
│   │   ├── BusLayout
│   │   │   ├── SeatGrid
│   │   │   │   └── Seat
│   │   │   └── Legend
│   │   └── SelectedSeatsOverview
│   ├── PaymentMethodSelection
│   │   ├── PaymentMethodList
│   │   │   ├── BusPassOption
│   │   │   ├── MobileMoneyOption
│   │   │   └── CashOption
│   │   └── PriceBreakdown
│   └── BookingConfirmation
│       ├── TicketSummary
│       ├── QRCode
│       └── ShareOptions
├── BookingHistory
│   ├── HistoryFilters
│   └── BookingList
│       └── BookingCard
│           ├── BookingInfo
│           ├── StatusBadge
│           └── ActionButtons
└── BookingDetails
    ├── TicketDetails
    ├── StatusTimeline
    └── RefundPolicy
```

### Bus Pass Management

```
BusPassModule
├── PassOverview
│   ├── CurrentPassCard
│   │   ├── PassTypeIndicator
│   │   ├── BalanceDisplay
│   │   ├── ValidityPeriod
│   │   └── TopUpButton
│   └── PassStatistics
├── PassPurchase
│   ├── PassTypeSelector
│   │   ├── PrepaidOption
│   │   └── SubscriptionOption
│   ├── AmountSelector (for prepaid)
│   ├── DurationSelector (for subscription)
│   ├── PaymentForm
│   └── ConfirmationStep
└── TransactionHistory
    ├── HistoryFilters
    │   ├── DateRangePicker
    │   └── TransactionTypeFilter
    └── TransactionList
        └── TransactionItem
            ├── TransactionInfo
            ├── AmountDisplay
            └── StatusIndicator
```

## Operator Interface Components

### Dashboard

```
OperatorDashboardModule
├── OverviewPanel
│   ├── MetricsGrid
│   │   ├── MetricCard
│   │   │   ├── MetricValue
│   │   │   └── MetricLabel
│   │   └── TrendIndicator
│   └── RevenueChart
├── FleetStatusPanel
│   ├── StatusSummary
│   │   ├── ActiveBusCount
│   │   ├── InactiveBusCount
│   │   └── MaintenanceCount
│   └── BusStatusList
│       └── BusStatusItem
└── ActivityFeed
    ├── FeedFilters
    └── ActivityList
        └── ActivityItem
            ├── ActivityIcon
            ├── ActivityContent
            └── Timestamp
```

### Bus Management

```
BusManagementModule
├── BusListView
│   ├── ListControls
│   │   ├── SearchInput
│   │   ├── StatusFilter
│   │   └── AddBusButton
│   └── BusTable
│       ├── TableHeader
│       ├── BusRow
│       │   ├── BusInfo
│       │   ├── StatusBadge
│       │   ├── CapacityIndicator
│       │   └── ActionMenu
│       └── TableFooter
├── BusFormDialog
│   ├── FormHeader
│   ├── GeneralInfoSection
│   │   ├── RegistrationPlateInput
│   │   └── CapacityInput
│   ├── PhotoUploadSection
│   └── FormActions
└── BusDetailsView
    ├── BusHeader
    │   ├── BusPhoto
    │   ├── BusInfo
    │   └── StatusControls
    ├── DriverAssignment
    │   ├── CurrentDriverInfo
    │   └── AssignDriverDropdown
    ├── MaintenanceLog
    └── TripHistory
```

### Route Management

```
RouteManagementModule
├── RouteListView
│   ├── ListControls
│   │   ├── SearchInput
│   │   ├── StatusFilter
│   │   └── AddRouteButton
│   └── RouteTable
│       ├── TableHeader
│       ├── RouteRow
│       │   ├── RouteInfo
│       │   ├── StopsCount
│       │   ├── StatusBadge
│       │   └── ActionMenu
│       └── TableFooter
├── RouteFormDialog
│   ├── FormHeader
│   ├── RouteDetailsSection
│   │   ├── RouteNameInput
│   │   └── DescriptionInput
│   ├── MapSection
│   │   ├── MapContainer
│   │   └── DrawRouteControls
│   └── FormActions
└── RouteDetailsView
    ├── RouteHeader
    │   ├── RouteInfo
    │   └── StatusControls
    ├── StopManagement
    │   ├── StopList
    │   │   └── StopItem
    │   │       ├── StopInfo
    │   │       ├── DragHandle
    │   │       └── RemoveButton
    │   ├── AddStopButton
    │   └── StopFormDialog
    ├── TimetableEditor
    │   ├── TimeSlotList
    │   │   └── TimeSlot
    │   └── AddTimeSlotButton
    └── RouteStatistics
```

### Schedule Management

```
ScheduleManagementModule
├── ScheduleCalendarView
│   ├── CalendarHeader
│   │   ├── DateNavigation
│   │   ├── ViewToggle
│   │   └── AddScheduleButton
│   └── Calendar
│       ├── DayHeader
│       └── ScheduleEvent
├── ScheduleListView
│   ├── ListControls
│   │   ├── DateRangePicker
│   │   ├── RouteFilter
│   │   └── BusFilter
│   └── ScheduleTable
│       ├── TableHeader
│       ├── ScheduleRow
│       │   ├── TimeInfo
│       │   ├── RouteInfo
│       │   ├── BusInfo
│       │   ├── DriverInfo
│       │   └── ActionMenu
│       └── TableFooter
├── ScheduleFormDialog
│   ├── FormHeader
│   ├── RouteSelection
│   ├── BusSelection
│   ├── DriverSelection
│   ├── DateTimeSelection
│   └── FormActions
└── ConflictResolutionDialog
    ├── ConflictDetails
    └── ResolutionOptions
```

## Shared UI Components

### Data Display Components

```
DataComponents
├── DataTable
│   ├── TableHeader
│   │   └── SortableHeader
│   ├── TableBody
│   │   └── TableRow
│   └── TableFooter
│       └── Pagination
├── DataGrid
│   ├── GridHeader
│   ├── GridBody
│   │   └── GridItem
│   └── GridFooter
├── DataCards
│   ├── CardHeader
│   ├── CardBody
│   └── CardFooter
└── DataVisualization
    ├── LineChart
    ├── BarChart
    ├── PieChart
    └── Gauge
```

### Form Components

```
FormComponents
├── InputField
│   ├── TextInput
│   ├── NumberInput
│   ├── EmailInput
│   ├── PasswordInput
│   └── PhoneInput
├── SelectField
│   ├── Dropdown
│   ├── ComboBox
│   ├── MultiSelect
│   └── SearchableSelect
├── DateTimeField
│   ├── DatePicker
│   ├── TimePicker
│   └── DateTimePicker
├── CheckboxField
│   ├── SingleCheckbox
│   └── CheckboxGroup
├── RadioField
│   ├── RadioButton
│   └── RadioGroup
├── FileUploadField
│   ├── DropZone
│   ├── FilePreview
│   └── UploadProgress
└── FormLayout
    ├── FormSection
    ├── FormRow
    └── FormActions
```

### Feedback Components

```
FeedbackComponents
├── AlertComponent
│   ├── SuccessAlert
│   ├── ErrorAlert
│   ├── WarningAlert
│   └── InfoAlert
├── ToastNotification
│   ├── ToastContainer
│   └── ToastMessage
├── Modal
│   ├── ModalHeader
│   ├── ModalBody
│   └── ModalFooter
├── LoadingIndicator
│   ├── Spinner
│   ├── ProgressBar
│   └── SkeletonLoader
├── EmptyState
│   ├── IllustrationPlaceholder
│   ├── EmptyMessage
│   └── ActionButton
└── ErrorBoundary
    ├── FallbackUI
    └── ErrorDetails
```

## Implementation Notes

1. **Component Composition**: Components should be designed with composition in mind, using the React children prop where appropriate to allow for flexible usage patterns.

2. **Responsive Design**: All components should be built with mobile-first responsive design, utilizing Tailwind CSS breakpoints.

3. **Accessibility**: Components must meet WCAG 2.1 AA standards with proper aria attributes, keyboard navigation, and focus management.

4. **Performance**: Use React.memo, useMemo, and useCallback appropriately to prevent unnecessary re-renders, especially in list components.

5. **State Management**: Local component state should use useState/useReducer, while application state should use Zustand for simplicity and performance.

6. **Code Organization**:
   - Component files should be co-located with their related files (tests, styles)
   - Larger components should be broken down into smaller subcomponents
   - Each component should have a clear, single responsibility

7. **Theming**: All components should respect the application theme settings (light/dark mode) using CSS variables or Tailwind theme extension.
