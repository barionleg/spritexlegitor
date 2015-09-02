var editor = {
    sprite: [],
    mask: [],
    width: config.default_width,
    height: config.default_height,
    colors: [config.default_c0, config.default_c1, config.default_c2, config.default_c3],
    color: config.selected_color,
    init: function () {
        this.spriteClear();
        this.editorDraw();
        palette.draw('#palette');
        $("#version").html(config.version);
        this.colorsUpdate();
        this.sizeUpdate();
        this.bindEvents();
    },
    bindEvents: function () {
        $('.usercolor').bind('click', this.pickerClick);
        $('.usercolor').bind('dblclick', this.paletteShow);
        $('.usercolor').bind('contextmenu', function (e) {
            e.preventDefault();
            editor.colorPick(this.id.substr(-1));
            $("#palette").slideToggle();
        });
        $("div#palette div.palette_colorcell").bind('click', this.paletteClick);
        $("#width_dec").bind('click', this.widthDec);
        $("#width_inc").bind('click', this.widthInc);
        $("#height_dec").bind('click', this.heightDec);
        $("#height_inc").bind('click', this.heightInc);
        $("#btn_about").bind('click', function () {
            $("#mod_about").fadeToggle();
        });
        $(".close_button").bind('click', function () {
            $(this).parent().fadeOut()
        });
        $(".inner_cell").bind('mouseover',function(){
            if(mouseDown) {
                editor.paintCell(this.id)
            }
        });
        $(".inner_cell").bind('mousedown',function(){
            editor.paintCell(this.id)
        });
        $(".inner_cell").bind('mouseup',function(){
            editor.previewUpdate();
        });

    },
    formatInt: function (num) {
        return (config.hex_mode ? ("0" + Number(num).toString(16).toUpperCase()).slice(-2) : Number(num));
    },

    widthDec: function () { // ************** SIZES
        if (editor.width > 1) {
            --editor.width;
            editor.sizeUpdate();
        }
    },
    widthInc: function () {
        if (editor.width < config.max_width) {
            ++editor.width;
            editor.sizeUpdate();
        }
    },
    heightDec: function () {
        if (editor.height > 1) {
            --editor.height;
            editor.sizeUpdate();
        }
    },
    heightInc: function () {
        if (editor.height < config.max_height) {
            ++editor.height;
            editor.sizeUpdate();
        }
    },
    sizeUpdate: function () {
        $("#size_width").html(this.formatInt(this.width));
        $("#size_height").html(this.formatInt(this.height));
        this.editorUpdateSize();
        this.previewUpdate();
    },


    pickerClick: function () { // ************** COLORS
        editor.colorPick(this.id.substr(-1));
    },
    colorPick: function (cnum) {
        this.color = cnum;
        this.colorsUpdate();
    },
    colorSet: function (cnum, cval) {
        this.colors[cnum] = cval;
        this.colorsUpdate()
    },
    colorsUpdate: function () {
        this.colors.forEach(function (cval, cnum) {
            palette.colorSet(cnum, cval);
            $("#usercolor_" + cnum + " div.cnum").html(editor.formatInt(cval));
        });
        $(".usercolor").removeClass('color_picked');
        $("#usercolor_" + this.color).addClass('color_picked');
    },
    paletteShow: function () {
        $("#palette").slideDown();
    },
    paletteClick: function () {
        editor.palettePick(this.title);
        $("#palette").slideUp();
    },
    palettePick: function (cval) {
        this.colorSet(this.color, cval);
    },

    spriteClear: function () { // ************** SPRITES
        function zeros(dimensions) {
            var array = [];
            for (var i = 0; i < dimensions[0]; ++i) {
                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
            }
            return array;
        }
        this.sprite = zeros([config.max_width * 4, config.max_height]);
        this.mask = zeros([config.max_width * 4, config.max_height]);

    },


    editorDraw: function () {
        $("#editor").empty();
        for (y = -1; y < config.max_height; y++) {
            for (x = -1; x < config.max_width * 4; x++) {
                var x_byte = Math.floor(x / 4);
                var $cell = $("<div></div>");
                $cell.addClass('editor_cell')
                    .attr('id', 'cell_' + x + '_' + y)
                    .addClass('row_'+y);
                if (x==-1) {
                    $cell.addClass('new_line');
                    if (y>-1) {
                        $cell.html(this.formatInt(y));
                    }
                };
                if (y==-1) {
                    if (x>-1) {
                        $cell.html(this.formatInt(x));
                    }
                };
                if (x>-1) {
                    $cell.addClass('byte_'+x_byte);
                };

                if (x>-1 && y>-1) {
                    $cell.addClass('color_'+this.sprite[x][y])
                    .addClass('inner_cell');
                };
                $("#editor").append($cell);
            }
        }
    },
    
    editorUpdateSize: function () {
        $('.editor_cell').show();
        for (x = this.width; x < config.max_width; x++) {
            $(".byte_"+x).hide();
        }
        for (y = this.height; y < config.max_height; y++) {
            $(".row_"+y).hide();
        }
    },

    paintCell: function(cell_id) {
        var ida = cell_id.split('_');
        var x=ida[1];
        var y=ida[2];
        this.sprite[x][y] = this.color;
        for (var i=0;i<4;i++) {

            if (i==this.color) {
                $("#"+cell_id).addClass('color_'+i)
            } else {
                $("#"+cell_id).removeClass('color_'+i);
            }
        }
    },

    previewUpdate: function() {
        $("#preview").empty();
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width * 4; x++) {
                var $cell = $("<div></div>");
                $cell.addClass('preview_cell')
                .addClass('color_'+this.sprite[x][y]);
                if (x==0) $cell.addClass('new_line');
                $("#preview").append($cell);
            }
        }
    },

};
