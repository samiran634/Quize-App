let forgetpasswordContainer = document.querySelector('.forgetpassword-container');
// Create form elements
const form = document.createElement('form');
form.className = 'forget-password-form';

const emailLabel = document.createElement('label');
emailLabel.textContent = 'Email:';
const emailInput = document.createElement('input');
emailInput.type = 'email';
emailInput.id = 'userEmail';
emailInput.required = true;

const newPasswordLabel = document.createElement('label');
newPasswordLabel.textContent = 'New Password:';
const newPasswordInput = document.createElement('input');
newPasswordInput.type = 'password';
newPasswordInput.id = 'newPassword';
newPasswordInput.required = true;

const confirmPasswordLabel = document.createElement('label');
confirmPasswordLabel.textContent = 'Confirm Password:';
const confirmPasswordInput = document.createElement('input');
confirmPasswordInput.type = 'password';
confirmPasswordInput.id = 'confirmPassword';
confirmPasswordInput.required = true;

const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = 'Reset Password';

// Append elements to form
form.appendChild(emailLabel);
form.appendChild(emailInput);
form.appendChild(newPasswordLabel);
form.appendChild(newPasswordInput);
form.appendChild(confirmPasswordLabel);
form.appendChild(confirmPasswordInput);
form.appendChild(submitButton);

// Add form to forgetpassword container
forgetpasswordContainer.appendChild(form);

// Add event listener for form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userEmail = emailInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('/forgetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userEmail, newPassword })
        });
        
        if (response.ok) {
            alert('Password reset successfully!');
            emailInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } else {
            const data = await response.json();
            alert(`Failed to reset password: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while resetting the password.');
    }
});
