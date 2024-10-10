let userRankings;

async function fetchData() {
  try {
    const response = await fetch('/read');  // Fetch from /read (relative path)
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

async function fetchAndStoreData() {
  try {
    userRankings = await fetchData();  // Wait for the fetchData promise to resolve
    console.log(userRankings);  // Now you have the resolved data

    createRankingTable();  // Call the function to create the table after data is fetched
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// Call the function to fetch and store the data
fetchAndStoreData();

// Function to create the table and apply styles
function createRankingTable() {
  if (!userRankings || userRankings.length === 0) {
    console.log('No rankings available to display.');
    return;
  }

  // Main container
  const container = document.createElement('div');
  container.style.backgroundColor = '#fff';
  container.style.padding = '2em';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  container.style.width = '80%';
  container.style.maxWidth = '800px';
  container.style.margin = '2em auto';
  container.style.textAlign = 'center';

  // Create heading
  const heading = document.createElement('h2');
  heading.textContent = 'User Rankings';
  heading.style.marginBottom = '2em';
  heading.style.color = '#2c3e50';
  container.appendChild(heading);

  // Create table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  container.appendChild(table);

  // Create table head
  const thead = document.createElement('thead');
  thead.style.backgroundColor = '#34495e';
  thead.style.color = 'white';
  table.appendChild(thead);

  const headerRow = document.createElement('tr');
  thead.appendChild(headerRow);

  const headers = ['Rank', 'User Name', 'Score'];
  // Sort headers based on score
  headers.sort((a, b) => {
    if (a === 'Score') return -1;
    if (b === 'Score') return 1;
    return 0;
  });
  console.log(headers);
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '15px';
    th.style.textAlign = 'left';
    th.style.fontSize = '1.1rem';
    headerRow.appendChild(th);
  });

  // Create table body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // Populate the table with user rankings
  userRankings.forEach((user, index) => {
    const row = document.createElement('tr');
    row.style.backgroundColor = (index % 2 === 0) ? '#f2f2f2' : '#ecf0f1';

    const rankCell = document.createElement('td');
    rankCell.textContent = index + 1;  // Rank starts from 1
    rankCell.style.padding = '15px';
    rankCell.style.fontWeight = 'bold';
    row.appendChild(rankCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = user.name;
    nameCell.style.padding = '15px';
    row.appendChild(nameCell);

    const scoreCell = document.createElement('td');
    scoreCell.textContent = user.score;
    scoreCell.style.padding = '15px';
    row.appendChild(scoreCell);

    // Hover effect
    row.addEventListener('mouseover', () => {
      row.style.backgroundColor = '#d1e7e0';
    });
    row.addEventListener('mouseout', () => {
      row.style.backgroundColor = (index % 2 === 0) ? '#f2f2f2' : '#ecf0f1';
    });

    tbody.appendChild(row);
  });

  // Append the container to the body
  document.body.appendChild(container);
}
