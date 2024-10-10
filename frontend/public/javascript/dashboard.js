let parent = document.getElementById('parent');

async function getProfile() {
  try {
    const response = await fetch('/profile', {
      method: 'GET',
      credentials: 'include',  // This line already includes cookies
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;  // Return the user data for further use
  } catch (err) {
    console.error('Error fetching user data:', err);
    return null;  // Handle error and return null or empty data
  }
}

async function showProfileData() {
  const data = await getProfile();
  console.log(data);
  if (!data) {
    console.error('No profile data available.');
    return;
  } else {
    const body = document.body;

    // Create container
    const container = document.createElement('div');
    container.className = 'container';

    // Create sidebar
    const sidebar = createSidebar();

    // Create main content and await its completion
    const mainContent = await createMainContent(data);  // Await here as it's async

    // Append sidebar and main content to container
    container.appendChild(sidebar);
    container.appendChild(mainContent);

    // Append container to body
    parent.appendChild(container);
  }

  function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';

    const title = document.createElement('h2');
    title.textContent = 'Dashboard';
    sidebar.appendChild(title);

    const menu = document.createElement('ul');
    const menuItems = ['Home', 'Profile', 'Settings', 'Reports', 'Logout'];

    menuItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      if (item === 'Home') {
        a.href = '/home';
      } else if (item === 'Logout') {
        a.href = '/logout';
      } else if (item === 'Settings') {
        a.href = '/settings';
      }
      a.textContent = item;
      li.appendChild(a);
      menu.appendChild(li);
    });

    sidebar.appendChild(menu);
    return sidebar;
  }

  async function createMainContent(data) {
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const header = document.createElement('header');
    const h1 = document.createElement('h1');
    h1.textContent = 'Welcome to the Dashboard';
    const p = document.createElement('p');
    p.textContent = 'Here is an overview of your activity.';
    header.appendChild(h1);
    header.appendChild(p);

    const contentGrid = document.createElement('div');
    contentGrid.className = 'content-grid';

    const cardData = [
      { title: 'Rank', value: data.rank },
      { title: 'Name', value: data.name }, 
      { title: 'User Email', value: data.userEmail },
      { title: 'Score', value: data.score },
    ];

    cardData.forEach(dataItem => {
      const card = createCard(dataItem.title, dataItem.value);
      contentGrid.appendChild(card);
    });

    mainContent.appendChild(header);
    mainContent.appendChild(contentGrid);
    return mainContent;
  }

  function createCard(title, value) {
    const card = document.createElement('div');
    card.className = 'card';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const content = document.createElement('div');
    content.className = 'card-content';

    if (isNaN(value) || parseInt(value) < 1000) {
      const p = document.createElement('p');
      p.textContent = value;
      p.style.wordWrap = 'break-word';
      content.appendChild(p);
    } else {
      const canvas = document.createElement('canvas');
      content.appendChild(canvas);
      createDoughnutChart(canvas, title, parseInt(value));
    }

    card.appendChild(h3);
    card.appendChild(content);
    return card;
  }

  function createDoughnutChart(canvas, label, value) {
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [label, 'Other'],
        datasets: [{
          data: [value, 10000 - value],
          backgroundColor: ['#FF6384', '#36A2EB'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index].toLocaleString();
            }
          }
        }
      }
    });
  }
}

showProfileData();
