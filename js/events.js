editor.bindEvents = function () {
    $("#usercolors").find('.usercolor')
        .bind('click', editor.pickerClick)
        .bind('dblclick', editor.paletteShow)
        .bind('contextmenu', function (e) {
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
    $("#export_template_list").on('change', function () {
        editor.exportTemplateSet($(this).val());
    });

    $(".close_button").bind('click', function () {
        $(this).parent().fadeOut()
    });

    $("#opt_raw input.opt_check").change(function () {
        editor.configRead("opt_raw");
        editor.configSave();
        editor.dataShowRaw();
    });

    $("#mod_data").find(".data_textarea").focus(function () {
        var $this = $(this);
        $this.select();

        $this.mouseup(function () {
            $this.unbind("mouseup");
            return false;
        });
    });

    $("#editor").find(".inner_cell")
        .bind('mouseover', function () {
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
            editor.cursorSetCell(this);
            editor.redos = [];
            editor.spriteSave();
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
        case 18: // alt
            editor.alt_down = true;
            break;
        case 17: // ctrl
            editor.ctrl_down = true;
            break;
        case 16: // shift
            editor.shift_down = true;
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
            $("#export_raw_mask").toggleClass('invisible', !editor.config.mask_mode);
            editor.configSave();
            editor.previewUpdate();
            editor.editorUpdateContent();
            break;
        case 72: // h
            editor.config.hex_mode = !editor.config.hex_mode;
            editor.configSave();
            editor.sizesUpdate();
            editor.colorsUpdate();
            editor.editorUpdateContent();
            break;
        case 87: //  w
            editor.config.wrap = !editor.config.wrap;
            editor.configShow("menu_fx");
            editor.configSave();
            break;
        case 37: // ctrl left
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteFx.shl();
            } else { // left
                editor.cursorSetXY(editor.cursorX - 1, editor.cursorY);
                editor.cursorUpdate();
                if (editor.space_down) {
                    editor.cellPaintXY(editor.cursorX, editor.cursorY, editor.config.selected_color);
                }
            }
            break;
        case 39: // ctrl right
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteFx.shr();
            } else { // right
                editor.cursorSetXY(editor.cursorX + 1, editor.cursorY);
                editor.cursorUpdate();
                if (editor.space_down) {
                    editor.cellPaintXY(editor.cursorX, editor.cursorY, editor.config.selected_color);
                }
            }
            break;
        case 38: // ctrl up
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteFx.shu();
            } else { // up
                editor.cursorSetXY(editor.cursorX, editor.cursorY - 1);
                editor.cursorUpdate();
                if (editor.space_down) {
                    editor.cellPaintXY(editor.cursorX, editor.cursorY, editor.config.selected_color);
                }
            }
            break;
        case 40: // ctrl down
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteFx.shd();
            } else { // down
                editor.cursorSetXY(editor.cursorX, editor.cursorY + 1);
                editor.cursorUpdate();
                if (editor.space_down) {
                    editor.cellPaintXY(editor.cursorX, editor.cursorY, editor.config.selected_color);
                }
            }
            break;
        case 32: // ctrl down
            event.preventDefault();
            editor.space_down = true;
            editor.cursorUpdate();
            editor.cellPaintXY(editor.cursorX, editor.cursorY, editor.config.selected_color);
            break;
        case 189: // -
        case 173: // - Firefox
            event.preventDefault();
            if (editor.config.preview_cell_size > 1) {
                editor.config.preview_cell_size--;
                editor.previewSizeUpdate();
            }
            break;
        case 187: // +
        case 61: // + Firefox
            event.preventDefault();
            if (editor.config.preview_cell_size < 5) {
                editor.config.preview_cell_size++;
                editor.previewSizeUpdate();
            }
            break;
        case 90:
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteReadUndo();
            }
            break;
        case 89:
            event.preventDefault();
            if (editor.ctrl_down) {
                editor.spriteReadRedo();
            }
            break;

        default:
            console.log(event.keyCode);
        }
    });
    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
        case 18:
            editor.alt_down = false;
            break;
        case 17:
            editor.ctrl_down = false;
            break;
        case 16:
            editor.shift_down = false;
            break;
        case 32: // ctrl down
            editor.spriteSave();
            editor.previewUpdate();
            editor.space_down = false;
            break;
        default:

        }
    });
};
