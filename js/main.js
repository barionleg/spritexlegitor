

$(document).ready(function () {
    'use strict';
    editor.init();
});


Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


