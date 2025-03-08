zurura/                        # Root project directory
│   ├── frontend/              # React Native mobile app
|    ├── app/                  # App routing and screens
|    │   ├── (auth)/          # Authentication related screens
|    │   │   ├── _layout.tsx  # Auth layout component
|    │   │   └── login.tsx    # Login screen
|    │   ├── (app)/           # Main app screens
|    │   │   ├── _layout.tsx  # App layout component  
|    │   │   ├── home/        # Home screen
|    │   │   ├── map/         # Map view screen
|    │   │   ├── profile/     # User profile screen
|    │   │   └── settings/    # App settings screen
|    │   ├── _layout.tsx      # Root layout component
|    │   └── index.tsx        # Entry point
|    ├── assets/              # Images, fonts and other static files
|    ├── components/          # Reusable UI components
|    ├── constants/           # App-wide constants and configs
|    ├── hooks/              # Custom React hooks
|    ├── lib/                # Utility functions and helpers
|    ├── app.json           # React Native app config
|    ├── babel.config.js    # Babel transpiler config
|    ├── package.json       # Node dependencies
|    ├── tailwind.config.js # Tailwind CSS config
|    └── tsconfig.json      # TypeScript config
│   
├── backend/                # Go backend services
│   ├── cmd/               # Service entry points and main functions
│   ├── internal/          # Private application code
│   │   ├── auth/         # User authentication and authorization
│   │   ├── tracking/     # Location and movement tracking
│   │   ├── payment/      # Payment processing and billing
│   │   └── analytics/    # Data analysis and reporting
│   ├── pkg/              # Shared libraries and utilities
│   └── api/              # API specifications and documentation
│
├── dashboard/            # Admin dashboard web app
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard page components
│   │   └── services/    # API integration and business logic
│
└── infra/               # Infrastructure configuration
    ├── terraform/       # Cloud infrastructure as code
    └── kubernetes/      # Container orchestration configs
