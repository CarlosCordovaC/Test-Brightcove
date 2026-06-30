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

  // Force caption display when a text track is set to showing
  function fixCaptionDisplay() {
    var display = player.getChild('textTrackDisplay');
    if (display) {
      display.show();
    }
  }

  // Run fix on player ready
  player.ready(function() {
    fixCaptionDisplay();

    // Run fix whenever a text track changes mode
    var tracks = player.textTracks();
    tracks.on('change', function() {
      fixCaptionDisplay();
    });

    // Also listen on the tech level
    player.on('texttrackchange', function() {
      fixCaptionDisplay();
    });
  });
});
