var _options = {
    width:600,
    height:400,
    margin:[20,20,40,80],
    bgAttr:{
       fill:"#ffffff",
       "stroke-width":0
    },
    threshold: null,
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
      "stroke-width":3,
      "opacity":0.9       
    },
    lineHoverAttr:{
      "stroke-width":4,
      "opacity":0.9       
    },
    dotAttr:{
      "stroke-width":2,
      "r":3,
      "opacity":1
    },
    dotHoverAttr:{
      "stroke-width":2,
      "r":4,
      "opacity":1
    },
    colors:[
      ["#075697"],
      ["#970707"],
      ["#079741"]
    ],
    timing:500,
    dotTiming:100
};

function Chart(container, type, data, options){
    extend(_options, options);
    this.options = _options;

    var gc = Raphael(container, this.options.width, this.options.height);
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

        this.setSize({width: this.options.width, height: this.options.height});
        this.setFrame();
        this.setMax();
        this.setMin();
    },
    draw: function(){
        this.render.run(this);
    },
    setSize: function (size) {
        this.size = size;
    },
    getSize: function () {
        return this.size;
    },
    setGC: function (gc) {
        this.gc = gc;
    },
    getGC: function () {
        return this.gc;
    },
    setType: function (type) {
        this.type = type;
        eval("var Render = " + type + "Render");
        var render =  new Render();
        this.setRender(render);
    },
    setRender: function (render) {
        this.render = render;
    },
    setData: function (data) {
        this.data = data;
    },
    setFrame: function(){
        var size = this.getSize();
        var frame    = {};
        frame.x      = this.options.margin[3];
        frame.y      = this.options.margin[0];
        frame.width  = size.width - this.options.margin[1] - this.options.margin[3];
        frame.height = size.height - this.options.margin[0] - this.options.margin[2];
        this.frame  = frame;
    },
    getFrame: function(){
        return this.frame;
    },
    setMax: function(){
        var max;
        for(var i=0;i<this.data.series.length;i++){
            for(var j=0;j<this.data.series[i].length;j++){
                var y = this.getY(this.data.series[i],j);
                if(i==0 && j==0){
                    max = y;
                }else{
                    if(y > max)
                        max = y;
                }
            }
        }
        this.max = max;
        return max;
    },
    getMax: function(){
        return this.max;
    },
    setMin: function(){
        var min;
        for(var i=0;i<this.data.series.length;i++){
            for(var j=0;j<this.data.series[i].length;j++){
                var y = this.getY(this.data.series[i],j);

                if(i==0 && j==0){
                    min = y;
                }else{
                    if(y < min)
                        min = y;
                }

            }
        }
        this.min = min;
        return min;
    },
    getMin: function(){
        return this.min;
    },
    getPixX: function(count,i){
        var w = this.getSize().width - this.options.margin[1]-this.options.margin[3];
        return this.options.margin[3] + i*w/(count-1);
    },
    getPixY: function(y){
        var h = this.getSize().height - this.options.margin[0]-this.options.margin[2];
        var max = this.getMax();
        var min = this.getMin();
        return h * (1-(y-min)/(max-min)) + this.options.margin[0];
    },
    getY: function(data,i){
        if(this.options.getY){
            return this.options.getY(data, i);
        }
        return data[i]['y'];
    },
    getX: function(data,i){
        if(this.options.getX){
            return this.options.getX(data, i);
        }
        return data[i]['x'];
    },
    getTickY: function(i){
        var max = this.getMax();
        var min = this.getMin();
        var interval = (max - min)/this.options.tickSize;
        var tickVal = decimal(min + interval*i, this.options.tickFixed);

        if(this.options.getTickY){
            return this.options.getTickY(tickVal,i);
        }else{
            return tickVal;
        }
    },
    formatTickY: function(i){
        var tickVal = this.getTickY(i);
        if(this.options.formatTickY){
            return this.options.formatTickY(tickVal,i);
        }else{
            return tickVal;
        }
    },
    getTickX: function(i){
        var tickVal = this.data.categories[i];
        if(this.options.getTickX){
            return this.options.getTickX(tickVal,i);
        }else{
            return tickVal;
        }
    },
    formatTickX: function(i){
        var tickVal = this.getTickX(i);
        if(this.options.formatTickX){
            return this.options.formatTickX(tickVal,i);
        }else{
            return tickVal;
        }
    },
    getTipText: function(data, i){
        if(this.options.getTipText){
            return this.options.getTipText(data,i);
        }else
            return data[i]['y']+"";
    }
}

/*
 * Render Prototype
 */
function Render(){}
Render.prototype = {
    run: function(context){
        this.context = context;
        this.data    = this.context.data;
        this.options = this.context.options;
        this.gc      = this.context.getGC();
        this.init();
        this.build();
        this.create();
        this.draw();
    },
    init: function(){
        //transformed data
        this.tdata = {};
        this.elements = {
            axes:[],
            series:[], 
            dots: [],
            tips: [],
            tipTexts:[]
        };
    },
    clear:function(){
        this.gc.clear();
    },
    build: function(){
        this.buildPlotsData();
    },
    create: function(){
        this.createAxes();
        this.createPlots();
        this.createDots();
    },
    buildPlotsData: function(){
        var self = this;
        this.tdata.series = [];
        for(var i=0;i<self.data.series.length;i++){
            this.tdata.series[i] = [];
            var data = self.data.series[i];
            for(var j = 0;j<data.length;j++){
                var x = self.context.getPixX(data.length,j);
                var y =  self.context.getPixY(self.context.getY(data,j));
                this.tdata.series[i][j] = [x, y];
            }
        }
    },
    createAxes:function(){
        var self      = this;
        var min       = self.context.getPixY(self.context.getMin());
        var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
        
        /*
         * YAxis
         */
        self.elements.axes[0]    = []; // 0 - yaxis, 1 - xaxis
        self.elements.axes[0][1] = []; // texts, ticks
        self.elements.axes[0][2] = []; // grid

        var yaxis = self.gc.path("");
        yaxis.attr(self.options.tickYAttr);
        yaxis.attr("path","M"+this.options.margin[3]+","+this.options.margin[0]+"L"+this.options.margin[3]+","+(this.context.getSize().height -this.options.margin[2]));
        self.elements.axes[0][0] = yaxis;

        for(var i=0;i<this.options.tickSize+1;i++){
            self.elements.axes[0][1][i] = [];
            
            //texts
            var y = this.context.getPixY(this.context.getTickY(i));
            var text = this.gc.text(10, threshold,this.context.formatTickY(i));
            text.attr(this.options.tickYAttr);
            text.attr("width", this.options.margin[3]);
            text.attr("text-anchor", "start");
            
            //tick
            var tick = this.gc.path("");
            tick.attr(self.options.tickYAttr);
            tick.attr("path","M"+this.options.margin[3]+","+threshold+"L"+(this.options.margin[3]-this.options.tickLength)+","+threshold);
            
            //grid
            var grid = this.gc.path("");
            grid.attr(self.options.gridYAttr);
            grid.attr("path","M"+this.options.margin[3]+","+threshold+"L"+(this.context.getSize().width-this.options.margin[1])+","+threshold);
            grid.hide();
            //save elements
            self.elements.axes[0][1][i][0] = text;
            self.elements.axes[0][1][i][1] = tick;
            self.elements.axes[0][2][i]    = grid;
        }

        /*
         * XAxis
         */
        self.elements.axes[1]    = [];
        self.elements.axes[1][1] = [];
        self.elements.axes[1][2] = [];

        var xaxis = this.gc.path("");
        xaxis.attr(self.options.tickXAttr);
        xaxis.attr("path","M"+this.options.margin[3]+","+(this.context.getSize().height - this.options.margin[2])+"L"+(this.context.getSize().width - this.options.margin[1])+","+(this.context.getSize().height - this.options.margin[2]));
        self.elements.axes[1][0] = yaxis;
        
        for(var i=0;i<this.data.categories.length;i++){
            self.elements.axes[1][1][i] = [];
            var x = this.context.getPixX(this.data.categories.length,i);

            var text = this.gc.text(this.options.margin[3],min+3*this.options.tickLength,this.context.getTickX(i));
            text.attr(this.options.tickXAttr);
            text.attr("text-anchor", "middle");
            
            var tick = this.gc.path("");
            tick.attr(self.options.tickXAttr);
            tick.attr("path","M"+this.options.margin[3]+","+min+"L"+this.options.margin[3]+","+(min+this.options.tickLength));
            
            var grid = this.gc.path("");
            grid.attr(self.options.gridXAttr);
            grid.attr("path","M"+this.options.margin[3]+","+this.options.margin[0]+"L"+this.options.margin[3]+","+min);
            grid.hide();

            //save elements
            self.elements.axes[1][1][i][0] = text;
            self.elements.axes[1][1][i][1] = tick;
            self.elements.axes[1][2][i]    = grid;
        }
    },
    createPlots:function(){
        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var data = self.tdata.series[i];
            var path = self.gc.path("");
            path.attr(self.options.lineAttr);
            path.attr("stroke", self.options.colors[i]);
            self.elements.series.push(path);
        }
    },
    createDots:function(){
        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var data = self.tdata.series[i];
            var dot = new Array();
            for(var j = 0;j<data.length;j++){
                var d = self.gc.circle(0, 0);
                d.attr(self.options.dotAttr);
                d.attr("stroke", self.options.bgAttr.fill);
                d.attr("fill", self.options.colors[i]);
                d.data("index",j);
                d.data("data", self.data.series[i]);
                dot.push(d);
            }
            self.elements.dots.push(dot);
        }
    },
    draw: function(){
        var self = this;
        self.drawAxes();
        self.drawBackground();
        setTimeout(function(){
            self.drawPlots();   
            self.drawDots();   
        },self.options.timing);
    },
    drawAxes: function(){
        var self = this;
        var minY = self.context.getPixY(self.context.getMin());

        /*
         * YAxis
         */
        for(var i=0;i<this.elements.axes[0][1].length;i++){
            var y = this.context.getPixY(this.context.getTickY(i));
            var text = this.elements.axes[0][1][i][0];
            text.animate({"y":y}, self.options.timing);
            //text.attr({"y":y});

            var tick = this.elements.axes[0][1][i][1];
            tick.animate({"path":"M"+this.options.margin[3]+","+y+"L"+(this.options.margin[3]-this.options.tickLength)+","+y}, self.options.timing);
            //path.attr({"path":"M"+this.options.margin[3]+","+y+"L"+(this.options.margin[3]-this.options.tickLength)+","+y});
            
            var grid = this.elements.axes[0][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.animate({"path":"M"+this.options.margin[3]+","+y+"L"+(this.context.getSize().width-this.options.margin[1])+","+y}, self.options.timing);
                //path.attr({"path":"M"+this.options.margin[3]+","+y+"L"+(this.context.getSize().w-this.options.margin[1])+","+y});
            }
        }

        /*
         * XAxis
         */
        for(var i=0;i<this.data.categories.length;i++){
            var x = this.context.getPixX(this.data.categories.length,i);

            var text = this.elements.axes[1][1][i][0];
            text.animate({"x":x}, self.options.timing);
            //text.attr({"x":x});

            var tick = this.elements.axes[1][1][i][1];
            tick.animate({"path":"M"+x+","+minY+"L"+x+","+(minY+this.options.tickLength)}, self.options.timing);
            //path.attr({"path":"M"+x+","+minY+"L"+x+","+(minY+this.options.tickLength)});
            
            var grid = this.elements.axes[1][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.animate({"path":"M"+x+","+this.options.margin[0]+"L"+x+","+minY}, self.options.timing);  
                //path.attr({"path":"M"+x+","+this.options.margin[0]+"L"+x+","+minY});  
            }
        }
    },
    drawBackground: function(){
        var self  = this;
        var minY  = this.context.getPixY(this.context.getMin());
        var left  = self.options.margin[3];
        var right = self.context.getSize().width - self.options.margin[1];
        
        var bg = this.gc.rect(0, 0, this.context.getSize().width, this.context.getSize().height);
        bg.toBack();
        bg.attr(self.options.bgAttr);

        if(this.options.showTracker){
            var tracker = this.gc.path("");
            tracker.attr(self.options.trackerAttr);
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

            if(self.options.showTracker){
                els = self.getDots(0, offsetX);
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
                    if(self.options.showTracker){
                        //tracker.attr("path","M"+offsetX+","+self.options.margin[0]+"L"+offsetX+","+minY); 
                    }
                }
            }else{
                self.clearTips();
            }
        });

    },
    drawPlots: function(){
        var self = this;
        var min = self.context.getPixY(self.context.getMin());
        var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
        var w = this.context.getSize().width;
        var h = this.context.getSize().height;

        for(var i=0;i<self.tdata.series.length;i++){
            var path = self.elements.series[i];
            var dot = self.elements.dots[i];
            var data = self.tdata.series[i];
            var pathStart, pathEnd;
            for(var j=0;j<data.length;j++){
                var x = data[j][0], y = data[j][1];
                if(j==0){
                    pathStart  = "M"+x+","+threshold;
                    pathEnd = "M"+x+","+y;
                }else{
                    var x1 = data[j-1][0], y1 = data[j-1][1];
                    var ix = (x - x1)/1.4;
                    pathStart  += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
                    pathEnd += "S"+(x1+ix)+","+y+" "+x+","+y;   
                }
            }
            path.attr("path", pathStart);
            path.animate({path:pathEnd}, self.options.timing,"<");
        }
    },
    drawDots: function(){
        var self = this;
        var min = self.context.getPixY(self.context.getMin());
        var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
        var w = this.context.getSize().width;
        var h = this.context.getSize().height;

        for(var i=0;i<self.tdata.series.length;i++){
            var dot = self.elements.dots[i];
            var data = self.tdata.series[i];
            for(var j=0;j<data.length;j++){
                var x = data[j][0], y = data[j][1];
                var d = dot[j];
                d.attr("cx",x);
                d.attr("cy",threshold);
                d.mouseover(function(){
                    this.animate(self.options.dotHoverAttr, self.options.dotTiming);
                    var box = this.getBBox();
                    self.drawTips((box.x+box.x2)/2, (box.y+box.y2)/2, [self.context.getTipText(this.data("data"), this.data("index"))]);
                }).mouseout(function(){
                    this.animate(self.options.dotAttr, self.options.dotTiming);
                });

                var y = data[j][1];
                d.animate({"cy":y}, self.options.timing, "<");
            }   
        }
    },
    drawTips: function (x, y, els) {
        var angle  = 5, indent = 6, padding = this.options.tipAttr.padding;
        var h = 2 * padding, w = h, maxWidth = 0; 

        x = Math.round(x) + indent;
        y = Math.round(y);

        var path = this.gc.path("");
        path.hide();
        path.attr(this.options.tipAttr);
        this.elements.tips.push(path);

        var texts = [];

        for(var i=0;i<els.length;i++){
            var text = this.gc.text(0, y, els[i]);
            text.hide();
            text.attr(this.options.tipAttr.textAttr);
            this.elements.tipTexts.push(text);
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
    
        var xa, tx, frame = this.context.getFrame();

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
    },
    clearTips: function(){
        for(var i=0;i<this.elements.tips.length;i++){
            this.elements.tips[i].remove();
        }
        for(var i=0;i<this.elements.tipTexts.length;i++){
            this.elements.tipTexts[i].remove();
        }
        this.elements.tips.splice(0);
        this.elements.tipTexts.splice(0);
    }
}

/*
 * Line Chart 
 */
function LineRender(){
    extend(LineRender.prototype, Render.prototype);
}

/*
 * Area Chart 
 */
function AreaRender(){
    extend(AreaRender.prototype, Render.prototype);
    extend(AreaRender.prototype, {
            drawPlots: function(){
                var self = this;
                var min = self.context.getPixY(self.context.getMin());
                var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
                
                var w = this.context.getSize().width;
                var h = this.context.getSize().height;

                for(var i=0;i<self.tdata.series.length;i++){
                    var path = self.elements.series[i];
                    var dot = self.elements.dots[i];
                    var data = self.tdata.series[i];
                    var pathStart, pathEnd;

                    var x0 = data[0][0], y0 = data[0][1];
                    for(var j=0;j<data.length;j++){
                        var x = data[j][0], y = data[j][1];
                        if(j==0){
                            pathStart  = "M"+x+","+threshold+"L"+x+","+threshold;
                            pathEnd    = "M"+x+","+threshold+"L"+x+","+y;
                        }else{
                            var x1 = data[j-1][0], y1 = data[j-1][1];
                            var ix = (x - x1)/1.4;
                            pathStart  += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
                            pathEnd += "S"+(x1+ix)+","+y+" "+x+","+y;   

                            if(j == data.length - 1){
                                pathStart  += "L"+x+","+threshold+"Z"+x+","+threshold;
                                pathEnd    += "L"+x+","+threshold+"Z"+x0+","+threshold;
                            }
                        }
                    }
                    path.attr("fill", path.attr("stroke"));
                    path.attr("fill-opacity", path.attr("opacity")/2);
                    path.attr("path", pathStart);
                    path.animate({path:pathEnd}, self.options.timing,"<");
                }
            }
        }
    );
}

/*
 * Column Chart 
 */
function ColumnRender(){}
ColumnRender.prototype = {
    buildPlotsData: function(){
        var self = this;
        this.tdata.series = [];
        for(var i=0;i<self.data.series.length;i++){
            this.tdata.series[i] = [];
            var data = self.data.series[i];
            for(var j = 0;j<data.length;j++){
                var x = self.context.getPixX(data.length,j);
                var y =  self.context.getPixY(self.context.getY(data,j));
                this.tdata.series[i][j] = [x, y];
            }
        }
    },
    drawPlots: function(){
        var self = this;
        var min = self.context.getPixY(self.context.getMin());
        var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
        
        var w = this.context.getSize().width;
        var h = this.context.getSize().height;

        for(var i=0;i<self.tdata.series.length;i++){
            var path = self.elements.series[i];
            var dot = self.elements.dots[i];
            var data = self.tdata.series[i];
            var pathStart, pathEnd;
            for(var j=0;j<data.length;j++){
                var x = data[j][0], y = data[j][1];
                if(j==0){
                    pathStart  = "M"+x+","+threshold;
                    pathEnd = "M"+x+","+y;
                }else{
                    var x1 = data[j-1][0], y1 = data[j-1][1];
                    var ix = (x - x1)/1.4;
                    pathStart  += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
                    pathEnd += "S"+(x1+ix)+","+y+" "+x+","+y;   
                }
            }
            path.attr("path", pathStart);
            path.animate({path:pathEnd}, self.options.timing,"<");
        }
    }
}
extend(ColumnRender.prototype, Render.prototype);

/*
 * utils
 */
function extend(){
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
                if ( target === copy ) {continue;}
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
