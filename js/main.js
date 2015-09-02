$(document).ready(function () {
    'use strict';

 //   pallete.draw('body');
    
//    pallete.colorSet(0,0);
//    pallete.colorSet(1,42);
//    pallete.colorSet(2,202);
//    pallete.colorSet(3,140);

    editor.init();
    
    var mydiv = $("<div></div>").addClass('new_line').addClass('color_1').addClass('usercolor');
    $('body').append(mydiv);

});


Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

var pallete = {
    draw:function(container){
        var i,c,$ndiv;
        for (i=0;i<256;i++){
            c=this.getRGB(i);
            $ndiv = $("<div></div>")
                .addClass('pallete_colorcell')
                .css('background-color',c)
                .attr('id','col_'+i)
                .attr('title',i);
            if (i%16==0) $ndiv.addClass('pallete_firstinrow');
            $(container).append($ndiv);
        }
    },
    getRGB:function(cval){
    
        var cr = (cval >> 4) & 15;
        var lm = cval & 15;
        var crlv = cr ? 50 : 0;

        var phase = ((cr-1)*25.7 - 15) * (2 * 3.14159 / 360);

        var y = 255*(lm+1)/16;
        var i = crlv*Math.cos(phase);
        var q = crlv*Math.sin(phase);

        var r = y + 0.956*i + 0.621*q;
        var g = y - 0.272*i - 0.647*q;
        var b = y - 1.107*i + 1.704*q;

        var rr = (Math.round(r)).clamp(0,255);
        var gg = (Math.round(g)).clamp(0,255);
        var bb = (Math.round(b)).clamp(0,255);
        
        return "rgb("+rr+","+gg+","+bb+")";
    },
    colorSet:function(cnum,cval) {
        var rgb = this.getRGB(cval);
        jss.set('.color_'+cnum, {
            'background-color':rgb
        });
    },
};

var config = {
    default_width: 1,
    default_height: 8,
    max_width: 8,
    max_height: 48,
    default_c0: 0,
    default_c1: 41,
    default_c2: 202,
    default_c3: 140,
}

var editor = {
    sprite : [],
    mask : [],
    width: config.default_width,
    height: config.default_height,
    colors: [config.default_c0,config.default_c1,config.default_c2,config.default_c3],
    color: 0,
    init: function() {
        $('.usercolor').bind('click',this.pickerClick);
        $("#width_dec").bind('click',this.widthDec);
        $("#width_inc").bind('click',this.widthInc);
        $("#height_dec").bind('click',this.heightDec);
        $("#height_inc").bind('click',this.heightInc);
        this.spriteClear();
        this.colorsUpdate();
        this.sizeUpdate();
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
        $("#size_width").html(this.width);
        $("#size_height").html(this.height);
    },

    
    pickerClick: function() {                   // ************** COLORS
        editor.colorPick(this.id.substr(-1));
    },
    colorPick: function(cnum) {
        this.color = cnum;
        this.colorsUpdate();
    },
    colorSet:function(cnum,cval) {
        this.colors[cnum,cval];
        this.colorsUpdate()
    },
    colorsUpdate: function() {
        this.colors.forEach(function(cval,cnum){
            pallete.colorSet(cnum,cval);   
        });
        $(".usercolor").removeClass('color_picked');
        $("#usercolor_"+this.color).addClass('color_picked');
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
        //console.log(this.sprite);
    },
    
    
    
    


};
