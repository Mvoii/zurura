```
zuruza/
├── mobile/                     # React Native application
│   ├── src/
│   │   ├── api/                # API integration layer
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/            # Main app screens
│   │   ├── navigation/         # Navigation configuration
│   │   ├── services/           
│   │   │   ├── tracking/       # Real-time tracking logic
│   │   │   ├── payments/       # Payment integration
│   │   │   └── offline/        # Offline functionality
│   │   ├── store/              # State management
│   │   └── utils/              # Helper functions
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
├── dashboard/                  # Operator dashboard
│   ├── src/
│   │   ├── components/         # Dashboard components
│   │   ├── pages/              # Dashboard pages
│   │   └── services/           # Dashboard services
│
└── infra/                      # Infrastructure as code
    ├── terraform/              # Infrastructure definition
    └── kubernetes/             # K8s configuration
```
