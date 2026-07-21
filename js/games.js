const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const gameCountDisplay = document.getElementById('gameCount');
const categorySelect = document.getElementById('categorySelect');

const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";

let gamesData = [];
let currentSource = categorySelect.value;

function loadGames() {
  gamesGrid.innerHTML = '<div class="errorMsg">Loading...</div>';
  const jsonFile = currentSource === 'game' ? '../game.json' : '../zone.json';
  
  fetch(jsonFile)
    .then(response => {
      if (!response.ok) throw new Error();
      return response.json();
    })
    .then(data => {
      let rawData = Array.isArray(data) ? data : [];
      
      if (currentSource === 'zone') {
        gamesData = rawData
          .filter(game => game.id !== -1 && game.id !== 1 && game.id !== 64 && game.name && game.url)
          .map(game => {
            let processedUrl = game.url.replace(/{HTML_URL}/g, HTML_URL).replace(/{COVER_URL}/g, COVER_URL);
            let processedImage = game.cover 
              ? game.cover.replace(/{COVER_URL}/g, COVER_URL).replace(/{HTML_URL}/g, HTML_URL) 
              : '';

            if (game.id === 0) {
                processedUrl = "https://cdn.jsdelivr.net/gh/bubbls/youtube-playables@main/bowmasters/index.html";
            }

            return {
              title: game.name,
              image: processedImage,
              url: processedUrl
            };
          });
      } else {
        gamesData = rawData;
      }

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
    const image = game.image || game.cover || '';
    
    const href = game.url || (game.directory ? `../${game.directory}/` : '#');

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

categorySelect.addEventListener('change', (e) => {
  currentSource = e.target.value;
  searchInput.value = '';
  loadGames();
});

loadGames();
