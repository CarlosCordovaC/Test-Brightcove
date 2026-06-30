videojs.registerPlugin('podcastCaptionsFix', function() {
  var player = this;

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = [
    '.vjs-text-track-display { pointer-events: none; }',
    '.vjs-text-track-cue { display: none !important; }'
  ].join('\n');
  document.head.appendChild(style);

  player.ready(function() {

    // Force video.js caption display visible
    var vjsDisplay = player.getChild('textTrackDisplay');
    if (vjsDisplay) vjsDisplay.show();

    // Create our own overlay div
    var overlay = document.createElement('div');
    overlay.className = 'podcast-caption-overlay';
    overlay.style.cssText = 'position:absolute;bottom:70px;left:5%;width:90%;text-align:center;font-size:16px;color:white;background:rgba(0,0,0,0.5);padding:4px 8px;border-radius:4px;z-index:9999;display:none;';
    player.el().appendChild(overlay);

    // Poll currentTime every 100ms and match cues manually
    var captionInterval = setInterval(function() {
      var tracks = player.textTracks();
      var track = null;

      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].mode === 'showing' && tracks[i].kind !== 'metadata') {
          track = tracks[i];
          break;
        }
      }

      if (!track || !track.cues) {
        overlay.style.display = 'none';
        return;
      }

      var ct = player.currentTime();
      var text = '';

      for (var j = 0; j < track.cues.length; j++) {
        var cue = track.cues[j];
        if (ct >= cue.startTime && ct <= cue.endTime) {
          text = cue.text.replace(/<[^>]+>/g, '');
          break;
        }
      }

      if (text) {
        overlay.textContent = text;
        overlay.style.display = 'block';
      } else {
        overlay.style.display = 'none';
      }
    }, 100);

    player.on('dispose', function() {
      clearInterval(captionInterval);
    });
  });
});
