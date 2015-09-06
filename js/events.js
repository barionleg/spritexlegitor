editor.bindEvents = function () {
    $('.usercolor').bind('click', editor.pickerClick);
    $('.usercolor').bind('dblclick', editor.paletteShow);
    $('.usercolor').bind('contextmenu', function (e) {
        e.preventDefault();
        editor.colorPick(this.id.substr(-1));
        $("#palette").slideToggle();
    });

    editor.buttons.bind();

    $("#opt_wrap").bind('change', function () {
        editor.configRead("menu_fx");
        editor.configSave();

    });
    $("#opt_mask_vis").bind('change', function () {
        editor.configRead("menu_mask");
        editor.configSave();
        editor.init();

    });

    $(".close_button").bind('click', function () {
        $(this).parent().fadeOut()
    });

    $("#opt_raw input.opt_check").change(function () {
        editor.configRead("opt_raw");
        editor.configSave();
        editor.dataShowRaw();
    });

    $(".data_textarea").focus(function () {
        var $this = $(this);
        $this.select();

        $this.mouseup(function () {
            $this.unbind("mouseup");
            return false;
        });
    });

    $(".inner_cell").bind('mouseover', function () {
            if (mouseDown == 1 && !$("#preview").hasClass('is-dragging')) {
                editor.cellPaint(this.id, editor.config.selected_color)
            }
            if (mouseDown == 3 && !$("#preview").hasClass('is-dragging')) {
                editor.cellClear(this.id);
            }
        })
        .bind('mousedown', function (e) {
            e = e || window.event;
            if (e.which == 1) editor.cellPaint(this.id, editor.config.selected_color);
            if (e.which == 3) {
                editor.maskSelect(this.id);
                editor.cellClear(this.id);
            }
        })
        .bind('mouseup', function () {
            editor.previewUpdate();
        })
        .bind('contextmenu', function (e) {
            e.preventDefault();
        });

    setTimeout(function () {
        var $draggable = $('#preview').draggabilly({
            containment: 'html'
        });
        var $draggables = $('.popup').draggabilly({
            containment: 'html',
            handle: '.popup_title'
        });
        $draggable.on('dragEnd', function () {
            var prevbox = $(this).data('draggabilly');
            editor.config.previewX = prevbox.position.x;
            editor.config.previewY = prevbox.position.y;
            editor.configSave();
        });
    }, 500);

    document.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
        case 17: // ctrl
            editor.ctrl_down = true;
            break;
        case 49: // 1-3
        case 50:
        case 51:
            editor.colorPick(event.keyCode - 48);
            break;
        case 192: // `~
             $("#palette").slideToggle();
            break;
        case 52: // 4
            editor.colorPick(0);
            break;
        case 77: // m
            editor.config.mask_mode = !editor.config.mask_mode;
            $("#menu_mask").toggleClass('invisible', !editor.config.mask_mode);
            editor.configSave();
            editor.previewUpdate();
            editor.editorUpdateContent();
            break;
        case 87: //  w
            editor.config.wrap = !editor.config.wrap;
            editor.configShow("menu_fx");
            editor.configSave();
            break;
        case 37: // ctrl left
            if (editor.ctrl_down) {
                editor.spriteFx.shl();
            }
            break;
        case 39: // ctrl right
            if (editor.ctrl_down) {
                editor.spriteFx.shr();
            }
            break;
        case 38: // ctrl up
            if (editor.ctrl_down) {
                editor.spriteFx.shu();
            }
            break;
        case 40: // ctrl left
            if (editor.ctrl_down) {
                editor.spriteFx.shd();
            }
            break;
        default:
            console.log(event.keyCode);
        }
    });
    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
        case 17:
            editor.ctrl_down = false;
            break;
        default:

        }
    });
};
