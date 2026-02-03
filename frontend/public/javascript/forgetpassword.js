let forgetpasswordContainer = document.querySelector('.forgetpassword-container');

// Create the form HTML
forgetpasswordContainer.innerHTML = `
  <div class="reset-password-card">
    <div class="card-header">
      <h2>🔐 Reset Password</h2>
      <p>Enter your email and new password</p>
    </div>
    
    <form class="forget-password-form" id="resetForm">
      <div class="form-group">
        <label for="userEmail">Email Address</label>
        <input type="email" id="userEmail" placeholder="Enter your email" required>
      </div>
      
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input type="password" id="newPassword" placeholder="Enter new password" required minlength="6">
        <small class="form-hint">Password must be at least 6 characters</small>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" placeholder="Confirm new password" required>
      </div>
      
      <div id="errorMessage" class="error-message" style="display: none;"></div>
      <div id="successMessage" class="success-message" style="display: none;"></div>
      
      <button type="submit" class="submit-btn" id="submitBtn">
        <span class="btn-text">Reset Password</span>
        <span class="btn-loader" style="display: none;">⏳</span>
      </button>
      
      <div class="form-footer">
        <a href="/login" class="back-link">← Back to Login</a>
      </div>
    </form>
  </div>
`;

const form = document.getElementById('resetForm');
const emailInput = document.getElementById('userEmail');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

function hideMessages() {
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

// Real-time password match validation
confirmPasswordInput.addEventListener('input', () => {
  if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.setCustomValidity('Passwords do not match');
  } else {
    confirmPasswordInput.setCustomValidity('');
  }
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();
  
  const userEmail = emailInput.value.trim();
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // Validation
  if (newPassword !== confirmPassword) {
    showError('Passwords do not match!');
    return;
  }
  
  if (newPassword.length < 6) {
    showError('Password must be at least 6 characters long!');
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';
  
  try {
    // First check if user exists
    const checkResponse = await fetch('/checkuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail })
    });
    
    const checkData = await checkResponse.json();
    
    if (!checkData.exists) {
      showError('No account found with this email address!');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      return;
    }
    
    // Reset password
    const response = await fetch('/forgetpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail, newPassword })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showSuccess('✅ Password reset successfully! Redirecting to login...');
      form.reset();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      showError(data.message || 'Failed to reset password. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('An error occurred. Please check your connection and try again.');
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
});
