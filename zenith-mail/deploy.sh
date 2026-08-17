#!/bin/bash

# Zenith Mail - Quick Deploy Script
# This script helps you deploy Zenith Mail to various platforms

set -e

echo "🚀 Zenith Mail - Deployment Assistant"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Zenith Mail"
    print_success "Git repository initialized"
fi

echo ""
echo "Choose your deployment method:"
echo "1. Deploy to Render (Recommended - Free tier)"
echo "2. Deploy with Docker (Local or any cloud)"
echo "3. Deploy to Railway"
echo "4. Setup for VPS (DigitalOcean/Linode)"
echo "5. Test Locally"
echo "6. Exit"
echo ""

read -p "Enter your choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying to Render..."
        echo ""
        print_warning "Before deploying to Render, you need to:"
        echo "   1. Push this repository to GitHub"
        echo "   2. Sign up at https://render.com"
        echo "   3. Click 'New +' → 'Blueprint'"
        echo "   4. Connect your GitHub repository"
        echo "   5. Select the render.yaml file"
        echo ""
        read -p "Have you pushed to GitHub? (y/n): " pushed
        
        if [ "$pushed" = "y" ]; then
            echo ""
            print_success "Great! Now follow these steps:"
            echo "   1. Go to https://render.com"
            echo "   2. Click 'New +' → 'Blueprint'"
            echo "   3. Connect your GitHub account"
            echo "   4. Select your zenith-mail repository"
            echo "   5. Render will auto-detect the render.yaml file"
            echo "   6. Add environment variables for SMTP (in dashboard)"
            echo ""
            print_warning "Don't forget to update the API_URL in frontend/app.js after deployment!"
        else
            echo ""
            echo "Please push to GitHub first:"
            echo "   git remote add origin https://github.com/YOUR_USERNAME/zenith-mail.git"
            echo "   git push -u origin main"
        fi
        ;;
        
    2)
        echo ""
        echo "🐳 Deploying with Docker..."
        echo ""
        
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            echo "   Visit: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed. Please install it first."
            exit 1
        fi
        
        print_success "Docker is installed!"
        echo ""
        read -p "Do you want to configure SMTP credentials? (y/n): " configure_smtp
        
        if [ "$configure_smtp" = "y" ]; then
            read -p "Enter SMTP username (Gmail address): " smtp_user
            read -sp "Enter SMTP password (App Password): " smtp_pass
            echo ""
            
            export SMTP_USERNAME="$smtp_user"
            export SMTP_PASSWORD="$smtp_pass"
            
            print_success "SMTP credentials configured"
        fi
        
        echo ""
        echo "Building and starting containers..."
        docker-compose up -d --build
        
        echo ""
        print_success "Zenith Mail is now running!"
        echo "   Frontend: http://localhost:80"
        echo "   Backend API: http://localhost:5000"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
        
    3)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""
        
        if ! command -v railway &> /dev/null; then
            print_warning "Railway CLI is not installed."
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo ""
        echo "Logging into Railway..."
        railway login
        
        echo ""
        echo "Deploying backend..."
        cd backend
        railway init
        railway up
        
        echo ""
        read -p "Configure SMTP credentials? (y/n): " configure_smtp
        
        if [ "$configure_smtp" = "y" ]; then
            read -p "Enter SMTP username: " smtp_user
            read -sp "Enter SMTP password: " smtp_pass
            echo ""
            
            railway variables set SMTP_USERNAME="$smtp_user"
            railway variables set SMTP_PASSWORD="$smtp_pass"
        fi
        
        cd ..
        
        echo ""
        print_success "Backend deployed to Railway!"
        echo ""
        echo "For frontend, we recommend using Vercel (free):"
        echo "   1. Install Vercel CLI: npm install -g vercel"
        echo "   2. Run: cd frontend && vercel"
        echo "   3. Update API_URL in app.js to point to your Railway backend"
        ;;
        
    4)
        echo ""
        echo "🖥️  Setting up for VPS deployment..."
        echo ""
        
        print_warning "This will create systemd service files for your VPS"
        echo ""
        
        read -p "Enter your domain name (or press enter to skip): " domain
        
        # Create backend service file
        cat > /tmp/zenith-backend.service << EOF
[Unit]
Description=Zenith Mail Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/zenith-mail/backend
Environment="PATH=/var/www/zenith-mail/backend/venv/bin"
ExecStart=/var/www/zenith-mail/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
EOF
        
        # Create frontend service file
        cat > /tmp/zenith-frontend.service << EOF
[Unit]
Description=Zenith Mail Frontend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/zenith-mail/frontend
ExecStart=/usr/bin/serve -s . -l 8080
Restart=always

[Install]
WantedBy=multi-user.target
EOF
        
        print_success "Service files created in /tmp/"
        echo ""
        echo "Next steps on your VPS:"
        echo "   1. Copy files to VPS: scp -r /workspace/zenith-mail root@your-server:/var/www/"
        echo "   2. SSH into your server: ssh root@your-server"
        echo "   3. Install dependencies (see HOSTING_GUIDE.md)"
        echo "   4. Copy service files:"
        echo "      cp /var/www/zenith-mail/backend/zenith-backend.service /etc/systemd/system/"
        echo "      cp /var/www/zenith-mail/frontend/zenith-frontend.service /etc/systemd/system/"
        echo "   5. Enable services:"
        echo "      systemctl daemon-reload"
        echo "      systemctl enable zenith-backend zenith-frontend"
        echo "      systemctl start zenith-backend zenith-frontend"
        echo ""
        
        if [ -n "$domain" ]; then
            echo "   6. Configure Nginx for domain: $domain"
            echo "   7. Setup SSL with Let's Encrypt:"
            echo "      certbot --nginx -d $domain"
        fi
        
        echo ""
        print_warning "See HOSTING_GUIDE.md for detailed VPS deployment instructions"
        ;;
        
    5)
        echo ""
        echo "🧪 Testing locally..."
        echo ""
        
        # Start backend in background
        echo "Starting backend server..."
        cd backend
        
        if [ ! -d "venv" ]; then
            echo "Creating virtual environment..."
            python3 -m venv venv
            source venv/bin/activate
            pip install flask flask-cors python-dotenv
        else
            source venv/bin/activate
        fi
        
        python app.py &
        BACKEND_PID=$!
        
        cd ../frontend
        
        echo "Starting frontend server..."
        python3 -m http.server 8080 &
        FRONTEND_PID=$!
        
        echo ""
        print_success "Zenith Mail is running locally!"
        echo "   Frontend: http://localhost:8080"
        echo "   Backend API: http://localhost:5000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        echo ""
        
        # Wait for user to press Ctrl+C
        wait
        ;;
        
    6)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "For more detailed instructions, see HOSTING_GUIDE.md"
echo ""
