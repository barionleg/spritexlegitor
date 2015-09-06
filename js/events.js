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
        case 49:
        case 50:
        case 51:
            editor.colorPick(event.keyCode - 48);
            break;
        case 52:
            editor.colorPick(0);
            break;
        default:
            //alert(event.keyCode);
        }
    });
};
