const videos = document.querySelectorAll('.video');

const formatCount = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
};

const updateCount = (element, value) => {
  if (!element) return;
  element.dataset.count = String(value);
  element.textContent = formatCount(value);
};

const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1500);
};

const playVisibleVideo = (video) => {
  const rect = video.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.2;

  if (isVisible) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
};

const addCommentInteractions = () => {
  document.querySelectorAll('.video-card').forEach((card) => {
    const heartButton = card.querySelector('.heart-btn');
    const commentButton = card.querySelector('.comment-btn');
    const shareButton = card.querySelector('.share-btn');
    const commentPanel = card.querySelector('.comment-panel');
    const closeButton = card.querySelector('.close-comments');
    const commentForm = card.querySelector('.comment-form');
    const commentList = card.querySelector('.comment-list');
    const heartIcon = heartButton?.querySelector('.icon');
    const heartCount = heartButton?.querySelector('.count');
    const commentCount = commentButton?.querySelector('.count');

    heartButton?.addEventListener('click', () => {
      const isLiked = heartButton.dataset.liked === 'true';
      const currentValue = Number(heartCount?.dataset.count || 0);
      const nextValue = isLiked ? currentValue - 1 : currentValue + 1;

      heartButton.dataset.liked = String(!isLiked);
      heartButton.classList.toggle('liked', !isLiked);
      heartIcon.textContent = !isLiked ? '♥' : '♡';
      updateCount(heartCount, nextValue);
    });

    commentButton?.addEventListener('click', () => {
      commentPanel?.classList.toggle('open');
    });

    closeButton?.addEventListener('click', () => {
      commentPanel?.classList.remove('open');
    });

    commentForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = commentForm.querySelector('input');
      const value = input.value.trim();

      if (!value) return;

      const newComment = document.createElement('li');
      newComment.textContent = value;
      commentList.prepend(newComment);
      input.value = '';

      if (commentCount) {
        const currentValue = Number(commentCount.dataset.count || 0);
        updateCount(commentCount, currentValue + 1);
      }

      showToast('Comment posted');
    });

    shareButton?.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copied');
        } else {
          showToast('Share ready');
        }
      } catch (error) {
        showToast('Share ready');
      }
    });
  });
};

const setUpVideoObserver = () => {
  const options = {
    root: null,
    threshold: [0.45, 0.7, 1.0],
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, options);

  videos.forEach((video) => {
    observer.observe(video);

    video.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });
};

window.addEventListener('load', () => {
  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    playVisibleVideo(video);
  });

  addCommentInteractions();
  setUpVideoObserver();
});

window.addEventListener('scroll', () => {
  videos.forEach((video) => playVisibleVideo(video));
}, { passive: true });
