var editor = {
    config: {},
    sprite: [],
    mask: [],
    runOnce: true,
    init: function () {
        this.configLoad();
        this.spriteLoad();
        if (this.runOnce) {
            this.editorDraw();
            this.previewDraw();
        }
        palette.draw('#palette');
        this.config.version = default_config.version;
        $("#version").html(this.config.version);
        this.colorsUpdate();
        this.sizeUpdate();
        $('#preview').css('top', editor.config.previewY);
        $('#preview').css('left', editor.config.previewX);
        $('#preview').css('width', Number(editor.config.max_width) * (4 * editor.config.preview_cell_w));
        $('#preview').css('height', Number(editor.config.max_height) * editor.config.preview_cell_h);
        $('.preview_cell').css('width', editor.config.preview_cell_w)
            .css('height', editor.config.preview_cell_h);
        $('.editor_cell').css('width', editor.config.editor_cell_w)
            .css('height', editor.config.editor_cell_h);
        editor.configShow("menu_fx");
        if (this.runOnce) {
            this.bindEvents();
        }
        this.runOnce = false;
    },
    bindEvents: function () {
        $('.usercolor').bind('click', this.pickerClick);
        $('.usercolor').bind('dblclick', this.paletteShow);
        $('.usercolor').bind('contextmenu', function (e) {
            e.preventDefault();
            editor.colorPick(this.id.substr(-1));
            $("#palette").slideToggle();
        });

        editor.buttons.bind();

        $("#opt_wrap").bind('change', function () {
            editor.configRead("menu_fx");
            editor.configSave();
            // editor.init();
            $("#mod_options").fadeOut();
        });

        $(".close_button").bind('click', function () {
            $(this).parent().fadeOut()
        });

        var $draggable = $('#preview').draggabilly({
            containment: 'html'
        });
        $draggable.on('dragEnd', function () {
            var prevbox = $(this).data('draggabilly');
            editor.config.previewX = prevbox.position.x;
            editor.config.previewY = prevbox.position.y;
            console.log(prevbox.position.x + " " + prevbox.position.y);
            editor.configSave();
        });

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
    },

    configLoad: function () {
        this.config = $.extend(true, {}, default_config, storage.get('config'));
        this.configSave();
    },
    configSave: function () {
        storage.set('config', this.config);
    },
    configReset: function () {
        storage.erase('config');
        this.configLoad();
        this.init();
    },
    configRead: function (cont) {
        $('#' + cont + ' input:checkbox').each(function (idx, chkbox) {
            configname = chkbox.id.substr(4);
            editor.config[configname] = $(chkbox).prop('checked');
        });
    },
    configShow: function (cont) {
        $('#' + cont + ' input:checkbox').each(function (idx, chkbox) {
            configname = chkbox.id.substr(4);
            $(chkbox).prop('checked', editor.config[configname]);
        });
    },

    formatInt: function (num) {
        return (editor.config.hex_mode ? ("0" + Number(num).toString(16).toUpperCase()).slice(-2) : Number(num));
    },

    widthDec: function () { // ************** SIZES
        if (editor.config.width > 1) {
            --editor.config.width;
            editor.sizeUpdate();
        }
    },
    widthInc: function () {
        if (editor.config.width < editor.config.max_width) {
            ++editor.config.width;
            editor.sizeUpdate();
        }
    },
    heightDec: function () {
        if (editor.config.height > 1) {
            --editor.config.height;
            editor.sizeUpdate();
        }
    },
    heightInc: function () {
        if (editor.config.height < editor.config.max_height) {
            ++editor.config.height;
            editor.sizeUpdate();
        }
    },
    sizeUpdate: function () {
        $("#size_width").html(this.formatInt(this.config.width));
        $("#size_height").html(this.formatInt(this.config.height));
        this.editorUpdateSize();
        this.previewUpdate();
        this.configSave();
    },


    pickerClick: function () { // ************** COLORS
        editor.colorPick(this.id.substr(-1));
    },
    colorPick: function (cnum) {
        this.config.selected_color = cnum;
        this.colorsUpdate();
    },
    colorSet: function (cnum, cval) {
        this.config.colors[cnum] = cval;
        this.colorsUpdate()
    },
    colorsUpdate: function () {
        this.config.colors.forEach(function (cval, cnum) {
            palette.colorSet(cnum, cval);
            $("#usercolor_" + cnum + " div.cnum").html(editor.formatInt(cval));
        });
        $(".usercolor").removeClass('color_picked');
        $("#usercolor_" + this.config.selected_color).addClass('color_picked');
        this.configSave();
    },
    paletteShow: function () {
        $("#palette").slideDown();
    },
    paletteClick: function () {
        editor.palettePick(this.title);
        $("#palette").slideUp();
    },
    palettePick: function (cval) {
        this.colorSet(this.config.selected_color, cval);
    },

    spriteClear: function () { // ************** SPRITES
        function zeros(dimensions) {
            var array = [];
            for (var i = 0; i < dimensions[0]; ++i) {
                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
            }
            return array;
        }
        this.sprite = zeros([this.config.max_width * 4, this.config.max_height]);
        this.mask = zeros([this.config.max_width * 4, this.config.max_height]);
        this.spriteSave();
    },
    spriteCrop: function () {
        var x, y;
        for (y = this.config.height; y < this.config.max_height; y++) {
            for (x = 0; x < this.config.max_width * 4; x++) {
                this.sprite[x][y] = 0;
                this.mask[x][y] = 0;
            }
        }
        for (x = this.config.width * 4; x < this.config.max_width * 4; x++) {
            for (y = 0; y < this.config.max_height; y++) {
                this.sprite[x][y] = 0;
                this.mask[x][y] = 0;
            }
        }
        this.spriteSave();
    },
    spriteLoad: function () {
        if (!storage.get('sprite')) {
            this.spriteClear();
        } else {
            this.sprite = $.extend(true, {}, storage.get('sprite'));
            this.mask = $.extend(true, {}, storage.get('mask'));
        }
    },
    spriteSave: function () {
        storage.set('sprite', this.sprite);
        storage.set('mask', this.mask);
    },

    editorDraw: function () { // ************** editor
        var x, y;
        $("#editor").empty();
        for (y = -1; y < editor.config.max_height; y++) {
            for (x = -1; x < editor.config.max_width * 4; x++) {
                var x_byte = Math.floor(x / 4);
                var $cell = $("<div></div>");
                $cell.addClass('editor_cell')
                    .attr('id', 'cell_' + x + '_' + y)
                    .addClass('row_' + y);
                if (x == -1) {
                    $cell.addClass('new_line');
                    if (y > -1) {
                        $cell.html(this.formatInt(y));
                    }
                };
                if (y == -1) {
                    if (x > -1) {
                        $cell.html(this.formatInt(x));
                    }
                };
                if (x > -1) {
                    $cell.addClass('byte_' + x_byte);
                };

                if (x > -1 && y > -1) {
                    if (this.sprite[x] === undefined) {
                        this.sprite[x] = [];
                    }
                    if (this.sprite[x][y] === undefined) {
                        this.sprite[x][y] = 0;
                    }
                    $cell.addClass('color_' + this.sprite[x][y])
                        .addClass('inner_cell');
                };
                $("#editor").append($cell);
            }
        };
        $(".inner_cell").bind('mouseover', function () {
                if (mouseDown == 1 && !$("#preview").hasClass('is-dragging')) {
                    editor.cellPaint(this.id, editor.config.selected_color)
                }
                if (mouseDown == 3 && !$("#preview").hasClass('is-dragging')) {
                    editor.cellClear(this.id)
                }
            })
            .bind('mousedown', function (e) {
                e = e || window.event;
                if (e.which == 1) editor.cellPaint(this.id, editor.config.selected_color);
                if (e.which == 3) editor.cellClear(this.id);

            })
            .bind('mouseup', function () {
                editor.previewUpdate();
            })
            .bind('contextmenu', function (e) {
                e.preventDefault();
            });

    },

    editorUpdateSize: function () {
        var x, y;
        $('.editor_cell').show();
        for (x = this.config.width; x < this.config.max_width; x++) {
            $(".byte_" + x).hide();
        }
        for (y = this.config.height; y < this.config.max_height; y++) {
            $(".row_" + y).hide();
        }
    },

    editorUpdateContent: function () {
        var x, y;
        for (x = 0; x < this.config.max_width * 4; x++) {
            for (y = 0; y < this.config.max_height; y++) {
                this.cellSet("#cell_" + x + "_" + y, this.sprite[x][y]);
            }
        }
    },

    cellSet: function (cname, cnum) {
        for (var i = 0; i < 4; i++) {
            if (i == cnum) {
                $(cname).addClass('color_' + i)
            } else {
                $(cname).removeClass('color_' + i);
            }
        }
    },

    cellPaint: function (cell_id, color) {
        var ida = cell_id.split('_');
        var x = ida[1];
        var y = ida[2];
        this.sprite[x][y] = color;
        this.cellSet("#" + cell_id, color);
    },

    cellPaintXY: function (x, y, color) {
        this.sprite[x][y] = color;
        this.cellSet("#cell_" + x + "_" + y, color);
    },



    cellClear: function (cell_id) {
        var ida = cell_id.split('_');
        var x = ida[1];
        var y = ida[2];
        if (editor.config.mask_mode) {
            this.mask[x][y] = 1;
        } else {
            this.sprite[x][y] = 0;
            this.cellSet("#" + cell_id, 0);
        }
    },

    previewDraw: function () {
        var x, y;
        $("#preview").empty();
        for (y = 0; y < this.config.max_height; y++) {
            for (x = 0; x < this.config.max_width * 4; x++) {
                var $cell = $("<div></div>");
                $cell.addClass('preview_cell').attr('id', 'prev_' + x + '_' + y);
                if ((x < this.config.width * 4) && y < this.config.height) {
                    $cell.addClass('color_' + this.sprite[x][y]);
                }
                if (x == 0) $cell.addClass('new_line');
                $("#preview").append($cell);
            }
        };
        this.spriteSave();
    },

    previewUpdate: function () {
        var x, y, col;
        for (y = 0; y < this.config.max_height; y++) {
            for (x = 0; x < this.config.max_width * 4; x++) {
                var $cell = $('#prev_' + x + '_' + y);
                col = 'empty';
                if ((x < this.config.width * 4) && y < this.config.height) {
                    col = this.sprite[x][y];
                }
                editor.cellSet($cell, col);
            }
        };
        this.spriteSave();
    },

};
