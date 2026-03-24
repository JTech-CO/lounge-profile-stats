(() => {
  const BADGE_ID = 'lounge-profile-stats-badge';

  function extractCountsFromRSC() {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent;
      if (!text) continue;

      const postMatch = text.match(/"totalPostCount"\s*:\s*(\d+)/);
      const commentMatch = text.match(/"totalCommentCount"\s*:\s*(\d+)/);

      if (postMatch && commentMatch) {
        // Find the one that matches the current profile ID if possible, but extracting from all scripts is risky in SPA.
        // We will prioritize DOM later.
        return {
          totalPosts: parseInt(postMatch[1], 10),
          totalComments: parseInt(commentMatch[1], 10),
        };
      }
    }
    return null;
  }

  function extractCountsFromDOM() {
    let totalPosts = 0;
    let totalComments = 0;

    const subTexts = document.querySelectorAll('[data-slot="profile-sub-text"] > span');
    for (const span of subTexts) {
      const text = span.textContent.trim();
      const postMatch = text.match(/게시글\s*([\d,]+)/);
      const commentMatch = text.match(/댓글\s*([\d,]+)/);
      if (postMatch) totalPosts += parseInt(postMatch[1].replace(/,/g, ''), 10);
      if (commentMatch) totalComments += parseInt(commentMatch[1].replace(/,/g, ''), 10);
    }

    if (totalPosts === 0 && totalComments === 0) return null;
    return { totalPosts, totalComments };
  }

  function renderBadge({ totalPosts, totalComments }) {
    let badge = document.getElementById(BADGE_ID);

    if (!badge) {
      badge = document.createElement('div');
      badge.id = BADGE_ID;

      const tablist = document.querySelector('[role="tablist"]');
      if (tablist) {
        tablist.insertAdjacentElement('afterend', badge);
      } else {
        return;
      }
    }

    badge.innerHTML =
      `<span class="ls-tag ls-posts">게시글 ${totalPosts.toLocaleString()}</span>` +
      `<span class="ls-tag ls-comments">댓글 ${totalComments.toLocaleString()}</span>`;
  }

  function run() {
    if (!window.location.pathname.startsWith('/profiles/')) return;
    const counts = extractCountsFromDOM() || extractCountsFromRSC();
    if (!counts) return;
    renderBadge(counts);
  }

  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(run, 1000);
})();
