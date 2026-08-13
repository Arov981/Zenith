# 🚀 Zenith Mail - Complete Hosting Guide

## 📋 Table of Contents
1. [Quick Start (Local Testing)](#quick-start-local-testing)
2. [Production Deployment Options](#production-deployment-options)
3. [Option 1: Deploy to Render (FREE)](#option-1-deploy-to-render-free)
4. [Option 2: Deploy to Railway (FREE)](#option-2-deploy-to-railway-free)
5. [Option 3: Deploy to VPS (DigitalOcean/Linode)](#option-3-deploy-to-vps)
6. [Option 4: Deploy with Docker](#option-4-deploy-with-docker)
7. [Email Configuration](#email-configuration)
8. [Domain Setup](#domain-setup)
9. [Security Checklist](#security-checklist)

---

## Quick Start (Local Testing)

Before deploying, test locally:

```bash
cd /workspace/zenith-mail

# Terminal 1 - Backend
cd backend
pip install flask flask-cors python-dotenv
python app.py

# Terminal 2 - Frontend
cd ../frontend
# Option A: Python simple server
python -m http.server 8080

# Option B: Node.js (if installed)
npx serve .
```

Visit `http://localhost:8080` to see your app!

---

## Production Deployment Options

### Best Free Options:
1. **Render** - Free tier available, easy setup
2. **Railway** - $5 free credit, very developer-friendly
3. **Fly.io** - Free tier for small apps
4. **Vercel + Backend on Render** - Frontend on Vercel (free), backend on Render

---

## Option 1: Deploy to Render (FREE) ⭐ RECOMMENDED

### Step 1: Prepare Your Repository
```bash
cd /workspace/zenith-mail
git init
git add .
git commit -m "Initial commit - Zenith Mail"
git branch -M main
# Push to GitHub first
git remote add origin https://github.com/YOUR_USERNAME/zenith-mail.git
git push -u origin main
```

### Step 2: Create render.yaml File
I've created this file for you at `/workspace/zenith-mail/render.yaml`

### Step 3: Deploy Backend on Render
1. Go to https://render.com and sign up
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the `render.yaml` file
5. Render will auto-detect and deploy both frontend and backend!

### Step 4: Configure Environment Variables
In Render dashboard, add these environment variables to the backend service:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FLASK_ENV=production
```

### Step 5: Update Frontend API URL
Update the `API_URL` in `/workspace/zenith-mail/frontend/app.js`:
```javascript
const API_URL = 'https://your-backend-name.onrender.com';
```

---

## Option 2: Deploy to Railway (FREE)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Deploy
```bash
cd /workspace/zenith-mail/backend
railway init
railway up
```

### Step 3: Add Environment Variables
```bash
railway variables set SMTP_USERNAME=your-email@gmail.com
railway variables set SMTP_PASSWORD=your-app-password
```

### Step 4: Deploy Frontend
For frontend, use Vercel (free):
```bash
cd /workspace/zenith-mail/frontend
npm install -g vercel
vercel
```

Update the API URL in `app.js` to point to your Railway backend.

---

## Option 3: Deploy to VPS (DigitalOcean/Linode)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name pointing to your server IP
- SSH access

### Step 1: Connect to Server
```bash
ssh root@your-server-ip
```

### Step 2: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Python, Nginx, and other tools
apt install -y python3 python3-pip python3-venv nginx git curl

# Install Node.js (for serving frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### Step 3: Clone Your App
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/zenith-mail.git
cd zenith-mail
```

### Step 4: Setup Backend
```bash
cd /var/www/zenith-mail/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask flask-cors gunicorn python-dotenv

# Create .env file
nano .env
# Add your SMTP credentials
```

### Step 5: Create Systemd Service for Backend
```bash
nano /etc/systemd/system/zenith-backend.service
```

Add this content:
```ini
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
```

Enable and start:
```bash
systemctl daemon-reload
systemctl enable zenith-backend
systemctl start zenith-backend
```

### Step 6: Setup Frontend
```bash
cd /var/www/zenith-mail/frontend

# Install serve to host static files
npm install -g serve

# Create systemd service
nano /etc/systemd/system/zenith-frontend.service
```

Add this content:
```ini
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
```

Enable and start:
```bash
systemctl daemon-reload
systemctl enable zenith-frontend
systemctl start zenith-frontend
```

### Step 7: Configure Nginx
```bash
nano /etc/nginx/sites-available/zenith-mail
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/zenith-mail /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Setup SSL with Let's Encrypt
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Option 4: Deploy with Docker

### Step 1: Create Dockerfile for Backend
I've created this at `/workspace/zenith-mail/backend/Dockerfile`

### Step 2: Create Dockerfile for Frontend
I've created this at `/workspace/zenith-mail/frontend/Dockerfile`

### Step 3: Create docker-compose.yml
I've created this at `/workspace/zenith-mail/docker-compose.yml`

### Step 4: Build and Run
```bash
cd /workspace/zenith-mail
docker-compose up -d --build
```

Your app will be running at:
- Frontend: http://localhost:80
- Backend API: http://localhost:5000

### Step 5: Deploy to Any Cloud with Docker
Push to any cloud that supports Docker:
- DigitalOcean App Platform
- Google Cloud Run
- AWS ECS
- Azure Container Instances

---

## Email Configuration

### For Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to your environment variables**:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Your app password (no spaces in actual usage)
```

### For Other Providers

**Outlook/Hotmail:**
```
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom Domain:**
```
SMTP_SERVER=mail.your-domain.com
SMTP_PORT=587
```

---

## Domain Setup

### To Use @zenith.com Domain

**Important:** You need to OWN the domain `zenith.com` to actually send emails from `@zenith.com`. 

If you don't own it, you can:
1. **Use a different domain** you own
2. **Use a subdomain** of a domain you own (e.g., `@mail.yourdomain.com`)
3. **Keep using demo mode** with simulated @zenith.com addresses

### If You Buy a Domain:

1. **Purchase domain** from Namecheap, GoDaddy, or Google Domains
2. **Setup DNS Records**:
   ```
   Type: MX
   Name: @
   Value: mail.your-domain.com
   Priority: 10
   
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.google.com ~all
   
   Type: CNAME
   Name: mail
   Value: your-server-ip
   ```

3. **Configure email hosting** with:
   - Google Workspace ($6/month)
   - Microsoft 365 ($5/month)
   - Zoho Mail (Free for 5 users)
   - Custom SMTP server

---

## Security Checklist

### ✅ Before Going Live:

1. **Change all default passwords**
2. **Enable HTTPS/SSL** (use Let's Encrypt - it's free!)
3. **Set up firewall** (UFW on Ubuntu):
   ```bash
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP
   ufw allow 443/tcp   # HTTPS
   ufw enable
   ```

4. **Enable rate limiting** on your API
5. **Add CORS restrictions** to only allow your frontend domain
6. **Use environment variables** for all secrets (never commit .env files!)
7. **Set up regular backups**
8. **Monitor logs** for suspicious activity
9. **Keep dependencies updated**
10. **Add input validation** on all forms

### Update CORS in Backend:
Edit `/workspace/zenith-mail/backend/app.py`:
```python
CORS(app, origins=['https://your-domain.com'])
```

---

## Troubleshooting

### Backend won't start:
```bash
# Check logs
journalctl -u zenith-backend -f

# Test manually
cd /var/www/zenith-mail/backend
source venv/bin/activate
python app.py
```

### Frontend not loading:
```bash
# Check if serve is running
systemctl status zenith-frontend

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Emails not sending:
1. Verify SMTP credentials are correct
2. Check if port 587 is open on your server
3. Try using port 465 with SSL instead
4. Check your email provider's spam settings

### CORS Errors:
Make sure your backend CORS settings include your frontend domain:
```python
CORS(app, origins=['https://your-frontend-domain.com'])
```

---

## Cost Estimates

| Service | Free Tier | Paid (Monthly) |
|---------|-----------|----------------|
| **Render** | ✅ Yes (with limitations) | $7+ |
| **Railway** | $5 credit | $5+ |
| **Vercel (Frontend)** | ✅ Unlimited | $20+ |
| **DigitalOcean Droplet** | ❌ | $6+ |
| **Domain Name** | ❌ | $10-15/year |
| **SSL Certificate** | ✅ Free (Let's Encrypt) | ✅ Free |
| **Email (Gmail)** | ✅ Free | ✅ Free |
| **Email (Custom)** | ❌ | $6+/month |

**Minimum Monthly Cost: $0** (using free tiers)
**Recommended Setup: ~$7-13/month** (domain + basic hosting)

---

## Next Steps

1. ✅ Test locally first
2. ✅ Choose a hosting provider
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Configure SMTP for real emails
6. ✅ Set up custom domain (optional)
7. ✅ Enable HTTPS
8. ✅ Monitor and maintain

---

## Support

If you run into issues:
- Check the logs (`journalctl`, `docker logs`, or provider dashboard)
- Review the troubleshooting section above
- Check provider documentation
- Test each component separately

Good luck with your Zenith Mail deployment! 🎉
