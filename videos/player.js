const WORKER_URL = "https://your-wavesyt-worker.workers.dev";

const videoIframe = document.getElementById('videoIframe');
const videoTitle = document.getElementById('videoTitle');
const channelName = document.getElementById('channelName');
const videoStats = document.getElementById('videoStats');
const videoDescription = document.getElementById('videoDescription');
const descBox = document.getElementById('descBox');
const showMoreBtn = document.getElementById('showMoreBtn');
const upNextList = document.getElementById('upNextList');

const subBtn = document.getElementById('subBtn');
const likeBtn = document.getElementById('likeBtn');
const likeText = document.getElementById('likeText');
const saveBtn = document.getElementById('saveBtn');

const urlParams = new URLSearchParams(window.location.search);
const currentVideoId = urlParams.get('v');

const formatNumber = (numStr) => {
  if (!numStr) return '0';
  const num = parseInt(numStr);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

if (subBtn) {
  subBtn.addEventListener('click', () => {
    const isFollowed = subBtn.classList.toggle('followed');
    subBtn.textContent = isFollowed ? 'Following' : 'Follow';
  });
}

if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    const icon = likeBtn.querySelector('span');
    const isLiked = likeBtn.style.borderColor === 'var(--accent)';
    
    if (isLiked) {
      likeBtn.style.borderColor = 'var(--border-color)';
      likeBtn.style.color = 'var(--text-bright)';
      icon.style.fontVariationSettings = "'FILL' 0";
      likeText.textContent = 'Like';
    } else {
      likeBtn.style.borderColor = 'var(--accent)';
      likeBtn.style.color = 'var(--accent)';
      icon.style.fontVariationSettings = "'FILL' 1";
      likeText.textContent = 'Liked';
    }
  });
}

let isDescExpanded = false;
if (descBox) {
  descBox.addEventListener('click', () => {
    isDescExpanded = !isDescExpanded;
    if (isDescExpanded) {
      videoDescription.classList.remove('collapsed');
      showMoreBtn.textContent = 'Show less';
    } else {
      videoDescription.classList.add('collapsed');
      showMoreBtn.textContent = 'Read more';
    }
  });
}

async function fetchVideoDetails(videoId) {
  if (!videoId) return;
  videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  try {
    const response = await fetch(`${WORKER_URL}/details?id=${videoId}`);
    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const vid = data.items[0];
      const snippet = vid.snippet;
      const stats = vid.statistics;

      videoTitle.textContent = snippet.title;
      channelName.textContent = snippet.channelTitle;
      videoStats.textContent = `${formatNumber(stats.viewCount)} views • Uploaded ${formatDate(snippet.publishedAt)}`;
      videoDescription.textContent = snippet.description || 'No context provided for this transmission.';
    }
  } catch (error) {
    videoTitle.textContent = "Awaiting Backend Configuration";
    videoDescription.textContent = "The connection to the Cloudflare Worker was not established. Please check your WavesYT deployment.";
  }
}

async function fetchUpNext(videoId) {
  if (!videoId) return;
  upNextList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:20px;">Scanning frequencies...</div>';

  try {
    const response = await fetch(`${WORKER_URL}/related?id=${videoId}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    
    const data = await response.json();

    if (data.items) {
      upNextList.innerHTML = ''; 
      data.items.forEach((item, i) => {
        if (!item.snippet) return;
        const a = document.createElement('a');
        a.href = `player.html?v=${item.id.videoId || item.id}`; 
        a.className = 'sugg-card';
        a.style.animation = `fadeInRight 0.5s ease forwards ${(i * 0.1)}s`;
        a.style.opacity = '0';

        const thumb = item.snippet.thumbnails?.medium?.url || '';
        
        a.innerHTML = `
          <div class="sugg-thumb">
            ${thumb ? `<img src="${thumb}" alt="Cover art">` : ''}
          </div>
          <div class="sugg-info">
            <div class="sugg-title">${item.snippet.title}</div>
            <div class="sugg-meta">${item.snippet.channelTitle}<br>${formatDate(item.snippet.publishedAt)}</div>
          </div>
        `;
        upNextList.appendChild(a);
      });
      
      const style = document.createElement('style');
      style.innerHTML = `@keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`;
      document.head.appendChild(style);
    }
  } catch (error) {
    upNextList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:20px;">Discovery engine offline.</div>';
  }
}

if (currentVideoId) {
  fetchVideoDetails(currentVideoId);
  fetchUpNext(currentVideoId);
} else {
  videoTitle.textContent = "Signal Lost";
  channelName.textContent = "Unknown Source";
  videoDescription.textContent = "Please return to the main dashboard to select a valid transmission.";
}
