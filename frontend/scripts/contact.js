import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  // simple utility to show temporary alerts (success/error)
  function showAlert(message, type = 'success', timeout = 4000) {
    // remove any existing alert
    const existing = document.querySelector('.contact-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `contact-alert ${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      background: ${type === 'success' ? 'rgba(64,147,71,0.95)' : 'rgba(220,53,69,0.95)'};
      color: white;
      font-weight: 600;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), timeout);
  }

  // basic email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // read values
    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const subject = (formData.get('subject') || '').trim();
    const message = (formData.get('message') || '').trim();

    // client-side validation
    if (!name) return showAlert('Please enter your name.', 'error');
    if (!email || !isValidEmail(email)) return showAlert('Please enter a valid email address.', 'error');
    if (!message) return showAlert('Message cannot be empty.', 'error');

    // create date in YYYY-MM-DD (DB requires `date` NOT NULL)
    const date = new Date().toISOString().split('T')[0];

    const payload = { name, email, subject, message, date };

    // disable UI while sending
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to parse error body for helpful message
        let errMsg = `Server error (${res.status})`;
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errBody.error || errMsg;
        } catch (err) { /* ignore */ }
        throw new Error(errMsg);
      }

      // success
      showAlert('Message sent, you will receive a confirmation email', 'success');
      form.reset();
    } catch (err) {
      console.error('Submit error:', err);
      showAlert(`Submission failed: ${err.message || 'Network error'}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
