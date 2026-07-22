const API_KEY = ENV.YOUTUBE_API_KEY;

const videoIframe = document.getElementById('videoIframe');
const videoTitle = document.getElementById('videoTitle');
const channelName = document.getElementById('channelName');
const videoStats = document.getElementById('videoStats');
const videoDescription = document.getElementById('videoDescription');
const showMoreBtn = document.getElementById('showMoreBtn');
const upNextList = document.getElementById('upNextList');

const urlParams = new URLSearchParams(window.location.search);
const currentVideoId = urlParams.get('v');

const formatViews = (views) => {
  if (!views) return '';
  const num = parseInt(views);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K views';
  return num + ' views';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

async function fetchVideoDetails(videoId) {
  if (!videoId) return;
  videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;

  try {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const vid = data.items[0];
      const snippet = vid.snippet;
      const stats = vid.statistics;

      videoTitle.textContent = snippet.title;
      channelName.textContent = snippet.channelTitle;
      videoStats.textContent = `${formatViews(stats.viewCount)} • ${formatDate(snippet.publishedAt)}`;
      
      videoDescription.textContent = snippet.description;
      if (snippet.description.trim().length > 0) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.onclick = () => {
          videoDescription.style.webkitLineClamp = 'unset';
          showMoreBtn.style.display = 'none';
        };
      }
    }
  } catch (error) {
    console.error("Error fetching video details:", error);
  }
}

async function fetchUpNext(videoId) {
  if (!videoId) return;

  try {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&relatedToVideoId=${videoId}&key=${API_KEY}`);
    const data = await response.json();

    if (data.items) {
      upNextList.innerHTML = ''; 

      data.items.forEach(item => {
        if (!item.snippet) return;
        
        const a = document.createElement('a');
        a.href = `player.html?v=${item.id.videoId}`; 
        a.className = 'suggestionCard';

        const thumb = item.snippet.thumbnails?.medium?.url || '';
        
        a.innerHTML = `
          <div class="thumbWrapper">
            ${thumb ? `<img src="${thumb}" alt="${item.snippet.title}">` : ''}
          </div>
          <div class="suggestionDetails">
            <div class="suggTitle">${item.snippet.title}</div>
            <div class="suggChannel">${item.snippet.channelTitle}</div>
            <div class="suggStats">${formatDate(item.snippet.publishedAt)}</div>
          </div>
        `;
        upNextList.appendChild(a);
      });
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

if (currentVideoId) {
  fetchVideoDetails(currentVideoId);
  fetchUpNext(currentVideoId);
} else {
  videoTitle.textContent = "No video selected.";
  channelName.textContent = "Go back to search for a video.";
}
