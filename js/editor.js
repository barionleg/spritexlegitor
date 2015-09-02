var editor = {
    sprite : [],
    mask : [],
    width: config.default_width,
    height: config.default_height,
    colors: [config.default_c0,config.default_c1,config.default_c2,config.default_c3],
    color: 0,
    init: function() {
        palette.draw('#palette');
        $('.usercolor').bind('click',this.pickerClick);
        $('.usercolor').bind('dblclick',this.paletteShow);
        $('.usercolor').bind('contextmenu', function(e) {
            e.preventDefault();
            editor.colorPick(this.id.substr(-1));
            $("#palette").slideToggle();
        });
        $('.palette_colorcell').bind('click',this.paletteClick);
        $("#width_dec").bind('click',this.widthDec);
        $("#width_inc").bind('click',this.widthInc);
        $("#height_dec").bind('click',this.heightDec);
        $("#height_inc").bind('click',this.heightInc);
        $("#btn_about").bind('click',function(){$("#mod_about").fadeToggle();});
        $(".close_button").bind('click',function(){$(this).parent().fadeOut()});
        $("#version").html(config.version);
        this.spriteClear();
        this.colorsUpdate();
        this.sizeUpdate();
    },
    formatInt: function(num){
      return (config.hex_mode?("0"+Number(num).toString(16).toUpperCase()).slice(-2):Number(num));
    },

    widthDec: function(){                       // ************** SIZES
        if (editor.width>1) {
            --editor.width;
            editor.sizeUpdate();
        }
    },
    widthInc: function(){
        if (editor.width<config.max_width) {
            ++editor.width;
            editor.sizeUpdate();
        }
    },
    heightDec: function(){
        if (editor.height>1) {
            --editor.height;
            editor.sizeUpdate();
        }
    },
    heightInc: function(){
        if (editor.height<config.max_height) {
            ++editor.height;
            editor.sizeUpdate();
        }
    },
    sizeUpdate: function() {
        $("#size_width").html(this.formatInt(this.width));
        $("#size_height").html(this.formatInt(this.height));
    },

    
    pickerClick: function() {                   // ************** COLORS
        editor.colorPick(this.id.substr(-1));
    },
    colorPick: function(cnum) {
        this.color = cnum;
        this.colorsUpdate();
    },
    colorSet:function(cnum,cval) {
        this.colors[cnum]=cval;
        this.colorsUpdate()
    },
    colorsUpdate: function() {
        this.colors.forEach(function(cval,cnum){
            palette.colorSet(cnum,cval);  
            $("#usercolor_"+cnum+" div.cnum").html(editor.formatInt(cval));
        });
        $(".usercolor").removeClass('color_picked');
        $("#usercolor_"+this.color).addClass('color_picked');
    },
    paletteShow: function() {
      $("#palette").slideDown();
    },
    paletteClick: function() {
        editor.palettePick(this.title);
        $("#palette").slideUp();
    },
    palettePick: function(cval) {
        this.colorSet(this.color,cval);
    },
    
    spriteClear: function() {                   // ************** SPRITES
        function zeros(dimensions) {
            var array = [];
            for (var i = 0; i < dimensions[0]; ++i) {
                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
            }
            return array;
        }
        this.sprite = zeros([config.max_width*4,config.max_height]);
        this.mask = zeros([config.max_width*4,config.max_height]);
        
    },
    

};
