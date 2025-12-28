/**
 * APU Recruitment Tracker
 * Tracks pageviews, video plays, and engagement time.
 * Sends email alert when someone spends 30+ seconds on the site.
 */
(function() {
  'use strict';

  const TRACK_ENDPOINT = '/api/track';
  const ALERT_ENDPOINT = '/api/alert';
  const ALERT_THRESHOLD_SECONDS = 30;

  let hasTrackedPageview = false;
  let hasSentAlert = false;
  let trackedVideos = new Set();
  let maxVideoProgress = 0;
  let watchedVideo = false;

  // Session tracking
  const sessionStart = Date.now();
  const pagesViewed = [window.location.pathname];
  const referrer = document.referrer || null;

  // Detect device type
  function getDevice() {
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    if (/mobile|iphone|android.*mobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // Send tracking event
  function track(type, data = {}) {
    const payload = {
      type: type,
      page: window.location.pathname,
      referrer: referrer,
      ...data
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_ENDPOINT, JSON.stringify(payload));
    } else {
      fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Send engagement alert
  function sendAlert() {
    if (hasSentAlert) return;

    const timeOnSite = Math.floor((Date.now() - sessionStart) / 1000);
    if (timeOnSite < ALERT_THRESHOLD_SECONDS) return;

    hasSentAlert = true;

    const payload = {
      timeOnSite: timeOnSite,
      pagesViewed: pagesViewed,
      watchedVideo: watchedVideo,
      videoProgress: maxVideoProgress,
      device: getDevice(),
      referrer: referrer
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ALERT_ENDPOINT, JSON.stringify(payload));
    } else {
      fetch(ALERT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track pageview (once per page load)
  function trackPageview() {
    if (hasTrackedPageview) return;
    hasTrackedPageview = true;
    track('pageview');
  }

  // Track video play
  function trackVideoPlay(videoId) {
    if (trackedVideos.has(videoId)) return;
    trackedVideos.add(videoId);
    watchedVideo = true;
    track('video_play', { videoId: videoId });
  }

  // Track video progress (25%, 50%, 75%, 100%)
  function trackVideoProgress(videoId, percent) {
    if (percent > maxVideoProgress) {
      maxVideoProgress = percent;
    }
    track('video_progress', {
      videoId: videoId,
      videoProgress: percent
    });
  }

  // Set up video tracking
  function setupVideoTracking() {
    const videos = document.querySelectorAll('video');

    videos.forEach((video, index) => {
      const videoId = video.dataset.videoId || video.src || `video-${index}`;
      const progressMilestones = new Set();

      // Track play
      video.addEventListener('play', function() {
        trackVideoPlay(videoId);
      });

      // Track progress milestones
      video.addEventListener('timeupdate', function() {
        if (!video.duration) return;

        const percent = Math.floor((video.currentTime / video.duration) * 100);
        const milestones = [25, 50, 75, 100];

        milestones.forEach(milestone => {
          if (percent >= milestone && !progressMilestones.has(milestone)) {
            progressMilestones.add(milestone);
            trackVideoProgress(videoId, milestone);
          }
        });
      });
    });
  }

  // Set up engagement alert timer
  function setupEngagementAlert() {
    // Check at threshold + 1 second
    setTimeout(function() {
      sendAlert();
    }, (ALERT_THRESHOLD_SECONDS + 1) * 1000);

    // Also send on page unload if threshold reached
    window.addEventListener('beforeunload', function() {
      const timeOnSite = Math.floor((Date.now() - sessionStart) / 1000);
      if (timeOnSite >= ALERT_THRESHOLD_SECONDS) {
        sendAlert();
      }
    });

    // Track visibility changes (tab switches)
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        const timeOnSite = Math.floor((Date.now() - sessionStart) / 1000);
        if (timeOnSite >= ALERT_THRESHOLD_SECONDS) {
          sendAlert();
        }
      }
    });
  }

  // Track SPA navigation (if applicable)
  function trackNavigation(path) {
    if (!pagesViewed.includes(path)) {
      pagesViewed.push(path);
    }
  }

  // Initialize
  function init() {
    trackPageview();
    setupEngagementAlert();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupVideoTracking);
    } else {
      setupVideoTracking();
    }

    // Listen for hash changes (anchor navigation)
    window.addEventListener('hashchange', function() {
      trackNavigation(window.location.pathname + window.location.hash);
    });
  }

  // Run
  init();

  // Expose for manual tracking
  window.apuTrack = {
    pageview: trackPageview,
    videoPlay: trackVideoPlay,
    navigate: trackNavigation,
    custom: track
  };
})();
