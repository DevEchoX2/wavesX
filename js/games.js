const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const gameCountDisplay = document.getElementById('gameCount');
const categoryToggle = document.getElementById('categoryToggle');
const categoryLabel = document.getElementById('categoryLabel');
let gamesData = [];
let currentSource = 'game';

function loadGames() {
  gamesGrid.innerHTML = '<div class="errorMsg">Loading...</div>';
  const jsonFile = currentSource === 'game' ? '../game.json' : '../zone.json';
  
  fetch(jsonFile)
    .then(response => {
      if (!response.ok) throw new Error();
      return response.json();
    })
    .then(data => {
      gamesData = Array.isArray(data) ? data : [];
      renderGames(gamesData);
    })
    .catch(() => {
      gamesGrid.innerHTML = `<div class="errorMsg">Failed to load ${jsonFile}</div>`;
    });
}

function renderGames(games) {
  gamesGrid.innerHTML = '';
  gameCountDisplay.textContent = games.length;

  games.forEach(game => {
    const card = document.createElement('a');
    const title = game.title || game.name || 'Unknown Game';
    const image = game.image || '';
    const href = game.url || game.directory || '#';

    card.href = href;
    card.className = 'gameCard';

    const img = document.createElement('img');
    img.src = image;
    img.alt = title;
    img.loading = 'lazy';
    img.onerror = () => {
      img.remove();
      card.classList.add('imageMissing');
    };

    const titleBox = document.createElement('div');
    titleBox.className = 'gameTitle';
    titleBox.textContent = title;

    card.appendChild(img);
    card.appendChild(titleBox);
    gamesGrid.appendChild(card);
  });
}

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredGames = gamesData.filter(game => {
    const title = (game.title || game.name || '').toLowerCase();
    const directory = (game.directory || '').toLowerCase();
    return title.includes(searchTerm) || directory.includes(searchTerm);
  });
  renderGames(filteredGames);
});

categoryToggle.addEventListener('click', () => {
  currentSource = currentSource === 'game' ? 'zone' : 'game';
  categoryLabel.textContent = currentSource;
  searchInput.value = '';
  loadGames();
});

loadGames();
