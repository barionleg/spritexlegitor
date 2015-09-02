$(document).ready(function () {
    'use strict';

    pallete.show();
    
    pallete.setColor(0,0);
    pallete.setColor(1,42);
    pallete.setColor(2,202);
    pallete.setColor(3,140);

    var mydiv = $("<div></div>").addClass('new_line').addClass('color_2').addClass('usercolor');
    $('body').append(mydiv);

});


Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

pallete = {
    show:function(){
        var i,c,$ndiv;
        for (i=0;i<256;i++){
            c=this.getRGB(i);
            $ndiv = $("<div></div>")
                .addClass('pallete_colorcell')
                .css('background-color',c)
                .attr('id','col_'+i)
                .attr('title',i);
            if (i%16==0) $ndiv.addClass('pallete_firstinrow');
            $('body').append($ndiv);
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
    setColor:function(cnum,cval) {
        $(".color_"+cnum).css("background-color",this.getRGB(cval));
    },
}