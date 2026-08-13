// Zenith Mail - Frontend Application

let currentFolder = 'inbox';
let emails = [];

// Sample initial emails
const sampleEmails = [
    {
        id: 1,
        from: 'welcome@zenith.com',
        senderName: 'Zenith Team',
        subject: 'Welcome to Zenith Mail!',
        body: 'Welcome to Zenith Mail - the future of email communication. We\'re excited to have you on board!\n\nWith Zenith, you can:\n- Send and receive emails seamlessly\n- Enjoy a beautiful, modern interface\n- Experience lightning-fast performance\n\nGet started by composing your first email!\n\nBest regards,\nThe Zenith Team',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        folder: 'inbox'
    },
    {
        id: 2,
        from: 'support@zenith.com',
        senderName: 'Zenith Support',
        subject: 'Tips for getting started',
        body: 'Here are some quick tips to help you get the most out of Zenith Mail:\n\n1. Use the Compose button to create new emails\n2. Organize your emails using folders\n3. Search for emails using the search bar\n4. Mark important emails as unread\n\nIf you have any questions, feel free to reach out to our support team.\n\nHappy emailing!\nZenith Support',
        timestamp: new Date(Date.now() - 7200000),
        read: false,
        folder: 'inbox'
    },
    {
        id: 3,
        from: 'newsletter@tech.com',
        senderName: 'Tech Newsletter',
        subject: 'Weekly Tech Updates',
        body: 'This week in tech:\n\n- New AI breakthroughs announced\n- Latest smartphone releases\n- Cloud computing trends\n- Cybersecurity best practices\n\nStay tuned for more updates next week!\n\nThe Tech Newsletter Team',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        folder: 'inbox'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadEmails();
    updateInboxCount();
});

function loadEmails() {
    emails = [...sampleEmails];
    renderEmails(currentFolder);
}

function renderEmails(folder) {
    const container = document.getElementById('email-list');
    const filteredEmails = emails.filter(email => email.folder === folder);
    
    if (filteredEmails.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <h3>No emails in ${folder}</h3>
                <p>Your ${folder} is empty</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredEmails.map(email => `
        <div class="email-card ${email.read ? '' : 'unread'}" onclick="viewEmail(${email.id})">
            <div class="email-header">
                <div class="email-sender">
                    <div class="sender-avatar">${getInitials(email.senderName)}</div>
                    <div class="sender-info">
                        <h3>${escapeHtml(email.senderName)}</h3>
                        <p>${escapeHtml(email.from)}</p>
                    </div>
                </div>
                <span class="email-time">${formatTime(email.timestamp)}</span>
            </div>
            <div class="email-subject">${escapeHtml(email.subject)}</div>
            <div class="email-preview">${escapeHtml(email.body.substring(0, 150))}${email.body.length > 150 ? '...' : ''}</div>
            <div class="email-actions">
                <button class="action-btn" onclick="event.stopPropagation(); replyToEmail('${escapeHtml(email.from)}', '${escapeHtml(email.subject)}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                    </svg>
                    Reply
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); deleteEmail(${email.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function viewEmail(id) {
    const email = emails.find(e => e.id === id);
    if (email) {
        email.read = true;
        renderEmails(currentFolder);
        updateInboxCount();
        
        // Show email in a modal or expand it
        showToast(`Opening email: ${email.subject}`, 'success');
    }
}

function showComposeModal() {
    document.getElementById('compose-modal').classList.add('active');
}

function hideComposeModal() {
    document.getElementById('compose-modal').classList.remove('active');
    document.getElementById('compose-form').reset();
}

function sendEmail(event) {
    event.preventDefault();
    
    const to = document.getElementById('to-email').value;
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;
    
    // Create new email object
    const newEmail = {
        id: Date.now(),
        from: 'user@zenith.com',
        senderName: 'You',
        to: to,
        subject: subject,
        body: body,
        timestamp: new Date(),
        read: true,
        folder: 'sent'
    };
    
    // Add to emails array
    emails.unshift(newEmail);
    
    // Hide modal
    hideComposeModal();
    
    // Show success message
    showToast('Email sent successfully!', 'success');
    
    // Refresh the view
    renderEmails(currentFolder);
    updateInboxCount();
    
    // In a real app, this would send to backend
    console.log('Email sent:', { to, subject, body });
}

function replyToEmail(from, subject) {
    showComposeModal();
    document.getElementById('to-email').value = from;
    document.getElementById('email-subject').value = `Re: ${subject}`;
}

function deleteEmail(id) {
    const email = emails.find(e => e.id === id);
    if (email) {
        if (currentFolder === 'trash') {
            // Permanently delete
            emails = emails.filter(e => e.id !== id);
            showToast('Email permanently deleted', 'success');
        } else {
            // Move to trash
            email.folder = 'trash';
            showToast('Email moved to trash', 'success');
        }
        renderEmails(currentFolder);
        updateInboxCount();
    }
}

function loadInbox() {
    currentFolder = 'inbox';
    updateNavActive('inbox');
    renderEmails('inbox');
}

function loadSent() {
    currentFolder = 'sent';
    updateNavActive('sent');
    renderEmails('sent');
}

function loadDrafts() {
    currentFolder = 'drafts';
    updateNavActive('drafts');
    renderEmails('drafts');
}

function loadTrash() {
    currentFolder = 'trash';
    updateNavActive('trash');
    renderEmails('trash');
}

function updateNavActive(folder) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.nav-item[onclick="load${capitalizeFirst(folder)}()"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function updateInboxCount() {
    const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;
    const badge = document.getElementById('inbox-count');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        renderEmails(currentFolder);
        return;
    }
    
    const filtered = emails.filter(email => 
        email.folder === currentFolder &&
        (email.subject.toLowerCase().includes(query) ||
         email.body.toLowerCase().includes(query) ||
         email.senderName.toLowerCase().includes(query))
    );
    
    const container = document.getElementById('email-list');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No results found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(email => `
        <div class="email-card ${email.read ? '' : 'unread'}" onclick="viewEmail(${email.id})">
            <div class="email-header">
                <div class="email-sender">
                    <div class="sender-avatar">${getInitials(email.senderName)}</div>
                    <div class="sender-info">
                        <h3>${escapeHtml(email.senderName)}</h3>
                        <p>${escapeHtml(email.from)}</p>
                    </div>
                </div>
                <span class="email-time">${formatTime(email.timestamp)}</span>
            </div>
            <div class="email-subject">${escapeHtml(email.subject)}</div>
            <div class="email-preview">${escapeHtml(email.body.substring(0, 150))}${email.body.length > 150 ? '...' : ''}</div>
        </div>
    `).join('');
});
