let performanceChart = null;

async function getProfile() {
  try {
    const response = await fetch('/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching user data:', err);
    return null;
  }
}

async function loadDashboard() {
  const data = await getProfile();
  
  if (!data) {
    console.error('No profile data available.');
    document.getElementById('statsGrid').innerHTML = '<p class="error-message">Failed to load profile data. Please refresh the page.</p>';
    return;
  }

  // Update stats grid
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = `
    <div class="stat-card rank-card">
      <div class="stat-icon">🏅</div>
      <div class="stat-content">
        <h3>Your Rank</h3>
        <p class="stat-value">#${data.rank || 'N/A'}</p>
      </div>
    </div>
    
    <div class="stat-card score-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-content">
        <h3>Total Score</h3>
        <p class="stat-value">${data.score || 0}</p>
      </div>
    </div>
    
    <div class="stat-card name-card">
      <div class="stat-icon">👤</div>
      <div class="stat-content">
        <h3>Player Name</h3>
        <p class="stat-value">${data.name || 'Unknown'}</p>
      </div>
    </div>
    
    <div class="stat-card email-card">
      <div class="stat-icon">📧</div>
      <div class="stat-content">
        <h3>Email</h3>
        <p class="stat-value small">${data.userEmail || 'N/A'}</p>
      </div>
    </div>
  `;

  // Update performance chart
  updatePerformanceChart(data);
}

function updatePerformanceChart(data) {
  const ctx = document.getElementById('performanceChart');
  
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (performanceChart) {
    performanceChart.destroy();
  }

  performanceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Your Score', 'Remaining to Top'],
      datasets: [{
        data: [data.score || 0, Math.max(0, 1000 - (data.score || 0))],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.2)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 0.5)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              size: 12
            },
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed.toLocaleString() + ' pts';
            }
          }
        }
      }
    }
  });
}

// Refresh button handler
document.getElementById('refreshBtn').addEventListener('click', async () => {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  
  await loadDashboard();
  
  setTimeout(() => {
    btn.classList.remove('spinning');
  }, 500);
});

// Initial load
loadDashboard();

// Auto-refresh every 30 seconds
setInterval(loadDashboard, 30000);
