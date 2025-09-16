import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('membershipForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  // simple utility to show temporary alerts (success/error)
  function showAlert(message, type = 'success', timeout = 4000) {
    const existing = document.querySelector('.membership-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `membership-alert ${type}`;
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
    const number = (formData.get('number') || '').trim();
    const category = (formData.get('category') || '').trim();
    const dateEstablished = (formData.get('date_established') || '').trim();
    const organizationSize = (formData.get('organization_size') || '').trim();
    const yearsActivity = (formData.get('years_activity') || '').trim();
    const message = (formData.get('message') || '').trim();

    // client-side validation
    if (!name) return showAlert('Please enter your organization name.', 'error');
    if (!email || !isValidEmail(email)) return showAlert('Please enter a valid email address.', 'error');
    if (!number) return showAlert('Please enter a contact number.', 'error');
    if (!category) return showAlert('Please select a category.', 'error');
    if (!dateEstablished) return showAlert('Please provide the date your organization was established.', 'error');
    if (!organizationSize || isNaN(organizationSize) || organizationSize <= 0) 
      return showAlert('Please enter a valid organization size (number of employees).', 'error');
    if (!yearsActivity || isNaN(yearsActivity) || yearsActivity < 0) 
      return showAlert('Please enter a valid number of years of activity.', 'error');

    // add current submission date
    const submissionDate = new Date().toISOString().split('T')[0];

    const payload = { 
      name, 
      email, 
      number, 
      category, 
      date_established: dateEstablished, 
      organization_size: Number(organizationSize), 
      years_activity: Number(yearsActivity), 
      message, 
      submission_date: submissionDate 
    };

    // disable UI while sending
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server error (${res.status})`;
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errBody.error || errMsg;
        } catch (err) {}
        throw new Error(errMsg);
      }

      // success
      showAlert('Application submitted, you will receive a confirmation email', 'success');
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
