var mouseDown = false;
$(document).mousedown(function (e) {
    e = e || window.event;
    mouseDown = e.which;
}).mouseup(function (e) {
    mouseDown = 0;
});

$(document).ready(function () {
    'use strict';
    editor.init();

});


Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};
