# 🚀 Zenith Mail

A modern, beautiful email client with **@zenith.com** domain branding.

![Zenith Mail](https://img.shields.io/badge/Zenith-Mail-purple?style=for-the-badge)

## ✨ Features

- 🎨 **Beautiful Modern UI** - Gradient designs, smooth animations, and a clean interface
- 📧 **Send Emails** - Compose and send emails to any address
- 📥 **Inbox Management** - Organize emails with folders (Inbox, Sent, Drafts, Trash)
- 🔍 **Search** - Quick search through your emails
- 📱 **Responsive Design** - Works on all screen sizes
- 🔔 **Notifications** - Toast notifications for actions
- ⚡ **Fast & Smooth** - Built with performance in mind

## 🏗️ Architecture

```
zenith-mail/
├── frontend/           # React-free vanilla JS frontend
│   ├── index.html     # Main HTML structure
│   ├── styles.css     # Beautiful gradient styles
│   └── app.js         # Frontend logic
└── backend/           # Flask API backend
    ├── app.py         # Main Flask application
    ├── requirements.txt
    └── .env.example   # Environment variables template
```

## 🚀 Quick Start

### Option 1: Frontend Only (Demo Mode)

Simply open the frontend in your browser:

```bash
cd zenith-mail/frontend
# Open index.html in your browser
```

Or use a simple HTTP server:

```bash
cd zenith-mail/frontend
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Option 2: Full Stack (With Backend)

1. **Install backend dependencies:**
```bash
cd zenith-mail/backend
pip install -r requirements.txt
```

2. **Configure SMTP (Optional - for sending real emails):**
```bash
cp .env.example .env
# Edit .env with your SMTP credentials
```

3. **Run the backend:**
```bash
python app.py
```

4. **Run the frontend:**
```bash
cd ../frontend
python3 -m http.server 8080
```

5. **Visit:** `http://localhost:8080`

## 📧 Sending Real Emails

To send actual emails (not just demo mode), you need to configure SMTP:

### Gmail Setup:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add credentials to `.env`:
```
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Other Providers:
- **Outlook/Hotmail:** `smtp-mail.outlook.com:587`
- **Yahoo:** `smtp.mail.yahoo.com:587`
- **Custom SMTP:** Update `SMTP_SERVER` and `SMTP_PORT`

## 🎨 UI Highlights

- **Gradient Logo** - Purple gradient "Z" icon
- **Sidebar Navigation** - Dark themed with glowing accents
- **Email Cards** - Clean cards with hover effects
- **Compose Modal** - Smooth animated modal for new emails
- **Toast Notifications** - Success/error feedback
- **Unread Indicators** - Blue accent for unread emails

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework needed!)
- CSS3 with custom properties
- SVG Icons

**Backend:**
- Python Flask
- Flask-CORS
- SMTP for email delivery

## 📸 Screenshots

The interface features:
- Left sidebar with navigation
- Top search bar
- Email list with sender avatars
- Compose button with gradient
- User profile section

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use App Passwords, not regular passwords
- In production, use HTTPS
- Implement proper authentication for multi-user support

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Database integration
- [ ] Email attachments
- [ ] Rich text editor
- [ ] Email templates
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Contact management

---

**Built with ❤️ by Zenith Team**

*Your emails, elevated.*
