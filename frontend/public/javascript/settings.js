let settingsContainer = document.querySelector('.settings-container');
// Create form elements
const form = document.createElement('form');
form.className = 'settings-form';

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
submitButton.textContent = 'Update Password';

// Append elements to form
form.appendChild(newPasswordLabel);
form.appendChild(newPasswordInput);
form.appendChild(confirmPasswordLabel);
form.appendChild(confirmPasswordInput);
form.appendChild(submitButton);

// Add form to settings container
settingsContainer.appendChild(form);

// Add event listener for form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('/updatepassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword }),
            // credentials: 'include' // This ensures cookies are sent with the request
        });
        
        if (response.ok) {
            alert('Password updated successfully!');
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } else {
            const data = await response.json();
            alert(`Failed to update password: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the password.');
    }
});

 

