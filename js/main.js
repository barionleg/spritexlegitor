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

    const bh = $('<div/>').attr('id','bathub').on('mousedown',()=>	{window.location.href='https://bocianu.gitlab.io/bathub/'});
    $('body').append(bh);

});


Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};
