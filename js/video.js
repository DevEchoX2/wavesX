const API_KEY = "AIzaSyD3v5mYtCNhRHjXNRTMvWF51cFuR3kLZ2U";
const videosGrid = document.getElementById('videosGrid');
const searchInput = document.getElementById('searchInput');

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

async function fetchVideos(query = 'Tech trends') {
  videosGrid.innerHTML = '<div class="loadingMsg">Loading...</div>';
  
  try {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      videosGrid.innerHTML = '<div class="errorMsg">No videos found.</div>';
      return;
    }

    videosGrid.innerHTML = ''; 

    data.items.forEach(item => {
      const videoId = item.id.videoId;
      const snippet = item.snippet;
      
      const card = document.createElement('a');
      card.href = `../videos/player.html?v=${videoId}`;
      card.className = 'videoCard';

      const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '';

      card.innerHTML = `
        <div class="thumbWrapper">
          ${thumb ? `<img src="${thumb}" alt="${snippet.title}" loading="lazy">` : ''}
        </div>
        <div class="videoTitle">${snippet.title}</div>
        <div class="channelName">${snippet.channelTitle}</div>
        <div class="videoMeta">${formatDate(snippet.publishedAt)}</div>
      `;
      
      videosGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    videosGrid.innerHTML = '<div class="errorMsg">Failed to load videos. Check your API key.</div>';
  }
}

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim() !== '') {
    fetchVideos(searchInput.value.trim());
  }
});

fetchVideos('Technology');
