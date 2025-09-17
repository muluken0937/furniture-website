# API Configuration Guide

Your frontend now supports both local and deployed APIs seamlessly!

## 🌐 Available APIs

### 1. Production API (Deployed)
- **URL**: https://furniture-backend-ikq3.onrender.com
- **Status**: ✅ Online and working
- **Environment**: Production
- **Use Case**: Live deployment, production builds

### 2. Local Development API
- **URL**: http://localhost:8000
- **Status**: Available when running locally
- **Environment**: Development
- **Use Case**: Local development with Docker

### 3. Docker Local API
- **URL**: http://backend:8000
- **Status**: Available in Docker containers
- **Environment**: Docker
- **Use Case**: Full-stack Docker deployment

## 🔧 Configuration Files

### Environment Variables
- `.env.local` - Default (uses production API)
- `.env.development` - Development mode
- `.env.production` - Production mode

### API Configuration
- `config/api.js` - Dynamic API switching logic
- `src/contexts/AuthContext.tsx` - Updated to use dynamic API

## 🚀 How to Switch APIs

### Method 1: Environment Variables
```bash
# Use production API (default)
NEXT_PUBLIC_API_URL=https://furniture-backend-ikq3.onrender.com

# Use local API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Use Docker API
NEXT_PUBLIC_API_URL=http://backend:8000
```

### Method 2: Docker Compose
```bash
# Production (uses deployed API)
docker-compose up

# Development (uses local API)
docker-compose -f docker-compose.dev.yml up

# Full stack (uses Docker API)
docker-compose -f docker-compose.full.yml up
```

### Method 3: Admin Panel
- Go to `/admin` dashboard
- Click "Show Details" in API Configuration section
- Select desired API (requires app restart)

## 📱 Current Setup

### Default Configuration
- **Development**: Uses local API (http://localhost:8000)
- **Production**: Uses deployed API (https://furniture-backend-ikq3.onrender.com)
- **Docker**: Uses container API (http://backend:8000)

### Automatic Detection
The system automatically detects:
- Environment (development/production)
- Host (localhost vs deployed)
- Docker context

## 🔍 API Health Monitoring

The admin panel includes:
- ✅ Real-time API health status
- 🔄 Automatic health checks
- 📊 API response monitoring
- 🚨 Error notifications

## 🛠️ Development Workflow

### Local Development
1. Start local backend: `cd Backend && docker-compose up -d`
2. Start frontend: `npm run dev`
3. Frontend automatically uses local API

### Production Deployment
1. Deploy backend to Render (already done)
2. Deploy frontend with production config
3. Frontend automatically uses deployed API

### Full Stack Docker
1. Run: `./docker-full.sh`
2. Both services use Docker networking
3. Frontend connects to backend container

## 🔐 Authentication

All APIs support:
- JWT token authentication
- Role-based access control
- Admin panel access
- User management

## 📊 API Endpoints

### Available Endpoints
- **Root**: `/` - API information
- **Admin**: `/admin/` - Django admin
- **API**: `/api/` - REST API
- **Auth**: `/api/auth/` - Authentication

### Frontend Integration
- **Login**: `/admin/login` - Admin authentication
- **Dashboard**: `/admin` - Admin dashboard
- **Products**: `/admin/products` - Product management
- **Users**: `/admin/users` - User management

## 🚨 Troubleshooting

### API Not Responding
1. Check API health in admin panel
2. Verify environment variables
3. Check network connectivity
4. Restart services if needed

### CORS Issues
- Backend is configured for CORS
- Supports localhost:3000 and deployed domains
- Check ALLOWED_HOSTS in Django settings

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check API URL configuration
- Verify backend is running

## 📈 Performance

### Production API (Render)
- ✅ Fast response times
- ✅ Reliable uptime
- ✅ Auto-scaling
- ✅ HTTPS enabled

### Local API
- ⚡ Ultra-fast (no network latency)
- 🔧 Full debugging capabilities
- 📝 Easy development workflow

## 🎯 Best Practices

1. **Development**: Use local API for faster iteration
2. **Testing**: Use production API for realistic testing
3. **Deployment**: Use production API for live apps
4. **Monitoring**: Check API health regularly

## 🔄 Switching Between APIs

### Quick Switch Commands
```bash
# Switch to production API
echo "NEXT_PUBLIC_API_URL=https://furniture-backend-ikq3.onrender.com" > .env.local

# Switch to local API
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Restart frontend
npm run dev
```

Your frontend now seamlessly works with both your deployed API at [https://furniture-backend-ikq3.onrender.com](https://furniture-backend-ikq3.onrender.com) and local APIs! 🎉
