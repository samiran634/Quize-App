document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    // Make sure email and password are not empty
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Prepare the data to send in the POST request
    const loginData = {
        userEmail: email,
        passward: password
    };

 
});

  