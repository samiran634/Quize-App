let data;
const container = document.querySelector("#profile-container");

async function fetchUserData() {
  try {
    const response = await fetch('/profile');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Fetch and display user data
fetchUserData().then(userData => {
  if (userData) {
    console.log('User data:', userData);
    const userProfile = createUserProfile(userData);
    if (userProfile) {
      console.log(userProfile);
      displayUserProfile(userProfile);
    } else {
      console.log('Failed to create user profile');
    }
  } else {
    console.log('Failed to fetch user data');
  }
});

function createUserProfile(userObject) {
  // Destructure the object to extract the required properties
  const { name, userEmail, password, rank, score } = userObject;

  if (!name || !userEmail || !rank || !score) {
    console.log("Insufficient data to create user profile");
    console.log(name,userEmail,password,rank,score);
    return null;
  }

  const userProfile = {
    username: name,
    email: userEmail,
    rank: rank,
    highestScore: score
  };

  return userProfile;
}

// Function to display user profile on the page
function displayUserProfile(profile) {
  const profileElement = document.createElement('div');
  profileElement.className = 'user-profile';
  profileElement.innerHTML = `
    <h2>${profile.username}</h2>
    <div class="profile-info">
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>Rank:</strong> ${profile.rank}</p>
      <p><strong>Highest Score:</strong> ${profile.highestScore}</p>
    </div>
  `;
  container.appendChild(profileElement);

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .user-profile {
      background-color: #f0f0f0;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      margin: 20px auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .user-profile h2 {
      color: #333;
      margin-top: 0;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }
    .profile-info p {
      margin: 10px 0;
      color: #555;
    }
    .profile-info strong {
      color: #333;
    }
  `;
  document.head.appendChild(style);
}
