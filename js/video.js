const WORKER_URL = "https://your-wavesyt-worker.workers.dev"; 

const videosGrid = document.getElementById('videosGrid');
const searchInput = document.getElementById('searchInput');

const formatDate = (dateString) => {
  if (!dateString) return 'Recently discovered';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 0) return 'Just now';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
};

const renderSkeletons = (count = 12) => {
  videosGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    videosGrid.innerHTML += `
      <div class="video-card fade-in">
        <div class="thumb-wrapper skeleton skel-thumb"></div>
        <div class="card-info">
          <div class="text-info" style="width: 100%">
            <div class="skeleton skel-text"></div>
            <div class="skeleton skel-text short"></div>
          </div>
        </div>
      </div>
    `;
  }
};

const setupScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '50px' });

  document.querySelectorAll('.video-card:not(.fade-in)').forEach(card => {
    observer.observe(card);
  });
};

async function fetchVideos(query = 'Discover') {
  renderSkeletons();
  
  try {
    const response = await fetch(`${WORKER_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Backend pending connection');
    
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      videosGrid.innerHTML = '<div class="status-msg">No results found.</div>';
      return;
    }

    videosGrid.innerHTML = ''; 

    data.items.forEach((item, index) => {
      const videoId = item.id.videoId || item.id; 
      const snippet = item.snippet;
      const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '';
      
      const card = document.createElement('a');
      card.href = `../videos/player.html?v=${videoId}`;
      card.className = 'video-card';
      
      card.style.transitionDelay = `${(index % 12) * 0.03}s`;

      card.innerHTML = `
        <div class="thumb-wrapper">
          ${thumb ? `<img src="${thumb}" alt="Cover art" loading="lazy">` : ''}
        </div>
        <div class="card-info">
          <div class="text-info">
            <div class="video-title">${snippet.title}</div>
            <div class="channel-name">${snippet.channelTitle}</div>
            <div class="video-meta">${formatDate(snippet.publishedAt)}</div>
          </div>
        </div>
      `;
      videosGrid.appendChild(card);
    });

    setTimeout(() => {
      document.querySelectorAll('.video-card').forEach(card => card.style.transitionDelay = '0s');
    }, 800);

    setupScrollAnimations();

  } catch (error) {
    videosGrid.innerHTML = `
      <div class="status-msg">
        Waiting for the WavesYT backend connection.
      </div>
    `;
  }
}

let debounceTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const val = e.target.value.trim();
    fetchVideos(val !== '' ? val : 'Discover');
  }, 800);
});

fetchVideos('Discover');
