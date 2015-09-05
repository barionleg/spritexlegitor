var editor = {
    config: {},
    sprite: [],
    mask: [],
    mask_selected: 0,
    runOnce: true,
    init: function () {
        this.configLoad();
        this.spriteLoad();
        if (this.runOnce) {

            this.config.version = default_config.version;
            $("#version").html(this.config.version);
            this.editorDraw();
            this.previewDraw();
        }
        $('#preview').css('top', editor.config.previewY);
        $('#preview').css('left', editor.config.previewX);
        $('#preview').css('width', Number(editor.config.max_width) * 4 * editor.config.preview_cell_size * editor.config.pixel_width);
        $('#preview').css('height', Number(editor.config.max_height) * editor.config.preview_cell_size);
        palette.draw('#palette');
        this.colorsUpdate();
        this.sizeUpdate();
        $('.preview_cell').css('width', editor.config.preview_cell_size * editor.config.pixel_width)
            .css('height', editor.config.preview_cell_size);
        $('.editor_cell').css('width', editor.config.editor_cell_size * editor.config.pixel_width)
            .css('height', editor.config.editor_cell_size);
        editor.configShow("menu_fx");
        editor.configShow("menu_mask");
        $("#menu_mask").toggleClass('invisible', !this.config.mask_mode);
        $("#export_raw_mask").toggleClass('invisible', !this.config.mask_mode);
        editor.editorUpdateContent();
        if (this.runOnce) {
            this.bindEvents();
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
                    console.log(prevbox.position.x + " " + prevbox.position.y);
                    editor.configSave();
                });
            }, 500);
            $(".data_textarea").focus(function () {
                var $this = $(this);
                $this.select();

                $this.mouseup(function () {
                    $this.unbind("mouseup");
                    return false;
                });
            });
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
            //console.log('change');
            editor.configRead("opt_raw");
            editor.configSave();
            editor.dataShowRaw();
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
        $('#' + cont + ' select').each(function (idx, selname) {
            configname = selname.id.substr(4);
            editor.config[configname] = $(selname).val();
        });
        $('#' + cont + ' textarea').each(function (idx, selname) {
            configname = selname.id.substr(4);
            editor.config[configname] = $(selname).val();
        });
        $('#' + cont + ' input:text').each(function (idx, selname) {
            configname = selname.id.substr(4);
            editor.config[configname] = $(selname).val();
        });


    },
    configShow: function (cont) {
        $('#' + cont + ' input:checkbox').each(function (idx, chkbox) {
            configname = chkbox.id.substr(4);
            $(chkbox).prop('checked', editor.config[configname]);
        });
        $('#' + cont + ' select').each(function (idx, selname) {
            configname = selname.id.substr(4);
            $(selname).val(editor.config[configname]);
        });
        $('#' + cont + ' textarea').each(function (idx, selname) {
            configname = selname.id.substr(4);
            $(selname).val(editor.config[configname]);
        });
        $('#' + cont + ' input:text').each(function (idx, selname) {
            configname = selname.id.substr(4);
            $(selname).val(editor.config[configname]);
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
                    if (editor.config.mask_mode && editor.config.mask_vis) {
                        $cell.addClass('mask_' + this.mask[x][y]);
                    }
                };
                $("#editor").append($cell);
            }
        };
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

    },

    editorUpdateSize: function () {
        var x, y;
        $('#editor').css('width', ((Number(editor.config.width) * 4) + 1) * ((editor.config.editor_cell_size * editor.config.pixel_width) + 1));
        $('#editor').css('height', (Number(editor.config.height) + 1) * (Number(editor.config.editor_cell_size) + 1));

        $('.editor_cell').show().css('font-size', (editor.config.editor_cell_size * 0.8) + "px");
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
                this.cellMask("#cell_" + x + "_" + y, this.mask[x][y]);
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
    cellMask: function (cname, mask) {
        $(cname).removeClass('mask_0 mask_1');
        if (editor.config.mask_mode && editor.config.mask_vis) {
            $(cname).addClass('mask_' + mask);
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
            this.mask[x][y] = editor.mask_selected;
            this.cellMask("#cell_" + x + "_" + y, editor.mask_selected);
        } else {
            this.sprite[x][y] = 0;
            this.cellSet("#" + cell_id, 0);
        }
    },

    cellHasNeighbour(x, y) {
        var cx, cy;
        var sx = x - (x > 0 ? 1 : 0);
        var sy = y - (y > 0 ? 1 : 0);
        var ex = x + (x < ((editor.config.width * 4) - 1) ? 1 : 0);
        var ey = y + (y < (editor.config.height - 1) ? 1 : 0);
        for (cx = sx; cx <= ex; cx++) {
            for (cy = sy; cy <= ey; cy++) {
                if (editor.sprite[cx][cy] != 0) return true;
            }
        }
        return false;
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
                if (x == 0 && y == 0) $cell.addClass('first_cell');
                if (x == 0 && y > 0) $cell.addClass('new_line');
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
                editor.cellMask($cell, this.mask[x][y]);
            }
        };
        this.spriteSave();
    },

    maskAll: function () {
        for (x = 0; x < editor.config.max_width * 4; x++) {
            for (y = 0; y < editor.config.max_height; y++) {
                editor.mask[x][y] = 0;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskClear: function () {
        for (x = 0; x < editor.config.max_width * 4; x++) {
            for (y = 0; y < editor.config.max_height; y++) {
                editor.mask[x][y] = 1;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskAuto: function () {
        for (x = 0; x < editor.config.width * 4; x++) {
            for (y = 0; y < editor.config.height; y++) {
                editor.mask[x][y] = editor.sprite[x][y] > 0 ? 0 : 1;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskOutline: function () {
        for (x = 0; x < editor.config.width * 4; x++) {
            for (y = 0; y < editor.config.height; y++) {
                editor.mask[x][y] = editor.cellHasNeighbour(x, y) ? 0 : 1;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskSelect(cell_id) {
        var ida = cell_id.split('_');
        var x = ida[1];
        var y = ida[2];
        editor.mask_selected = 1 - editor.mask[x][y];
    },


    dataShow: function () {
        editor.dataShowRaw();
        editor.dataShowUser();
    },

    dataShowRaw() {
        var rawdata = 'Nothing to export';
        //var jsondata = '';
        var objdata = {};
        var empty = true;

        objdata.w = editor.config.width;
        objdata.h = editor.config.height;
        if (editor.config.raw_sprite) {
            objdata.s = editor.sprite;
            empty = false;
        };
        if (editor.config.raw_mask && editor.config.mask_mode) {
            objdata.m = editor.mask;
            empty = false;
        };
        if (editor.config.raw_colors) {
            objdata.c = editor.config.colors;
            empty = false;
        };
        if (editor.config.raw_options) {
            objdata.o = editor.config;
            empty = false;
        };
        if (!empty) {
            rawdata = LZString.compressToEncodedURIComponent(JSON.stringify(objdata));
        }
        $("#data_raw").val(rawdata);
    },

    dataImport: function () {
        var LZdata = $("#data_raw").val();
        var jsondata = LZString.decompressFromEncodedURIComponent(LZdata);
        var objdata;
        var msg = '';
        if (jsondata !== null && typeof jsondata === 'string') {
            try {
                objdata = JSON.parse(jsondata);
            } catch (e) {
                alert('Data parsing error!');
                return false;
            }
            if (confirm("Are You sure?\nAll your current data will be overwritten!")) {
                if (objdata.s) {
                    editor.sprite = objdata.s;
                    editor.config.width = objdata.w;
                    editor.config.height = objdata.h;
                    msg += "Sprite data imported sucessfuly.\n";
                    editor.spriteSave();
                }
                if (objdata.m) {
                    editor.mask = objdata.m;
                    msg += "Mask data imported sucessfuly.\n";
                    editor.spriteSave();
                }
                if (objdata.c) {
                    editor.config.colors = objdata.c;
                    msg += "Colour data imported sucessfuly.\n";
                    editor.configSave();
                }
                if (objdata.o) {
                    editor.config = objdata.o;
                    msg += "Options imported sucessfuly.\n";
                    editor.configSave();
                }
                $("#data_raw").val(msg);
                console.log(msg);
                return true;
            }
        } else {
            alert('Data decompression error!');
            return false;
        };


    },

    dataShowUser() {
        var userdata = editor.config.export_template;

        userdata = userdata.replace('##W##', editor.dataParse(editor.config.width, false));
        userdata = userdata.replace('##H##', editor.dataParse(editor.config.height, false));
        userdata = userdata.replace('##S##', editor.img2str(editor.sprite));
        userdata = userdata.replace('##M##', editor.img2str(editor.mask));
        userdata = userdata.replace('##C##', editor.arr2str(editor.config.colors));

        $("#data_user").val(userdata);
    },

    img2str: function (arr) {
        var data = '';

        return data;
    },
    arr2str: function (arr) {
        var data = '';
        arr.forEach(function (elem, idx) {
            data += editor.dataParse(elem, true);
        });
        data = data.substr(0, data.length - editor.config.export_data_separator.length);
        return data;
    },
    dataParse: function (val, sep) {
        return editor.config.export_data_prefix + editor.formatInt(val) + (sep ? editor.config.export_data_separator : "");
    }

};
