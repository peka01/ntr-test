# 🏃‍♂️ Training Management System
A comprehensive, modern training management system built with React, TypeScript, and Supabase. Features AI-powered assistance, multi-language support, interactive tours, and a complete voucher-based attendance system.

## 🌟 Key Features

### 🎯 Core Functionality
- **Training Management**: Create, update, and manage training sessions
- **User Management**: Complete user lifecycle with role-based access
- **Voucher System**: Digital voucher-based attendance tracking
- **Subscription System**: Users can subscribe to training sessions
- **Attendance Tracking**: Real-time attendance marking with kiosk mode

### 🤖 AI-Powered Features
- **Intelligent Help System**: AI chatbot with contextual assistance
- **Smart Documentation**: External documentation integration
- **Multi-language AI**: Swedish and English support
- **Context-Aware Responses**: Understands current user actions

### 🎨 User Experience
- **Interactive Tours**: Guided onboarding and feature discovery
- **Multi-language Support**: Full Swedish/English localization
- **Responsive Design**: Mobile-first, works on all devices
- **Kiosk Mode**: Touch-friendly attendance interface
- **Real-time Updates**: Live data synchronization

### 🔒 Security & Administration
- **Authentication**: Supabase Auth with JWT tokens
- **Role-based Access**: Admin and user permission levels
- **Row Level Security**: Data isolation and protection
- **Secure Deployment**: Production-ready Docker setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Supabase account
- Gemini API key (optional, for AI features)

### 1. Clone and Install
```bash
git clone https://github.com/your-username/ntr-test.git
cd ntr-test
npm install
```

### 2. Environment Setup
Create a `.env` file in the project root:
```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Gemini AI Configuration (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the database schema from `database/schema.sql`
4. Create an admin user and assign admin role

### 4. Start Development
```bash
# Local development
npm run dev

# Or with Docker
docker-compose up --build
```

Visit `http://localhost:3000` to see the application.

## 📚 Documentation

This project includes comprehensive documentation:

- **[Complete Documentation](https://peka01.github.io/ntr-test/)** - Full documentation site
- **[Setup Guide](SUPABASE_SETUP.md)** - Database configuration
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[Tour System](TOUR_SYSTEM.md)** - Interactive user guidance
- **[AI Integration](AI_CHATBOT_INTEGRATION.md)** - AI chatbot setup

## 🏗️ Architecture

### Frontend Stack
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### AI & External Services
- **Google Gemini AI** - Intelligent assistance
- **External Documentation** - GitHub repository integration
- **Multi-language Support** - Swedish/English localization

### Deployment
- **Docker** - Containerized deployment
- **Nginx** - Web server and reverse proxy
- **GitHub Pages** - Static site hosting
- **MkDocs** - Documentation generation

## 🎯 Core Components

### User Management
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  voucherBalance: number;
}
```

### Training System
```typescript
interface Training {
  id: string;
  name: string;
  description: string;
  training_date?: string;
  training_time?: string;
  subscriberCount?: number;
}
```

### Key Features
- **Voucher-based Attendance**: Users spend vouchers to attend trainings
- **Subscription Management**: Users can subscribe to multiple trainings
- **Role-based Access**: Admin users can manage system, regular users can attend
- **Real-time Updates**: Changes sync across all connected clients

## 🎨 User Interface

### Main Views
1. **Public Subscription Page** - Browse and subscribe to trainings
2. **Attendance Page** - Mark attendance and manage vouchers
3. **Admin Panel** - Manage users, trainings, and system settings
4. **Tour Management** - Create and manage user guidance tours
5. **AI Administration** - Configure AI chatbot settings

### Interactive Features
- **Guided Tours** - Step-by-step feature discovery
- **Help System** - Contextual assistance with AI integration
- **Kiosk Mode** - Touch-friendly attendance interface
- **Multi-language** - Seamless Swedish/English switching

## 🤖 AI Integration

### AI Chatbot Features
- **Contextual Help**: Understands what user is currently doing
- **Multi-language**: Responds in Swedish or English
- **Source Attribution**: Shows which documentation was used
- **External Knowledge**: Integrates with external documentation repository

### Knowledge Sources
- System architecture and business rules
- User guides and troubleshooting
- Technical implementation details
- Feature explanations and workflows

## 🎯 Tour System

### Interactive Guidance
- **Welcome Tour** - New user onboarding
- **Admin Tour** - Administrative features
- **Feature Tours** - Specific functionality guides
- **Custom Tours** - Create your own guidance sequences

### Tour Features
- **Visual Highlighting** - Spotlight effects on elements
- **Step-by-step Guidance** - Clear instructions and navigation
- **Progress Tracking** - Completion status and persistence
- **Responsive Design** - Works on all screen sizes

## 🌍 Internationalization

### Language Support
- **Swedish (Primary)** - Complete localization
- **English (Secondary)** - Full translation
- **Dynamic Switching** - Change language without reload
- **Context-aware** - AI responses in user's preferred language

### Localization Features
- **UI Translation** - All interface elements
- **AI Responses** - Contextual language detection
- **Documentation** - Multi-language help system
- **Tour Content** - Localized guidance tours

## 🔒 Security Features

### Authentication & Authorization
- **Supabase Auth** - Secure user authentication
- **JWT Tokens** - Stateless authentication
- **Role-based Access** - Admin and user permissions
- **Session Management** - Secure token handling

### Data Protection
- **Row Level Security** - Database-level data isolation
- **Input Validation** - Client and server-side validation
- **CORS Protection** - Cross-origin request security
- **Environment Variables** - Secure configuration management

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production with Docker
```bash
docker-compose up --build -d
```

### GitHub Pages
```bash
npm run build
npm run deploy
```

### Environment Variables
```bash
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Optional
VITE_GEMINI_API_KEY=your_gemini_key
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts and voucher balances
- **trainings** - Training session information
- **subscriptions** - User training subscriptions
- **attendance** - Attendance records and voucher usage
- **user_roles** - Role-based access control

### Relationships
- Users can have multiple subscriptions
- Users can attend multiple trainings
- Voucher balance tracks attendance costs
- Role-based permissions control access

## 🛠️ Development

### Project Structure
```
├── components/          # React components
├── contexts/           # React contexts (Auth, Language, etc.)
├── services/           # API services and integrations
├── hooks/              # Custom React hooks
├── database/           # SQL schemas and migrations
├── docs/               # Documentation system
├── locales/            # Translation files
└── scripts/            # Build and deployment scripts
```

### Key Services
- **Supabase Service** - Database operations
- **AI Service** - Gemini AI integration
- **Help Service** - External documentation
- **Translation Service** - Multi-language support

## 🧪 Testing

### Manual Testing
1. **User Registration** - Create new user accounts
2. **Training Management** - Create and manage trainings
3. **Subscription Flow** - Subscribe users to trainings
4. **Attendance Tracking** - Mark attendance and use vouchers
5. **Admin Functions** - Test role-based access
6. **AI Chatbot** - Test intelligent assistance
7. **Tour System** - Test guided tours

### Automated Testing
```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📈 Performance

### Optimization Features
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed assets
- **Caching** - Browser and API response caching
- **Bundle Analysis** - Optimized JavaScript bundles

### Monitoring
- **Real-time Updates** - Live data synchronization
- **Error Tracking** - Comprehensive error handling
- **Performance Metrics** - Load time monitoring
- **User Analytics** - Usage pattern tracking

## 🔧 Configuration

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Integration
VITE_GEMINI_API_KEY=your_gemini_key

# App Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://your-domain.com
```

### Database Configuration
- **RLS Policies** - Row-level security
- **Indexes** - Optimized query performance
- **Triggers** - Automated data updates
- **Functions** - Custom database logic

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check Supabase connection
# Verify environment variables
# Test database permissions
```

#### AI Integration
```bash
# Verify Gemini API key
# Check API quotas
# Test network connectivity
```

#### Authentication
```bash
# Check Supabase configuration
# Verify user roles
# Test JWT tokens
```

### Debug Mode
```bash
# Enable debug logging
localStorage.setItem('debug', 'true');

# Check browser console
# Review network requests
# Verify environment variables
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **TypeScript** - Use strict typing
- **ESLint** - Follow linting rules
- **Prettier** - Consistent formatting
- **Testing** - Include test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend-as-a-Service platform
- **Google Gemini** - AI language model
- **React Team** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool

## 📞 Support

For support and questions:
- **Documentation**: [Full Documentation Site](https://peka01.github.io/ntr-test/)
- **Issues**: [GitHub Issues](https://github.com/your-username/ntr-test/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ntr-test/discussions)

---

<div align="center">
  <strong>Built with ❤️ for modern training management</strong>
</div>