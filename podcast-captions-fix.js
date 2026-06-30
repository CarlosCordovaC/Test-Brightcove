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

  // Manually update captions by reading active cues and rendering them
  function updateCaptions() {
    var tracks = player.textTracks();
    var display = document.querySelector('.vjs-text-track-display');
    if (!display) return;

    // Find the active showing track
    var activeTrack = null;
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].mode === 'showing' && tracks[i].kind !== 'metadata') {
        activeTrack = tracks[i];
        break;
      }
    }

    if (!activeTrack) return;

    fixCaptionDisplay();

    // Read active cues and inject them manually if display is empty
    var activeCues = activeTrack.activeCues;
    if (activeCues && activeCues.length > 0) {
      var cueContainer = display.querySelector('div');
      if (cueContainer && cueContainer.innerHTML.trim() === '') {
        var cueText = '';
        for (var j = 0; j < activeCues.length; j++) {
          cueText += '<div class="vjs-text-track-cue vjs-text-track-cue-en-US">' + activeCues[j].text + '</div>';
        }
        cueContainer.innerHTML = cueText;
      }
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

    // Update captions every 250ms to keep them in sync
    var captionInterval = setInterval(function() {
      updateCaptions();
    }, 250);

    // Clear interval when player is disposed
    player.on('dispose', function() {
      clearInterval(captionInterval);
    });
  });
});
