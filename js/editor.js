var editor = {
    config: {},
    sprite: [],
    mask: [],
    init: function () {
        this.configLoad();
        this.spriteLoad();
        this.editorDraw();
        palette.draw('#palette');
        this.config.version = default_config.version;
        $("#version").html(this.config.version);
        this.colorsUpdate();
        this.sizeUpdate();
    },
    bindEvents: function () {
        $('.usercolor').bind('click', this.pickerClick);
        $('.usercolor').bind('dblclick', this.paletteShow);
        $('.usercolor').bind('contextmenu', function (e) {
            e.preventDefault();
            editor.colorPick(this.id.substr(-1));
            $("#palette").slideToggle();
        });
        $('#palette').bind('contextmenu', function (e) {
            e.preventDefault();
            $("#palette").slideToggle();
        });
        $(".palette_colorcell").bind('click', this.paletteClick);
        $("#width_dec").bind('click', this.widthDec);
        $("#width_inc").bind('click', this.widthInc);
        $("#height_dec").bind('click', this.heightDec);
        $("#height_inc").bind('click', this.heightInc);
        $("#btn_about").bind('click', function () {
            $("#mod_about").fadeToggle();
        });
        $("#btn_options").bind('click', function () {
            editor.configShow();
            $("#mod_options").fadeToggle();
        });
        $("#btn_opt_ok").bind('click', function () {
            editor.configRead();
            editor.configSave();
            editor.init();
            $("#mod_options").fadeOut();
        });
        $("#btn_opt_reset").bind('click', function () {
            if (confirm("Are you sure you want to revert default options?")) {
                editor.configReset();
            };
            $("#mod_options").fadeOut();
        });
        $("#btn_clear").bind('click', function () {
            if (confirm("Are you sure you want to erase all sprite data?")) {
                editor.spriteClear();
                editor.editorUpdateContent();
                editor.previewUpdate();
            }
        });
        $(".close_button").bind('click', function () {
            $(this).parent().fadeOut()
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
    configRead: function () {
        editor.config.hex_mode = $('#opt_hex').prop('checked');
        editor.config.pal_mode = $('#opt_pal').prop('checked');
    },
    configShow: function () {
        $('#opt_hex').prop('checked', editor.config.hex_mode);
        $('#opt_pal').prop('checked', editor.config.pal_mode);
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
                    $cell.addClass('color_' + this.sprite[x][y])
                        .addClass('inner_cell');
                };
                $("#editor").append($cell);
            }
        };
        $(".inner_cell").bind('mouseover', function () {
            if (mouseDown) {
                editor.paintCell(this.id)
            }
        });
        $(".inner_cell").bind('mousedown', function () {
            editor.paintCell(this.id)
        });
        $(".inner_cell").bind('mouseup', function () {
            editor.previewUpdate();
        });

    },

    editorUpdateSize: function () {
        $('.editor_cell').show();
        for (x = this.config.width; x < this.config.max_width; x++) {
            $(".byte_" + x).hide();
        }
        for (y = this.config.height; y < this.config.max_height; y++) {
            $(".row_" + y).hide();
        }
    },

    editorUpdateContent: function () {
        for (x = 0; x < this.config.max_width * 4; x++) {
            for (y = 0; y < this.config.max_height; y++) {
                for (var i = 0; i < 4; i++) {
                    if (i == this.sprite[x][y]) {
                        $("#cell_" + x + "_" + y).addClass('color_' + i)
                    } else {
                        $("#cell_" + x + "_" + y).removeClass('color_' + i);
                    }
                }

            }
        }
    },

    paintCell: function (cell_id) {
        var ida = cell_id.split('_');
        var x = ida[1];
        var y = ida[2];
        this.sprite[x][y] = this.config.selected_color;
        for (var i = 0; i < 4; i++) {
            if (i == this.config.selected_color) {
                $("#" + cell_id).addClass('color_' + i)
            } else {
                $("#" + cell_id).removeClass('color_' + i);
            }
        }
    },

    previewUpdate: function () {
        $("#preview").empty();
        for (y = 0; y < this.config.height; y++) {
            for (x = 0; x < this.config.width * 4; x++) {
                var $cell = $("<div></div>");
                $cell.addClass('preview_cell')
                    .addClass('color_' + this.sprite[x][y]);
                if (x == 0) $cell.addClass('new_line');
                $("#preview").append($cell);
            }
        };
        this.spriteSave();
    },

};
