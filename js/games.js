const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const gameCountDisplay = document.getElementById('gameCount');
const categorySelect = document.getElementById('categorySelect');

const UGS_API = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-json@main/games.json";
const UGS_HTML_URL1 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-1@main/";
const UGS_HTML_URL2 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-2@main/";
const UGS_HTML_URL3 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-3@main/";

let gamesData = [];
let currentSource = categorySelect.value;

function loadGames() {
  gamesGrid.innerHTML = '<div class="errorMsg">Loading...</div>';
  const fetchUrl = currentSource === 'game' ? '../game.json' : UGS_API;
  
  fetch(fetchUrl)
    .then(response => {
      if (!response.ok) throw new Error("Failed to load");
      return response.json();
    })
    .then(data => {
      let rawData = Array.isArray(data) ? data : [];
      
      if (currentSource === 'zone') {
        gamesData = rawData.map(game => {
          let baseUrl = UGS_HTML_URL1;
          if (game.repo === 2 || game.repo === "ugs-2") baseUrl = UGS_HTML_URL2;
          if (game.repo === 3 || game.repo === "ugs-3") baseUrl = UGS_HTML_URL3;
          
          return {
            title: game.title || game.name || 'Unknown Game',
            image: game.image || game.cover || '',
            url: baseUrl + (game.link || '')
          };
        });
      } else {
        gamesData = rawData;
      }

      renderGames(gamesData);
    })
    .catch(err => {
      gamesGrid.innerHTML = `<div class="errorMsg">Failed to load games from ${fetchUrl}</div>`;
    });
}

function renderGames(games) {
  gamesGrid.innerHTML = '';
  gameCountDisplay.textContent = games.length;

  games.forEach(game => {
    const card = document.createElement('a');
    const title = game.title || game.name || 'Unknown Game';
    const image = game.image || game.cover || '';
    
    const rawUrl = game.url || (game.directory ? `../${game.directory}/` : '#');
    card.href = `browser.html?url=${encodeURIComponent(rawUrl)}`;
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

categorySelect.addEventListener('change', (e) => {
  currentSource = e.target.value;
  searchInput.value = '';
  loadGames();
});

loadGames();
