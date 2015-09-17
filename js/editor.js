var editor = {
    config: {},
    sprite: [],
    mask: [],
    mask_selected: 0,
    ctrl_down: false,
    shift_down: false,
    alt_down: false,
    runOnce: true,
    cursorX: 0,
    cursorY: 0,
    undos: [],
    redos: [],
    sizeTimeout: 0,
    init: function () {
        this.configLoad();
        this.spriteLoad();

        if (this.runOnce) {
            this.spriteSaveUndo();
            this.config.version = default_config.version;
            $("#version").html(this.config.version);
            $("#size_width").html(this.formatInt(this.config.width));
            $("#size_height").html(this.formatInt(this.config.height));
            this.editorDraw();
            this.previewDraw();
            this.exportTemplatesLoad();
        }
        editor.editorUpdateContent();
        editor.editorUpdateSize();
        editor.previewUpdate();
        editor.previewSizeUpdate();
        editor.colorsUpdate();
        editor.configShow("menu_fx");
        editor.configShow("menu_mask");
        $("#menu_mask").toggleClass('invisible', !this.config.mask_mode);
        $("#export_raw_mask").toggleClass('invisible', !this.config.mask_mode);
        palette.draw('#palette');

        if (this.runOnce) {
            this.bindEvents();
            this.runOnce = false;
        }
    },

    // *************************************************************************************************
    // ******************************************************************************* GUI / MENU
    // *************************************************************************************************

    formatInt: function (num) {
        return (editor.config.hex_mode ? ("0" + Number(num).toString(16).toUpperCase()).slice(-2) : Number(num));
    },

    widthDec: function () { // ************** SIZES
        if (editor.config.width > editor.config.export_mode) {
            editor.config.width -= Number(editor.config.export_mode);
            editor.sizesUpdate();
        }
    },
    widthInc: function () {
        if (editor.config.width < editor.config.max_width) {
            editor.config.width += Number(editor.config.export_mode);
            editor.sizesUpdate();
        }
    },
    heightDec: function () {
        if (editor.config.height > 1) {
            --editor.config.height;
            editor.sizesUpdate();
        }
    },
    heightInc: function () {
        if (editor.config.height < editor.config.max_height) {
            ++editor.config.height;
            editor.sizesUpdate();
        }
    },
    sizesUpdate: function () {
        clearTimeout(editor.sizeTimeout)
        if (editor.config.width % editor.config.export_mode != 0) {
            editor.config.width = (Math.floor(editor.config.width / editor.config.export_mode) + 1) * Number(editor.config.export_mode);
        };
        $("#size_width").html(this.formatInt(this.config.width));
        $("#size_height").html(this.formatInt(this.config.height));
        editor.configSave();
        editor.sizeTimeout = setTimeout(function () {
            editor.editorUpdateSize();
            editor.previewUpdate();
            editor.previewSizeUpdate();
        }, 500);

    },

    // *************************************************************************************************
    // ******************************************************************************* CONFIG
    // *************************************************************************************************

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
        var $cont = $('#' + cont);
        $cont.find('input:checkbox').each(function (idx, chkbox) {
            configname = chkbox.id.substr(4);
            editor.config[configname] = $cont.find(chkbox).prop('checked');
        });
        $cont.find('select.opt_select, textarea, input:text, input:hidden')
            .each(function (idx, selname) {
                configname = selname.id.substr(4);
                editor.config[configname] = $cont.find(selname).val();
            });

    },
    configShow: function (cont) {
        var $cont = $('#' + cont);
        $cont.find('input:checkbox').each(function (idx, chkbox) {
            configname = chkbox.id.substr(4);
            $cont.find(chkbox).prop('checked', editor.config[configname]);
        });
        $cont.find('select.opt_select, textarea, input:text, input:hidden')
            .each(function (idx, selname) {
                configname = selname.id.substr(4);
                $cont.find(selname).val(editor.config[configname]);
            });

    },

    // *************************************************************************************************
    // ******************************************************************************* COLORS
    // *************************************************************************************************

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

    // *************************************************************************************************
    // ******************************************************************************* SPRITES
    // *************************************************************************************************

    spriteClear: function () {
        function zeros(dimensions) {
            var array = [];
            for (var i = 0; i < dimensions[0]; ++i) {
                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
            }
            return array;
        }
        this.sprite = zeros([this.config.max_width, this.config.max_height]);
        this.mask = zeros([this.config.max_width, this.config.max_height]);
        this.spriteSave();
    },
    spriteCrop: function () {
        var x, y;
        for (y = this.config.height; y < this.config.max_height; y++) {
            for (x = 0; x < this.config.max_width; x++) {
                this.sprite[x][y] = 0;
                this.mask[x][y] = 0;
            }
        }
        for (x = this.config.width; x < this.config.max_width; x++) {
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
    spriteSave: function (withUndo) {
        //        if (withUndo === undefined) withUndo = true;
        storage.set('sprite', this.sprite);
        storage.set('mask', this.mask);
        editor.spriteSaveUndo();
    },

    spriteSaveUndo: function () {
        var undo = {};
        var undoNum;
        undo.s = $.extend(true, {}, editor.sprite);
        undo.m = $.extend(true, {}, editor.mask);
        undoNum = editor.undos.push(undo);
        if (undoNum > editor.config.undo_levels + 1) editor.undos.shift();
    },

    spriteReadUndo: function () {
        if (editor.undos.length > 1) {
            editor.redos.push(editor.undos.pop());
            var undo = editor.undos.pop();
            editor.sprite = undo.s;
            editor.mask = undo.m;
            editor.editorUpdateContent();
            editor.spriteSave();
            editor.previewUpdate();
        };
    },

    spriteReadRedo: function () {
        if (editor.redos.length > 0) {
            var undo = editor.redos.pop();
            editor.sprite = undo.s;
            editor.mask = undo.m;
            editor.editorUpdateContent();
            editor.previewUpdate();
            editor.spriteSave();
        };
    },

    // *************************************************************************************************
    // ******************************************************************************* EDITOR
    // *************************************************************************************************

    editorDraw: function () {
        var x, y;
        var $editor = $("#editor");
        $editor.empty();
        for (y = -1; y < editor.config.max_height; y++) {
            for (x = -1; x < editor.config.max_width; x++) {
                var $cell = $("<div></div>");
                $cell.addClass('editor_cell')
                    .attr('id', 'cell_' + x + '_' + y)
                    .addClass('row_' + y);
                if (x == -1) {
                    $cell.addClass('new_line');
                    if (y > -1) {
                        $cell.html(this.formatInt(y));
                    }
                } else {
                    $cell.addClass("col_" + x);
                };
                if (y == -1) {
                    if (x > -1) {
                        $cell.html(this.formatInt(x));
                    }
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
                $editor.append($cell);
            }
        };
    },

    editorUpdateSize: function () {
        var x, y;
        $('#editor').css('width', (Number(editor.config.width) + 2) * ((editor.config.editor_cell_size * editor.config.pixel_width) + 1))
            .css('height', (Number(editor.config.height) + 2) * (Number(editor.config.editor_cell_size) + 1));

        jss.set('.editor_cell', {
            'width': editor.config.editor_cell_size * editor.config.pixel_width,
            'height': editor.config.editor_cell_size,
            'font-size': (editor.config.editor_cell_size * 0.8) + "px"
        });

        $('#cursor').css('width', (editor.config.editor_cell_size * editor.config.pixel_width) - 1)
            .css('height', editor.config.editor_cell_size - 1);

        $(".editor_cell").each(function (idx, elem) {
            var ida = elem.id.split('_');
            var x = ida[1];
            var y = ida[2];
            if (x < editor.config.width && y < editor.config.height) {
                $(elem).removeClass('invisible');
            } else {
                $(elem).addClass('invisible');
            }
        });

    },

    editorUpdateContent: function () {
        var x, y, $cell;
        $(".editor_cell").each(function (idx, elem) {
            var ida = elem.id.split('_');
            var x = ida[1];
            var y = ida[2];
            if (x == -1 && y > -1) {
                $(elem).html(editor.formatInt(y));
            };
            if (y == -1 && x > -1) {
                $(elem).html(editor.formatInt(x));
            };
            if (x > -1 && y > -1) {
                editor.cellSet(elem, editor.sprite[x][y]);
                editor.cellMask(elem, editor.mask[x][y]);
            }
        });
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
        var ex = x + (x < (editor.config.width - 1) ? 1 : 0);
        var ey = y + (y < (editor.config.height - 1) ? 1 : 0);
        for (cx = sx; cx <= ex; cx++) {
            for (cy = sy; cy <= ey; cy++) {
                if (editor.sprite[cx][cy] != 0) return true;
            }
        }
        return false;
    },

    // *************************************************************************************************
    // ******************************************************************************* PREVIEW
    // *************************************************************************************************

    previewDraw: function () {
        var x, y;
        $("#preview").empty();
        for (y = 0; y < this.config.max_height; y++) {
            for (x = 0; x < this.config.max_width; x++) {
                var $cell = $("<div></div>");
                $cell.addClass('preview_cell').attr('id', 'prev_' + x + '_' + y);
                if (x < this.config.width && y < this.config.height) {
                    $cell.addClass('color_' + this.sprite[x][y]);
                }
                if (x == 0 && y == 0) $cell.addClass('first_cell');
                if (x == 0 && y > 0) $cell.addClass('new_line');
                $("#preview").append($cell);
            }
        };
    },

    previewUpdate: function () {
        var x, y, $cell;
        $(".preview_cell").each(function (idx, elem) {
            var ida = elem.id.split('_');
            var x = ida[1];
            var y = ida[2];
            if (x < editor.config.width && y < editor.config.height) {
                editor.cellSet(elem, editor.sprite[x][y]);
                editor.cellMask(elem, editor.mask[x][y]);
                $(elem).removeClass('invisible');
            } else {
                $(elem).addClass('invisible');
            }

        });
    },

    previewSizeUpdate: function () {
        $('#preview').css('top', editor.config.previewY);
        $('#preview').css('left', editor.config.previewX);
        $('#preview').css('width', Number(editor.config.width) * editor.config.preview_cell_size * editor.config.pixel_width);
        $('#preview').css('height', Number(editor.config.height) * editor.config.preview_cell_size);

        jss.set('.preview_cell', {
            'width': editor.config.preview_cell_size * editor.config.pixel_width,
            'height': editor.config.preview_cell_size
        });
    },

    // *************************************************************************************************
    // ******************************************************************************* MASKS
    // *************************************************************************************************

    maskAll: function () {
        var x, y;
        for (x = 0; x < editor.config.max_width; x++) {
            for (y = 0; y < editor.config.max_height; y++) {
                editor.mask[x][y] = 1;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskClear: function () {
        var x, y;
        for (x = 0; x < editor.config.max_width; x++) {
            for (y = 0; y < editor.config.max_height; y++) {
                editor.mask[x][y] = 0;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskAuto: function () {
        var x, y;
        for (x = 0; x < editor.config.width; x++) {
            for (y = 0; y < editor.config.height; y++) {
                editor.mask[x][y] = editor.sprite[x][y] > 0 ? 1 : 0;
            }
        }
        editor.spriteSave()
        editor.editorUpdateContent();
        editor.previewUpdate()
    },
    maskOutline: function () {
        var x, y;
        for (x = 0; x < editor.config.width; x++) {
            for (y = 0; y < editor.config.height; y++) {
                editor.mask[x][y] = editor.cellHasNeighbour(x, y) ? 1 : 0;
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

    // *************************************************************************************************
    // ******************************************************************************* CURSOR
    // *************************************************************************************************

    cursorSetXY(x, y) {
        if (x >= 0 && x < editor.config.width) editor.cursorX = x;
        if (y >= 0 && y < editor.config.height) editor.cursorY = y;
    },

    cursorSetCell(cell) {
        var ida = cell.id.split('_');
        var x = ida[1];
        var y = ida[2];
        editor.cursorSetXY(x, y);
    },

    cursorUpdate() {
        clearTimeout(editor.cursor_timeout);
        $("#cursor").show();
        $("#cursor").detach().prependTo("#cell_" + editor.cursorX + "_" + editor.cursorY);
        editor.cursor_timeout = setTimeout(function () {
            $("#cursor").fadeOut(1000);
        }, 3000);
    },

    // *************************************************************************************************
    // ******************************************************************************* EXPORT IMPORT
    // *************************************************************************************************

    dataShow: function () {
        editor.dataShowRaw();
        editor.dataShowUser();
    },

    dataShowRaw() {
        var rawdata = 'Nothing to export';
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
            objdata.o = {};
            editor.config.config_exportables.forEach(function (elem, idx) {
                objdata.o[elem] = editor.config[elem];
            });
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
        var data_updated = false,
            conf_updated = false;
        var msg = '';
        if (jsondata !== null && typeof jsondata === 'string') {
            try {
                objdata = JSON.parse(jsondata);
            } catch (e) {
                alert('Data parsing error!');
                return false;
            }
            if (confirm("Are You sure?\nAll your current data will be overwritten!")) {
                editor.spriteClear();
                if (objdata.s) {
                    editor.sprite = $.extend({}, editor.sprite, objdata.s);
                    editor.config.width = objdata.w;
                    editor.config.height = objdata.h;
                    msg += "Sprite data imported sucessfuly.\n";
                    data_updated = true;
                }
                if (objdata.m) {
                    editor.mask = $.extend({}, editor.mask, objdata.m);
                    msg += "Mask data imported sucessfuly.\n";
                    data_updated = true;
                }
                if (objdata.c) {
                    editor.config.colors = objdata.c;
                    msg += "Colour data imported sucessfuly.\n";
                    conf_updated = true;
                }
                if (objdata.o) {
                    editor.config.config_exportables.forEach(function (elem, idx) {
                        editor.config[elem] = objdata.o[elem];
                    });
                    msg += "Options imported sucessfuly.\n";
                    conf_updated = true;
                }
                if (data_updated) editor.spriteSave();
                if (conf_updated) editor.configSave();
                $("#data_raw").val(msg);
                return true;
            }
        } else {
            alert('Data decompression error!');
            return false;
        };
    },

    dataShowUser() {
        var userdata = editor.config.export_template;

        userdata = userdata.replace(/##W##/g, editor.dataParse(editor.config.width, false));
        userdata = userdata.replace(/##BW##/g, editor.dataParse(editor.config.width / editor.config.export_mode, false));
        userdata = userdata.replace(/##L##/g, editor.dataParse(editor.config.width * editor.config.height, false));
        userdata = userdata.replace(/##BL##/g, editor.dataParse((editor.config.width / editor.config.export_mode) * editor.config.height, false));
        userdata = userdata.replace(/##H##/g, editor.dataParse(editor.config.height, false));
        userdata = userdata.replace(/##S##/g, editor.img2str(editor.sprite));
        userdata = userdata.replace(/##M##/g, editor.mask2str(editor.mask));
        userdata = userdata.replace(/##C##/g, editor.arr2str(editor.config.colors));
        userdata = userdata.replace("above this window", "in options");


        $("#data_user").val(userdata);
    },

    img2str: function (arr) {
        var byte, bitoffset,
            data = '',
            x = 0,
            y = 0;
        while (y < editor.config.height) {
            x = 0;
            while (x < editor.config.width) {
                byte = 0;
                bitoffset = 8 / editor.config.export_mode;
                switch (Number(editor.config.export_mode)) {
                case 1:
                    byte = arr[x][y];
                    break;
                case 2:
                    byte = (15 & arr[x][y]) << bitoffset;
                    byte |= 15 & arr[x + 1][y];
                    break;
                case 4:
                    byte = arr[x][y] << (bitoffset * 3);
                    byte |= (3 & arr[x + 1][y]) << (bitoffset * 2);
                    byte |= (3 & arr[x + 2][y]) << bitoffset;
                    byte |= 3 & arr[x + 3][y];
                    break;
                case 8:
                    for (var bit = 0; bit < 8; bit++) {
                        byte = byte << 1;
                        byte |= ((arr[x + bit][y]) != 0) ? 1 : 0;
                    }
                    break;
                }
                x += Number(editor.config.export_mode);
                data += editor.dataParse(byte, true);
            }
            ++y;
            if (editor.config.export_CR) data += editor.config.export_row_separator;
        }
        data = data.substr(0, data.length - editor.config.export_data_separator.length);
        if (editor.config.export_CR) data = data.substr(0, data.length - editor.config.export_row_separator.length);
        return data;
    },

    mask2str: function (arr) {
        var byte, bitoffset,
            data = '',
            x = 0,
            y = 0;
        while (y < editor.config.height) {
            x = 0;
            while (x < editor.config.width) {
                byte = 0;
                bitoffset = 8 / editor.config.export_mode;
                switch (Number(editor.config.export_mode)) {
                case 1:
                    byte = arr[x][y] != 0 ? 255 : 0;
                    break;
                case 2:
                    byte = (arr[x][y] != 0) ? (15 << bitoffset) : 0;
                    byte |= (arr[x + 1][y] != 0) ? 15 : 0;
                    break;
                case 4:
                    byte = (arr[x][y] != 0) ? 3 << (bitoffset * 3) : 0;
                    byte |= (arr[x + 1][y] != 0) ? 3 << (bitoffset * 2) : 0;
                    byte |= (arr[x + 2][y] != 0) ? 3 << bitoffset : 0;
                    byte |= (arr[x + 3][y] != 0) ? 3 : 0;
                    break;
                case 8:
                    for (var bit = 0; bit < 8; bit++) {
                        byte = byte << 1;
                        byte |= ((arr[x + bit][y]) != 0) ? 1 : 0;
                    }
                    break;
                }
                x += Number(editor.config.export_mode);
                data += editor.dataParse(byte, true);
            }
            ++y;
            if (editor.config.export_CR) data += editor.config.export_row_separator;
        }
        data = data.substr(0, data.length - editor.config.export_data_separator.length);
        if (editor.config.export_CR) data = data.substr(0, data.length - editor.config.export_row_separator.length);
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
    },

    exportTemplatesLoad: function () {
        for (var key in editor.export_templates) {
            var $opt = $("<option></option>").attr('value', key).html(key);
            $("#export_template_list").append($opt);
        };
    },

    exportTemplateSet: function (tmp) {
        if (tmp != -1) {
            for (var key in editor.export_templates[tmp]) {
                if ($("#opt_" + key).hasClass('opt_check')) {
                    $("#opt_" + key).prop('checked',(editor.export_templates[tmp][key]));    
                } else {
                    $("#opt_" + key).val(editor.export_templates[tmp][key]);    
                }
                

            }
            //editor.configShow("mod_options");
        }
    }
};