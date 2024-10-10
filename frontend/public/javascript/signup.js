document.getElementById("signupButton").addEventListener("click", async () => {
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;

    // Validate the input fields
    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Prepare the data to send in the POST request
    const signupData = {
        name: name,
        userEmail: email,
        passward: password
    };

     
});
