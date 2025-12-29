/**
 * APU Recruitment Tracker
 * Tracks pageviews, video plays, and engagement time.
 * Sends email alert when someone spends 30+ seconds on the site.
 *
 * Supports UTM parameters for campaign attribution:
 * - utm_source (email, twitter, instagram, tournament)
 * - utm_medium (social, email, referral)
 * - utm_campaign (coach_outreach_jan, pony_nationals_2025)
 * - utm_content (video_link, schedule_link)
 * - utm_term (optional keyword)
 */
(function() {
  'use strict';

  const TRACK_ENDPOINT = '/api/track';
  const ALERT_ENDPOINT = '/api/alert';
  const ALERT_THRESHOLD_SECONDS = 30;

  let hasTrackedPageview = false;
  let hasSentAlert = false;
  let trackedVideos = new Set();
  let trackedEvents = new Set(); // Track unique custom events
  let maxVideoProgress = 0;
  let watchedVideo = false;

  // Session tracking
  const sessionStart = Date.now();
  const pagesViewed = [window.location.pathname];
  const referrer = document.referrer || null;

  // Parse UTM parameters from URL
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

    utmKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        utm[key] = value;
      }
    });

    return Object.keys(utm).length > 0 ? utm : null;
  }

  // Store UTM params for the session
  const utmParams = getUtmParams();

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

    // Include UTM params if present
    if (utmParams) {
      payload.utm = utmParams;
    }

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

    // Include UTM params if present
    if (utmParams) {
      payload.utm = utmParams;
    }

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

  // Track resume/PDF download
  function trackResumeDownload(format = 'pdf') {
    const eventKey = `resume_download_${format}`;
    if (trackedEvents.has(eventKey)) return;
    trackedEvents.add(eventKey);
    track('resume_download', { format: format });
  }

  // Track schedule section view
  function trackScheduleView(tournament = null) {
    const eventKey = `schedule_view_${tournament || 'general'}`;
    if (trackedEvents.has(eventKey)) return;
    trackedEvents.add(eventKey);
    track('schedule_view', { tournament: tournament });
  }

  // Track coach email click
  function trackCoachEmailClick(emailType = 'player') {
    const eventKey = `coach_email_${emailType}`;
    if (trackedEvents.has(eventKey)) return;
    trackedEvents.add(eventKey);
    track('coach_email_click', { emailType: emailType });
  }

  // Track contact form submission (for future use)
  function trackContactFormSubmit(formType = 'inquiry') {
    track('contact_form_submit', { formType: formType });
  }

  // Track section views (for scroll tracking)
  function trackSectionView(sectionId) {
    const eventKey = `section_view_${sectionId}`;
    if (trackedEvents.has(eventKey)) return;
    trackedEvents.add(eventKey);
    track('section_view', { section: sectionId });
  }

  // Set up video tracking
  function setupVideoTracking() {
    const videos = document.querySelectorAll('video');
    console.log('[APU Tracker] Found', videos.length, 'video element(s)');

    videos.forEach((video, index) => {
      // Get video ID from data attribute, video src, source element, or fallback to index
      const sourceEl = video.querySelector('source');
      const videoId = video.dataset.videoId || video.src || (sourceEl && sourceEl.src) || `video-${index}`;
      const progressMilestones = new Set();
      console.log('[APU Tracker] Tracking video:', videoId);

      // Track play
      video.addEventListener('play', function() {
        console.log('[APU Tracker] Video play detected:', videoId);
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

  // Set up email link tracking
  function setupEmailTracking() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

    emailLinks.forEach(link => {
      link.addEventListener('click', function() {
        const email = link.href.replace('mailto:', '').split('?')[0];
        // Determine email type based on the address
        let emailType = 'other';
        if (email.includes('aynparkerusry')) {
          emailType = 'player';
        } else if (email.includes('mike@') || email.includes('karin@')) {
          emailType = 'parent';
        }
        trackCoachEmailClick(emailType);
      });
    });
  }

  // Set up resume download tracking
  function setupResumeTracking() {
    const resumeLinks = document.querySelectorAll('a[href*="resume"], a[href*="Resume"], a[download]');

    resumeLinks.forEach(link => {
      link.addEventListener('click', function() {
        const href = link.href.toLowerCase();
        const format = href.endsWith('.pdf') ? 'pdf' : 'other';
        trackResumeDownload(format);
      });
    });
  }

  // Set up section visibility tracking using Intersection Observer
  function setupSectionTracking() {
    const sections = document.querySelectorAll('section[id], div[id^="schedule"], #schedule, #stats, #about, #contact, #video');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || entry.target.dataset.section;
          if (sectionId) {
            trackSectionView(sectionId);

            // Special handling for schedule section
            if (sectionId === 'schedule' || sectionId.includes('schedule')) {
              trackScheduleView();
            }
          }
        }
      });
    }, {
      threshold: 0.5 // Trigger when 50% of section is visible
    });

    sections.forEach(section => observer.observe(section));
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

  // Initialize all tracking
  function setupAllTracking() {
    setupVideoTracking();
    setupEmailTracking();
    setupResumeTracking();
    setupSectionTracking();
  }

  // Initialize
  function init() {
    trackPageview();
    setupEngagementAlert();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupAllTracking);
    } else {
      setupAllTracking();
    }

    // Listen for hash changes (anchor navigation)
    window.addEventListener('hashchange', function() {
      trackNavigation(window.location.pathname + window.location.hash);
    });

    // Log UTM params if present (for debugging in dev)
    if (utmParams && window.location.hostname === 'localhost') {
      console.log('[APU Tracker] UTM params detected:', utmParams);
    }
  }

  // Run
  init();

  // Expose for manual tracking
  window.apuTrack = {
    pageview: trackPageview,
    videoPlay: trackVideoPlay,
    navigate: trackNavigation,
    resumeDownload: trackResumeDownload,
    scheduleView: trackScheduleView,
    emailClick: trackCoachEmailClick,
    sectionView: trackSectionView,
    formSubmit: trackContactFormSubmit,
    custom: track,
    // Expose UTM params for debugging
    getUtm: function() { return utmParams; }
  };
})();
