from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage (in production, use a database)
emails_db = []
sent_emails_db = []

# Email configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
ZENITH_DOMAIN = '@zenith.com'


def is_zenith_email(email):
    """Check if email is a @zenith.com address"""
    return email and email.endswith(ZENITH_DOMAIN)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Zenith Mail API is running'})


@app.route('/api/send-email', methods=['POST'])
def send_email():
    """Send an email - internal for @zenith.com, external via SMTP for others"""
    try:
        data = request.json
        to_email = data.get('to')
        subject = data.get('subject')
        body = data.get('body')
        from_email = data.get('from', f'user{ZENITH_DOMAIN}')
        
        if not to_email or not subject or not body:
            return jsonify({'error': 'Missing required fields: to, subject, body'}), 400
        
        # Create the email record
        email_record = {
            'id': len(emails_db) + 1,
            'from': from_email,
            'to': to_email,
            'subject': subject,
            'body': body,
            'timestamp': datetime.now().isoformat(),
            'read': False,
            'folder': 'inbox'
        }
        
        sent_email_record = {
            'id': len(sent_emails_db) + 1,
            'from': from_email,
            'to': to_email,
            'subject': subject,
            'body': body,
            'timestamp': datetime.now().isoformat(),
            'status': 'sent'
        }
        
        # Check if sending to another @zenith.com address
        if is_zenith_email(to_email):
            # Internal Zenith-to-Zenith delivery - instant!
            emails_db.append(email_record)
            sent_emails_db.append(sent_email_record)
            
            return jsonify({
                'success': True,
                'message': f'Email sent to {to_email} successfully!',
                'email_id': email_record['id'],
                'internal_delivery': True
            })
        
        # External email - requires SMTP
        if SMTP_USERNAME and SMTP_PASSWORD:
            try:
                msg = MIMEMultipart()
                msg['From'] = from_email
                msg['To'] = to_email
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'plain'))
                
                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
                
                sent_emails_db.append(sent_email_record)
                
                return jsonify({
                    'success': True,
                    'message': 'Email sent successfully!',
                    'email_id': sent_email_record['id'],
                    'internal_delivery': False
                })
                
            except Exception as e:
                return jsonify({'error': f'Failed to send email: {str(e)}'}), 500
        else:
            # Demo mode for external emails
            sent_emails_db.append(sent_email_record)
            
            return jsonify({
                'success': True,
                'message': f'Email saved (Demo mode - {to_email} is external, configure SMTP to send real emails)',
                'email_id': sent_email_record['id'],
                'demo_mode': True,
                'internal_delivery': False
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/emails', methods=['GET'])
def get_emails():
    """Get all emails for a user"""
    folder = request.args.get('folder', 'inbox')
    user_email = request.args.get('user', f'user{ZENITH_DOMAIN}')
    
    if folder == 'sent':
        filtered_emails = [e for e in sent_emails_db if e['from'] == user_email]
    else:
        filtered_emails = [e for e in emails_db if e.get('folder', 'inbox') == folder]
    
    return jsonify({
        'emails': filtered_emails,
        'count': len(filtered_emails)
    })


@app.route('/api/emails/<int:email_id>', methods=['GET'])
def get_email(email_id):
    """Get a specific email by ID"""
    email = next((e for e in emails_db + sent_emails_db if e['id'] == email_id), None)
    
    if email:
        return jsonify(email)
    else:
        return jsonify({'error': 'Email not found'}), 404


@app.route('/api/emails', methods=['POST'])
def create_email():
    """Create/save a new email"""
    try:
        data = request.json
        email = {
            'id': len(emails_db) + 1,
            'from': data.get('from', f'user{ZENITH_DOMAIN}'),
            'to': data.get('to'),
            'subject': data.get('subject'),
            'body': data.get('body'),
            'timestamp': datetime.now().isoformat(),
            'read': False,
            'folder': data.get('folder', 'inbox')
        }
        emails_db.append(email)
        
        return jsonify({
            'success': True,
            'email': email
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/emails/<int:email_id>', methods=['DELETE'])
def delete_email(email_id):
    """Delete an email"""
    global emails_db
    
    email = next((e for e in emails_db if e['id'] == email_id), None)
    
    if email:
        emails_db = [e for e in emails_db if e['id'] != email_id]
        return jsonify({'success': True, 'message': 'Email deleted'})
    else:
        return jsonify({'error': 'Email not found'}), 404


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current configuration (safe info only)"""
    return jsonify({
        'domain': ZENITH_DOMAIN,
        'smtp_configured': bool(SMTP_USERNAME and SMTP_PASSWORD),
        'demo_mode': not (SMTP_USERNAME and SMTP_PASSWORD)
    })


if __name__ == '__main__':
    print("🚀 Zenith Mail Backend Server")
    print("=" * 50)
    print(f"Domain: {ZENITH_DOMAIN}")
    print(f"SMTP Configured: {bool(SMTP_USERNAME and SMTP_PASSWORD)}")
    if not SMTP_USERNAME:
        print("\n⚠️  Running in DEMO mode")
        print("To send real emails, set SMTP_USERNAME and SMTP_PASSWORD environment variables")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
