videojs.registerPlugin('podcastCaptionsFix', function() {
  var player = this;

  // Inject CSS to fix caption position and size
  var style = document.createElement('style');
  style.textContent = [
    '.vjs-text-track-cue {',
    '  top: auto !important;',
    '  bottom: 40px !important;',
    '  position: absolute !important;',
    '  font-size: 16px !important;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // Force caption display to stay visible
  function fixCaptionDisplay() {
    var display = player.getChild('textTrackDisplay');
    if (display) {
      display.show();
    }
  }

  // Find the active showing track
  function getActiveTrack() {
    var tracks = player.textTracks();
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].mode === 'showing' && tracks[i].kind !== 'metadata') {
        return tracks[i];
      }
    }
    return null;
  }

  // Render active cues into the display
  function renderCues() {
    var display = document.querySelector('.vjs-text-track-display');
    if (!display) return;

    fixCaptionDisplay();

    var activeTrack = getActiveTrack();
    if (!activeTrack) return;

    var activeCues = activeTrack.activeCues;
    var cueContainer = display.querySelector('div');
    if (!cueContainer) return;

    if (activeCues && activeCues.length > 0) {
      var cueText = '';
      for (var j = 0; j < activeCues.length; j++) {
        cueText += '<div class="vjs-text-track-cue vjs-text-track-cue-en-US">' + activeCues[j].text + '</div>';
      }
      // Always update — no condition blocking the update
      cueContainer.innerHTML = cueText;
    } else {
      // Clear when no active cues
      cueContainer.innerHTML = '<div style="position:absolute;inset:0px;margin:1.5%;"></div>';
    }
  }

  player.ready(function() {
    fixCaptionDisplay();

    // Listen for track changes
    var tracks = player.textTracks();
    tracks.on('change', function() {
      fixCaptionDisplay();
    });

    player.on('texttrackchange', function() {
      fixCaptionDisplay();
    });

    // Listen to cuechange on active track for precise timing
    tracks.on('addtrack', function(e) {
      var track = e.track;
      if (track.kind !== 'metadata') {
        track.on('cuechange', function() {
          renderCues();
          fixCaptionDisplay();
        });
      }
    });

    // Also attach cuechange to existing tracks
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].kind !== 'metadata') {
        tracks[i].on('cuechange', function() {
          renderCues();
          fixCaptionDisplay();
        });
      }
    }

    // Fallback interval at 100ms for any missed updates
    var captionInterval = setInterval(function() {
      renderCues();
    }, 100);

    player.on('dispose', function() {
      clearInterval(captionInterval);
    });
  });
});
