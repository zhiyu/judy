function decimal(val, position) {
    var f = parseFloat(val);
    if (isNaN(f)) {
        return false;
    }
    var f = Math.round(f*100)/100;
    var s = f.toString();
    var pos = s.indexOf('.');
    if (pos < 0) {
        pos = s.length;
        s += '.';
    }
    while (s.length <= pos + position) {
        s += '0';
    }
    return s;
}


var _options = {
    width:600,
    height:400,
    margin:[20,20,40,80],
    bgAttr:{
       fill:"#ffffff",
       "stroke-width":0
    },
    formatX: null,
    formatY: null,
    getX: null,
    getY: null,
    showTracker:true,
    trackerAttr:{
        "stroke-width":1,
        "opacity":0.5,
        "fill":"#666666"
    },
    showGrid:true,
    gridXAttr:{
      "stroke-width":1,
      "opacity":0.1,
      fill:"#666666",
    },
    gridYAttr:{
      "stroke-width":1,
      "opacity":0.1,
      fill:"#666666",
    },
    tickSize:10,
    tickLength:5,
    tickInterval: null,
    tickFixed:2,
    tickYAttr:{
      "font-size":12,
      fill:"#666666",
      "opacity":0.8
    },
    tickXAttr:{
      "font-size":12,
      "fill":"#666666",
      "opacity":0.8
    },
    getTickY: null,
    formatTickY: null,
    getTickX: null,
    formatTickX: null,
    tipAttr:{
      "stroke-width":2,
      "opacity":0.8,
      "fill":"#f4f4f4",
      "stroke":"#666666",
      "padding":5,
      "textAttr":{
        "font-size":12,
        "fill":"#000000",
        "opacity":1,
        "text-anchor":"start"
      }
    },
    getTipText:null,
    lineAttr:{
      "stroke-width":4,
      "opacity":0.9       
    },
    lineHoverAttr:{
      "stroke-width":4,
      "opacity":0.9       
    },
    dotAttr:{
      "stroke-width":2,
      "r":4,
      "opacity":1
    },
    dotHoverAttr:{
      "stroke-width":2,
      "r":6,
      "opacity":1
    },
    colors:[
      ["#bfc91c"],
      ["#2c91e4"],
      ["#e42c2c"]
    ],
    timing:500,
    dotTiming:100
};

function Chart(container, type, data, options){
    utils.extend(_options, options);
    this._options = _options

    var gc = Raphael(container,_options.width, _options.height);
    this.setGC(gc);

    this.setType(type);
    this.setData(data);
    this.init();
}

Chart.prototype = {
    init:function(){
        this.elements = {
            series:[],
            ticks:[[[],[]],[[],[]]], 
            dots:[]     
        }

        this.setSize({width: _options.width, height: _options.height});
        this.setFrame();
        this.setMax();
        this.setMin();
    },
    setSize: function (size) {
        this._size = size;
    },
    getSize: function () {
        return this._size;
    },
    setGC: function (gc) {
        this._gc = gc;
    },
    getGC: function () {
        return this._gc;
    },
    setType: function (type) {
        this._type = type;
        eval("var Render = " + type + "Render");
        var render =  new Render();
        this.setRender(render);
    },
    setRender: function (render) {
        this._render = render;
    },
    setData: function (data) {
        this._data = data;
    },
    draw: function(){
        this._render.draw(this, this._data, this._options);
    },
    setFrame: function(){
        var size = this.getSize();
        var frame    = {};
        frame.x      = this._options.margin[3];
        frame.y      = this._options.margin[0];
        frame.width  = size.width - this._options.margin[1] - this._options.margin[3];
        frame.height = size.height - this._options.margin[0] - this._options.margin[2];
        this._frame  = frame;
    },
    getFrame: function(){
        return this._frame;
    },
    setMax: function(){
        var max;
        for(var i=0;i<this._data.series.length;i++){
            for(var j=0;j<this._data.series[i].length;j++){
                var y = this.getY(this._data.series[i],j);
                if(i==0 && j==0){
                    max = y;
                }else{
                    if(y > max)
                        max = y;
                }
            }
        }
        this._max = max;
        return max;
    },
    getMax: function(){
        return this._max;
    },
    setMin: function(){
        var min;
        for(var i=0;i<this._data.series.length;i++){
            for(var j=0;j<this._data.series[i].length;j++){
                var y = this.getY(this._data.series[i],j);

                if(i==0 && j==0){
                    min = y;
                }else{
                    if(y < min)
                        min = y;
                }

            }
        }
        this._min = min;
        return min;
    },
    getMin: function(){
        return this._min;
    },
    getPixX: function(count,i){
        var w = this.getSize().width - this._options.margin[1]-this._options.margin[3];
        return this._options.margin[3] + i*w/(count-1);
    },
    getPixY: function(y){
        var h = this.getSize().height - this._options.margin[0]-this._options.margin[2];
        var max = this.getMax();
        var min = this.getMin();
        return h * (1-(y-min)/(max-min)) + this._options.margin[0];
    },
    getY: function(data,i){
        if(this._options.getY){
            return this._options.getY(data, i);
        }
        return data[i]['y'];
    },
    getX: function(data,i){
        if(this._options.getX){
            return this._options.getX(data, i);
        }
        return data[i]['x'];
    },
    getTickY: function(i){
        var max = this.getMax();
        var min = this.getMin();
        var interval = (max - min)/this._options.tickSize;
        var tickVal = decimal(min + interval*i, this._options.tickFixed);

        if(this._options.getTickY){
            return this._options.getTickY(tickVal,i);
        }else{
            return tickVal;
        }
    },
    formatTickY: function(i){
        var tickVal = this.getTickY(i);
        if(this._options.formatTickY){
            return this._options.formatTickY(tickVal,i);
        }else{
            return tickVal;
        }
    },
    getTickX: function(i){
        var tickVal = this._data.categories[i];
        if(this._options.getTickX){
            return this._options.getTickX(tickVal,i);
        }else{
            return tickVal;
        }
    },
    formatTickX: function(i){
        var tickVal = this.getTickX(i);
        if(this._options.formatTickX){
            return this._options.formatTickX(tickVal,i);
        }else{
            return tickVal;
        }
    },
    getTipText: function(data, i){
        if(this._options.getTipText){
            return this._options.getTipText(data,i);
        }else
            return data[i]['y']+"";
    },
    getDots:function(type, pos1, pos2){
        var els = [];

        //vertical
        if(type == 0){
            for(var i=0;i<this.elements.dots.length;i++){
                var dots = this.elements.dots[i];
                for(var j=0;j<dots.length;j++){
                    var el = dots[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2){
                        els.push(el);
                    }
                }
            }
        }else if(type == 1){
        //horizontal

        }else if(type == 3){
            for(var i=0;i<this.elements.dots.length;i++){
                var dots = this.elements.dots[i];
                for(var j=0;j<dots.length;j++){
                    var el = dots[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2 && pos2 >= box.y && pos2 <= box.y2){
                        els.push(el);
                    }
                }
            }
        }
        return els;
    }
}

/*
 * Line Chart 
 */
function LineRender(){}
LineRender.prototype = {
    draw: function(context,data, options){
        var self = this;
        self._context = context;
        self._data = data;
        self._options = options;
        self._gc = self._context.getGC();
        self.init();
        self.buildAxes();
        self.buildChart();
        self.drawAxes();
        setTimeout(function(){
            self.drawBackground();
            self.drawChart();   
        },self._options.timing);
         
    },
    init: function(){
        this.tips  = [];
        this.tipTexts = [];
    },
    buildAxes:function(){
        
    },
    buildChart:function(){
        var self = this;

        var minY = self._context.getPixY(self._context.getMin());

        for(var i=0;i<self._data.series.length;i++){
            var data = self._data.series[i];

            var path = self._gc.path("");
            path.attr(self._options.lineAttr);
            path.attr("stroke", self._options.colors[i]);
            //save series
            self._context.elements.series.push(path);
            
            var pathString;
            var dot = new Array();
            for(var j = 0;j<data.length;j++){
                var y =  self._context.getPixY(self._context.getY(data,j));
                var x = self._context.getPixX(data.length,j);

                if(j==0){
                    pathString  = "M"+x+","+minY;
                }else{
                    var y1 = self._context.getPixY(self._context.getY(data,j-1));
                    var x1 = self._context.getPixX(data.length,j-1);
                    var ix = (x - x1)/1.4;

                    pathString  += "S"+(x1+ix)+","+minY+" "+x+","+minY;
                }
                
                var _dot = self._gc.circle(0, 0);
                _dot.attr(self._options.dotAttr);
                _dot.attr("stroke", self._options.bgAttr.fill);
                _dot.attr("fill", self._options.colors[i]);
                _dot.attr("data",self._context.getY(data,j));
                _dot.attr("cx",x);
                _dot.attr("cy",minY);
                _dot.data("index",j);
                _dot.data("data",data);
                _dot.mouseover(function(){

                    this.animate(self._options.dotHoverAttr, self._options.dotTiming);
                    var box = this.getBBox();
                    self.drawTips((box.x+box.x2)/2, (box.y+box.y2)/2, [self._context.getTipText(this.data("data"), this.data("index"))]);
                }).mouseout(function(){
                    this.animate(self._options.dotAttr, self._options.dotTiming);
                });
                dot.push(_dot);
            }

            path.attr("path", pathString);

            //save dots
            self._context.elements.dots.push(dot);
        }
    },
    drawBackground: function(){
        var self  = this;
        var minY  = this._context.getPixY(this._context.getMin());
        var left  = self._options.margin[3];
        var right = self._context.getSize().width - self._options.margin[1];
        
        var bg = this._gc.rect(0, 0, this._context.getSize().width, this._context.getSize().height);
        bg.toBack();
        bg.attr(self._options.bgAttr);

        if(this._options.showTracker){
            var tracker = this._gc.path("");
            tracker.attr(self._options.trackerAttr);
        }

        var els = [];
        bg.mousemove(function(e){
            var offsetX = e.offsetX?e.offsetX:e.layerX;
            var offsetY = e.offsetY?e.offsetY:e.layerY;

            for(var i=0;i<els.length;i++){
                for(var j = 0; j < els[i].events.length; j++) {
                    if (els[i].events[j].name == 'mouseout') {
                        els[i].events[j].f.apply(els[i]);
                    }
                }
            }
            
            if(self._options.showTracker){
                els = self._context.getDots(0, offsetX);
                self.clearTips();
                //draw tips
                for(var i=0;i<els.length;i++){
                    for(var j = 0; j < els[i].events.length; j++) {
                        if (els[i].events[j].name == 'mouseover') {
                            els[i].events[j].f.apply(els[i]);
                        }
                    }
                }

                //draw tracker
                if(offsetX >= left && offsetX <= right){
                    if(self._options.showTracker){
                        tracker.attr("path","M"+offsetX+","+self._options.margin[0]+"L"+offsetX+","+minY); 
                    }
                }
            }else{
                self.clearTips();
            }
        });

    },
    drawAxes: function(){
        var minY = this._context.getPixY(this._context.getMin());

        /*
         * YAxis
         */
        var path = this._gc.path("");
        path.attr(self._options.tickYAttr);
        path.attr("path","M"+this._options.margin[3]+","+this._options.margin[0]+"L"+this._options.margin[3]+","+(this._context.getSize().height -this._options.margin[2]));
       
        for(var i=0;i<this._options.tickSize+1;i++){
            var y = this._context.getPixY(this._context.getTickY(i));
            var text = this._gc.text(10,minY,this._context.formatTickY(i));
            text.attr(this._options.tickYAttr);
            text.attr("width", this._options.margin[3]);
            text.attr("text-anchor", "start");
            text.animate({"y":y}, self._options.timing);
            //text.attr({"y":y});

            var path = this._gc.path("");
            path.attr(self._options.tickYAttr);
            path.attr("path","M"+this._options.margin[3]+","+minY+"L"+(this._options.margin[3]-this._options.tickLength)+","+minY);
            path.animate({"path":"M"+this._options.margin[3]+","+y+"L"+(this._options.margin[3]-this._options.tickLength)+","+y}, self._options.timing);
            //path.attr({"path":"M"+this._options.margin[3]+","+y+"L"+(this._options.margin[3]-this._options.tickLength)+","+y});
            
            if(this._options.showGrid){
               var path = this._gc.path("");
               path.attr(self._options.gridYAttr);
               path.attr("path","M"+this._options.margin[3]+","+minY+"L"+(this._context.getSize().width-this._options.margin[1])+","+minY);
               path.animate({"path":"M"+this._options.margin[3]+","+y+"L"+(this._context.getSize().width-this._options.margin[1])+","+y}, self._options.timing);
               //path.attr({"path":"M"+this._options.margin[3]+","+y+"L"+(this._context.getSize().w-this._options.margin[1])+","+y});
            }
        }

        /*
         * XAxis
         */

        path = this._gc.path("");
        path.attr(self._options.tickXAttr);
        path.attr("path","M"+this._options.margin[3]+","+(this._context.getSize().height - this._options.margin[2])+"L"+(this._context.getSize().width - this._options.margin[1])+","+(this._context.getSize().height - this._options.margin[2]));
        
        for(var i=0;i<this._data.categories.length;i++){
            var x = this._context.getPixX(this._data.categories.length,i);

            var text = this._gc.text(this._options.margin[3],minY+3*this._options.tickLength,this._context.getTickX(i));
            text.attr(this._options.tickXAttr);
            text.attr("text-anchor", "middle");
            text.animate({"x":x}, self._options.timing);
            //text.attr({"x":x});

            var path = this._gc.path("");
            path.attr(self._options.tickXAttr);
            path.attr("path","M"+this._options.margin[3]+","+minY+"L"+this._options.margin[3]+","+(minY+this._options.tickLength));
            path.animate({"path":"M"+x+","+minY+"L"+x+","+(minY+this._options.tickLength)}, self._options.timing);
            //path.attr({"path":"M"+x+","+minY+"L"+x+","+(minY+this._options.tickLength)});
            
            if(this._options.showGrid){
                var path = this._gc.path("");
                path.attr(self._options.gridXAttr);
                path.attr("path","M"+this._options.margin[3]+","+this._options.margin[0]+"L"+this._options.margin[3]+","+minY);
                path.animate({"path":"M"+x+","+this._options.margin[0]+"L"+x+","+minY}, self._options.timing);  
                //path.attr({"path":"M"+x+","+this._options.margin[0]+"L"+x+","+minY});  
            }
        }
    },
    drawChart: function(){
        var self = this;
        var minY = self._context.getPixY(self._context.getMin());
        var w = this._context.getSize().width;
        var h = this._context.getSize().height;

        for(var i=0;i<self._data.series.length;i++){
            var path = self._context.elements.series[i];
            var dot = self._context.elements.dots[i];
            var data = self._data.series[i];
            var pathString;
            for(var j=0;j<data.length;j++){
                var y =  self._context.getPixY(self._context.getY(data,j));
                var x = self._context.getPixX(data.length,j);
                if(j==0){
                    pathString = "M"+x+","+y;
                }else{
                    var y1 = self._context.getPixY(self._context.getY(data,j-1));
                    var x1 = self._context.getPixX(data.length,j-1);
                    var ix = (x - x1)/1.4;
                    pathString += "S"+(x1+ix)+","+y+" "+x+","+y;   
                }
            }
            path.animate({path:pathString}, self._options.timing,"<");

            for(var j=0;j<dot.length;j++){
                var _dot  = dot[j];
                var y = self._context.getPixY(self._context.getY(data,j));
                _dot.animate({"cy":y}, self._options.timing, "<");
            }   
        }
    },
    drawTips: function (x, y, els) {
        var angle  = 5, indent = 8;
        var padding = this._options.tipAttr.padding;

        x = Math.round(x) + indent;
        y = Math.round(y);

        var h = 2 * padding;
        var w = h;
        var maxWidth = 0; 

        var path = this._gc.path("");
        path.hide();
        path.attr(this._options.tipAttr);
        this.tips.push(path);

        var texts = [];

        for(var i=0;i<els.length;i++){
            var text = this._gc.text(0, y, els[i]);
            text.hide();
            text.attr(this._options.tipAttr.textAttr);
            this.tipTexts.push(text);
            texts.push(text);
            h += text.getBBox().height;
            if(text.getBBox().width > maxWidth){
                maxWidth = text.getBBox().width;
            }
        }

        w += maxWidth;
        var hh = Math.round(h/2);
        if(hh < angle){
            angle = hh;
        }
    
        var xa;
        var tx;
        var frame = this._context.getFrame();

        //check if tip's frame is out of bounds
        if(x+angle+w > frame.x+frame.width){
            w  = -w;
            x -= 2*indent;
            xa = x-angle;
            tx = xa + w + padding;
        }else{
            xa = x+angle;
            tx = xa+padding;
        }

        for(var i=0;i<texts.length;i++){
            texts[i].attr("x",tx);
            texts[i].show();
        }
        var pathString = "M"+x+","+y+"L"+xa+","+(y-angle)+"L"+xa+","+(y-hh)+"L"+(xa+w)+","+(y-hh)+"L"+(xa+w)+","+(y+hh)+"L"+xa+","+(y+hh)+"L"+xa+","+(y+angle)+"L"+x+","+y;
        path.attr("path",pathString);
        path.show();
    },
    clearTips: function(){
        for(var i=0;i<this.tips.length;i++){
            this.tips[i].remove();
        }
        for(var i=0;i<this.tipTexts.length;i++){
            this.tipTexts[i].remove();
        }
        this.tips.splice(0);
        this.tipTexts.splice(0);
    }
}

/*
 * Utils 
 */
var utils = {
    extend : function(){
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if ( typeof target !== "object" && !this.isFunction(target)) {
            target = {};
        }
        if ( length === i ) {
            target = this;
            --i;
        }
        for ( ; i < length; i++ ) {
            if ( (options = arguments[ i ]) != null ) {
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];
                    if ( target === copy ) {
                        continue;
                    }
                    if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && this.isArray(src) ? src : [];
                        } else {
                            clone = src && this.isPlainObject(src) ? src : {};
                        }
                        target[ name ] = this.extend( deep, clone, copy );
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        return target;
    }
}
