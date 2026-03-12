const express = require('express');
const app = express();
const PORT = 3000;

// Beautiful HTML frontend with table
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arc Testnet Leaderboard 🔥</title>
  <style>
    body { font-family: Arial; background: #0f0f23; color: white; text-align: center; padding: 20px; }
    table { width: 100%; max-width: 800px; margin: 20px auto; border-collapse: collapse; }
    th, td { padding: 12px; border: 1px solid #333; }
    th { background: #1a1a3d; }
    tr:nth-child(even) { background: #1f1f3d; }
    .top1 { background: gold; color: black; font-weight: bold; }
    button { padding: 10px 20px; background: #00ff9d; color: black; border: none; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>🚀 Arc Testnet Live Activity Leaderboard</h1>
  <p>Top 10 most active wallets (recent transactions)</p>
  <button onclick="loadLeaderboard()">Refresh Leaderboard</button>
  <table id="table">
    <tr><th>Rank</th><th>Wallet Address</th><th>Tx Count</th></tr>
  </table>

  <script>
    async function loadLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        const tbody = document.getElementById('table');
        tbody.innerHTML = '<tr><th>Rank</th><th>Wallet Address</th><th>Tx Count</th></tr>';
        data.forEach((item, i) => {
          const row = document.createElement('tr');
          if (i === 0) row.classList.add('top1');
          row.innerHTML = '<td>#' + (i+1) + '</td><td><a href="https://testnet.arcscan.app/address/' + item.address + '" target="_blank">' + item.address.slice(0,8) + '...' + item.address.slice(-6) + '</a></td><td>' + item.count + '</td>';
          tbody.appendChild(row);
        });
      } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('table').innerHTML += '<tr><td colspan="3">Error loading data - Check console</td></tr>';
      }
    }
    loadLeaderboard(); // Auto load on page open
  </script>
</body>
</html>`;

app.get('/', (req, res) => res.send(html));

// API for leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const response = await fetch('https://testnet.arcscan.app/api/v2/transactions');
    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }
    const apiData = await response.json();  // renamed to avoid conflicts

    const countMap = {};
    (apiData.items || []).forEach(tx => {
      if (tx.from && tx.from.hash) {
        const fromAddr = tx.from.hash.toLowerCase();
        countMap[fromAddr] = (countMap[fromAddr] || 0) + 1;
      }
      if (tx.to && tx.to.hash) {
        const toAddr = tx.to.hash.toLowerCase();
        countMap[toAddr] = (countMap[toAddr] || 0) + 1;
      }
    });

    const leaderboard = Object.entries(countMap)
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log('Leaderboard generated:', leaderboard.length, 'entries');  // debug in Termux

    res.json(leaderboard);
  } catch (e) {
    console.error('Leaderboard error:', e.message);
    res.json([{ address: 'Error loading - see Termux console', count: 0 }]);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Leaderboard live on http://localhost:${PORT}`);
});
