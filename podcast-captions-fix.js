videojs.registerPlugin('podcastCaptionsFix', function() {
  var player = this;

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = [
    '.vjs-text-track-display {',
    '  pointer-events: none;',
    '}',
    '.vjs-text-track-cue {',
    '  top: auto !important;',
    '  bottom: 40px !important;',
    '  position: absolute !important;',
    '  font-size: 16px !important;',
    '  width: 90% !important;',
    '  left: 5% !important;',
    '  text-align: center !important;',
    '  background: rgba(0,0,0,0.5) !important;',
    '  padding: 2px 6px !important;',
    '  border-radius: 4px !important;',
    '}',
    '.podcast-caption-overlay {',
    '  position: absolute;',
    '  bottom: 40px;',
    '  left: 5%;',
    '  width: 90%;',
    '  text-align: center;',
    '  font-size: 16px;',
    '  color: white;',
    '  background: rgba(0,0,0,0.5);',
    '  padding: 2px 6px;',
    '  border-radius: 4px;',
    '  pointer-events: none;',
    '  z-index: 9999;',
    '  display: none;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // Create our own caption overlay div — bypass video.js display entirely
  var overlay = document.createElement('div');
  overlay.className = 'podcast-caption-overlay';
  
  player.ready(function() {
    // Add overlay to player container
    var playerEl = player.el();
    playerEl.style.position = 'relative';
    playerEl.appendChild(overlay);

    // Force video.js display visible too
    function showVjsDisplay() {
      var display = player.getChild('textTrackDisplay');
      if (display) display.show();
    }

    // Get active text track
    function getActiveTrack() {
      var tracks = player.textTracks();
      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].mode === 'showing' && tracks[i].kind !== 'metadata') {
          return tracks[i];
        }
      }
      return null;
    }

    // Find the cue matching current time and render it in our overlay
    function updateOverlay() {
      showVjsDisplay();
      var track = getActiveTrack();
      
      if (!track) {
        overlay.style.display = 'none';
        return;
      }

      var currentTime = player.currentTime();
      var cues = track.cues;
      
      if (!cues || cues.length === 0) {
        overlay.style.display = 'none';
        return;
      }

      var activeCueText = '';
      for (var i = 0; i < cues.length; i++) {
        var cue = cues[i];
        if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
          activeCueText = cue.text;
          break;
        }
      }

      if (activeCueText) {
        // Clean WebVTT formatting tags like <c>, <00:00:00.000>
        activeCueText = activeCueText.replace(/<[^>]+>/g, '');
        overlay.textContent = activeCueText;
        overlay.style.display = 'block';
      } else {
        overlay.style.display = 'none';
      }
    }

    // Listen for track changes
    var tracks = player.textTracks();
    tracks.on('change', function() {
      showVjsDisplay();
      updateOverlay();
    });

    // Poll every 100ms based on currentTime — reliable on iOS
    var captionInterval = setInterval(function() {
      updateOverlay();
    }, 100);

    player.on('dispose', function() {
      clearInterval(captionInterval);
    });
  });
});
