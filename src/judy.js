
var Chart = function(container, type, data, options){
    this.options = {
        title:"",
        margin:[60,20,40,80],
        showTracker:true,
        showGrid:true,
        stacked:false,
        threshold: null,
        tickSize:10,
        tickLength:5,
        tickInterval: null,
        tickFixed:2,
        colors:[
          ["#1ba5b2"],
          ["#cd2642"],
          ["#84ad29"]
        ],
        animationType:"<",
        timing:500,
        dotTiming:100,
        formatX: null,
        formatY: null,
        getY: null,
        getTickY: null,
        formatTickY: null,
        getTickX: null,
        formatTickX: null,
        getTip:null,
        titleAttr:{
            "font-weight":"bold",
            "font-size":14
        },
        bgAttr:{
           fill:"#ffffff",
           "stroke-width":0
        },
        trackerAttr:{
            "stroke-width":1,
            "opacity":0.5,
            "fill":"#666666"
        },
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
        tipAttr:{
          "stroke-width":2,
          "opacity":0.8,
          "fill":"#f4f4f4",
          "stroke":"#666666",
          "padding":10,
          "textAttr":{
            "font-size":12,
            "fill":"#000000",
            "opacity":1,
            "text-anchor":"start"
          }
        },
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
          "r":4,
          "opacity":1
        },
        dotHoverAttr:{
          "stroke-width":2,
          "r":5,
          "opacity":1
        },
        legendAttr:{
        }
    };

    return this.init(container, type, data, options);
}

Chart.prototype = {
    init:function(container, type, data, options){
        this.elements = {
            series:[],
            ticks:[[[],[]],[[],[]]], 
            markers:[]     
        }
        this.setContainer(container);
        this.setOptions(options);
        this.setType(type);
        this.setData(data);
        this.setSize({width: this.options.width, height: this.options.height});
        this.setFrame();
        this.setMax();
        this.setMin();
        this.gc = Raphael(this.container, this.options.width, this.options.height);
        return this;
    },
    setContainer: function(container){
        this.container = container;
    },
    setOptions: function(options){
        extend(this.options, options);
        if(this.options.width == undefined){
            this.options.width = this.container.clientWidth;
        }
        if(this.options.height == undefined){
            this.options.height = this.container.clientHeight;
        }
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
        this.setRender(new Render());
    },
    setRender: function (render) {
        this.render = render;
    },
    setData: function (data) {
        this.data = data;
    },
    setFrame: function(){
        var size   = this.getSize();
        this.frame = {x:this.options.margin[3], y:this.options.margin[0], width:(size.width - this.options.margin[1] - this.options.margin[3]), height:(size.height - this.options.margin[0] - this.options.margin[2])}
    },
    getFrame: function(){
        return this.frame;
    },
    setMax: function(){
        var max;
        if(this.options.stacked){
            for(var j=0;j<this.data.series[0].length;j++){
                var _max;
                for(var i=0;i<this.data.series.length;i++){
                    var y = this.getY(this.data.series[i], j);
                    if(i==0){
                        _max = y;
                    }else{
                        _max += y;
                    }
                }
                if(j==0){
                    max = _max;
                }else{
                    if(_max > max)
                        max = _max;
                }
            }
        }else{
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
        }
        this.max = max;
    },
    getMax: function(){
        return this.options.getMax != undefined ? this.options.getMax() : this.max;
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
        return this.min = min;
    },
    getMin: function(){
        return this.options.getMin != undefined?this.options.getMin():this.min;
    },
    getPixX: function(count, i, j){
        var frame = this.getFrame(), iw = frame.width/(count-1), px = frame.x + i*iw;
        if(j == 1){
            iw = frame.width/(count); 
            px = frame.x + i*iw + iw/2;
        }
        return px;
    },
    getPixY: function(y){
        return this.getFrame().height * (1-(y-this.getMin())/(this.getMax()-this.getMin())) + this.getFrame().y;
    },
    getY: function(data,i){
        return this.options.getY != undefined?this.options.getY(data, i):data[i];
    },
    getTickY: function(i){
        var max = this.getMax(), min = this.getMin();
        var interval = (max - min)/this.options.tickSize;
        var tickVal  = decimal(min + interval*i, this.options.tickFixed);
        return this.options.getTickY != undefined ? this.options.getTickY(tickVal,i) : tickVal;
    },
    formatTickY: function(i){
        return this.options.formatTickY != undefined ? this.options.formatTickY(this.getTickY(i),i) : this.getTickY(i);
    },
    getTickX: function(i){
        return this.options.getTickX != undefined ? this.options.getTickX(this.data.categories[i],i) : this.data.categories[i];
    },
    formatTickX: function(i){
        return this.options.formatTickX != undefined ? this.options.formatTickX(this.getTickX(i),i) : this.getTickX(i);
    },
    getTip: function(data, i, j){
        return this.options.getTip != undefined ? this.options.getTip(data,i) : this.data.legends[i]+":"+data[j];
    },
    getThreshold: function(){
        return (this.options.threshold != null) ? this.getPixY(this.options.threshold) : this.getPixY(this.getMin());
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
        this.draw();
    },
    init: function(){
        //transformed data
        this.clear();
        this.tdata = {};
        this.elements = {
            axes:[],
            series:[], 
            markers: [],
            tooltips: [],
            tipTexts:[],
            legends:[[],[]]
        };
    },
    clear:function(){
        this.gc.clear();
    },
    build: function(){
        this.buildTitle();
        this.buildLegends();
        this.buildAxes();
        this.buildPlots();
        this.buildMarkers();
    },
    buildTitle: function(){
        this.createTitle();
    },
    buildLegends: function(){
        this.createLegends();
    },
    buildAxes: function(){
        this.createAxes();
    },
    buildPlots: function(){
        this.buildPlotsData();
        this.createPlots();
    },
    buildMarkers:function(){
        this.createMarkers();
    },
    draw: function(){
        var self = this;
        self.drawTitle();
        self.drawLegends();
        self.drawAxes();
        self.drawBackground();
        if(!this.isRedraw){
            setTimeout(function(){
                self.drawPlots();   
                self.drawMarkers();   
            },self.options.timing);
        }else{
            self.buildPlots();  
            self.drawPlots(); 
            self.buildMarkers(); 
            self.drawMarkers();   
        }
    },
    redraw: function(){
        this.isRedraw = true;
        this.draw();
    },
    buildPlotsData: function(){
        var self = this;
        this.tdata.series = [];
        for(var i=0;i<self.data.series.length;i++){
            var hidden = self.isHidden(i);
            if(!hidden){
                var serie = [];
                this.tdata.series.push(serie);
                var data = self.data.series[i];
                for(var j = 0;j<data.length;j++){
                    var x = self.context.getPixX(data.length, j, this.align);
                    var y =  self.context.getPixY(self.context.getY(data,j));
                    serie[j] = [x, y];
                }
            }
        }
    },
    createTitle: function(){
        var self = this;
        var frame = self.context.getFrame();
        var x =frame.x, y= 10;
        var text = self.gc.text(x, y);
        text.attr(self.options.titleAttr);
        text.attr("text-anchor", "start");
        text.attr("text", self.options.title);
    },
    createLegends: function(){
        var self = this;
        var frame = self.context.getFrame();
        var x =frame.x, y= frame.y - 20, margin = [10, 15];
        for(var i=0;i<self.data.legends.length;i++){
            var title = self.data.legends[i];
            //compute x
            if(i>0){
                x = margin[1]+self.elements.legends[1][i-1].getBBox().x + self.elements.legends[1][i-1].getBBox().width;
            }
            //create plot for legend
            var circle = self.gc.circle(x, y);
            circle.attr("stroke", self.options.colors[i]);
            circle.attr("fill", self.options.colors[i]);
            circle.attr("r", "5");
            //create text for legend
            var text = self.gc.text(x+margin[0], y);
            text.attr(self.options.legendAttr);
            text.attr("width", frame.x);
            text.attr("text-anchor", "start");
            text.attr("cursor", "pointer");
            text.attr("text", title);
            text.data("i", i);
            //bind click event to text element
            text.click(function(){
                var hidden = this.data("hidden");
                if(hidden){
                    self.elements.legends[0][this.data("i")].attr("opacity","1");
                    this.data("hidden", false);
                }else{
                    self.elements.legends[0][this.data("i")].attr("opacity","0.4");
                    this.data("hidden", true);
                }
                self.redraw();
            });
            //save elements
            self.elements.legends[0].push(circle);
            self.elements.legends[1].push(text);
        }
    },
    createAxes:function(){
        var self      = this;
        var min       = self.context.getPixY(self.context.getMin());
        var threshold = (self.context.options.threshold!=null)?self.context.getPixY(self.context.options.threshold):min;
        var frame     = this.context.getFrame();

        //YAxis
        self.elements.axes[0]    = []; // 0 - yaxis, 1 - xaxis
        self.elements.axes[0][1] = []; // texts, ticks
        self.elements.axes[0][2] = []; // grid

        var yaxis = self.gc.path("");
        yaxis.attr(self.options.tickYAttr);
        yaxis.attr("path","M"+frame.x+","+frame.y+"L"+frame.x+","+(frame.y+frame.height));
        self.elements.axes[0][0] = yaxis;

        for(var i=0;i<this.options.tickSize+1;i++){
            self.elements.axes[0][1][i] = [];
            
            //texts
            var y = this.context.getPixY(this.context.getTickY(i));
            var text = this.gc.text(10, threshold,this.context.formatTickY(i));
            text.attr(this.options.tickYAttr);
            text.attr("width", frame.x);
            text.attr("text-anchor", "start");
            
            //tick
            var tick = this.gc.path("");
            tick.attr(self.options.tickYAttr);
            tick.attr("path","M"+frame.x+","+threshold+"L"+(frame.x-this.options.tickLength)+","+threshold);
            
            //grid
            var grid = this.gc.path("");
            grid.attr(self.options.gridYAttr);
            grid.attr("path","M"+frame.x+","+threshold+"L"+(frame.width+frame.x)+","+threshold);
            grid.hide();
            //save elements
            self.elements.axes[0][1][i][0] = text;
            self.elements.axes[0][1][i][1] = tick;
            self.elements.axes[0][2][i]    = grid;
        }

        //XAxis
        self.elements.axes[1] = [], self.elements.axes[1][1] = [], self.elements.axes[1][2] = [];

        var xaxis = this.gc.path("");
        xaxis.attr(self.options.tickXAttr);
        xaxis.attr("path","M"+frame.x+","+(frame.y+frame.height)+"L"+(frame.x+frame.width)+","+(frame.y+frame.height));
        self.elements.axes[1][0] = yaxis;
        
        for(var i=0;i<this.data.categories.length;i++){
            self.elements.axes[1][1][i] = [];
            
            var text = this.gc.text(frame.x, min+3*this.options.tickLength,this.context.getTickX(i));
            text.attr(this.options.tickXAttr);
            text.attr("text-anchor", "middle");
            
            var tick = this.gc.path("");
            tick.attr(self.options.tickXAttr);
            tick.attr("path","M"+frame.x+","+min+"L"+frame.x+","+(min+this.options.tickLength));

            var grid = this.gc.path("");
            grid.attr(self.options.gridXAttr);
            grid.attr("path","M"+frame.x+","+frame.y+"L"+frame.x+","+min);
            grid.hide();

            //save elements
            self.elements.axes[1][1][i][0] = text;
            self.elements.axes[1][1][i][1] = tick;
            self.elements.axes[1][2][i]    = grid;
        }
    },
    createPlots:function(){
        var self = this;

        //clear plots
        for(var i=0;i<self.elements.series.length;i++){
            self.elements.series[i].remove();
        }
        self.elements.series.splice(0);

        for(var i=0;i<self.tdata.series.length;i++){
            var data = self.tdata.series[i];
            var path = self.gc.path("");
            path.attr(self.options.lineAttr);
            path.attr("stroke", self.options.colors[self.getIndex(i)]);
            self.elements.series.push(path);
        }
    },
    createMarkers:function(){
        var self = this;

        //clear markers
        for(var i=0;i<self.elements.markers.length;i++){
            var markers = self.elements.markers[i]
            for(var j=0;j<markers.length;j++){
                markers[j].remove();
            }
        }
        self.elements.markers.splice(0);

        for(var i=0;i<self.tdata.series.length;i++){
            var data = self.tdata.series[i];
            var dot  = new Array();
            for(var j = 0;j<data.length;j++){
                var d = self.gc.circle(0, 0);
                d.attr(self.options.dotAttr);
                d.attr("stroke", self.options.bgAttr.fill);
                d.attr("fill", self.options.colors[self.getIndex(i)]);
                d.data("i",i);
                d.data("j",j);
                d.data("data", self.data.series[i]);
                d.mouseover(function(){
                    this.animate(self.options.dotHoverAttr, self.options.dotTiming);
                    var box = this.getBBox();
                    self.drawTooltips((box.x+box.x2)/2, (box.y+box.y2)/2, [[this.data("data"), this.data("i"), this.data("j")]]);
                }).mouseout(function(){
                    this.animate(self.options.dotAttr, self.options.dotTiming);
                    self.clearTooltips();
                });
                dot.push(d);
            }
            self.elements.markers.push(dot);
        }
    },
    drawTitle: function(){

    },
    drawLegends: function(){

    },
    drawAxes: function(){
        var self = this;
        var minY = self.context.getPixY(self.context.getMin());
        var frame = this.context.getFrame();
        //YAxis
        for(var i=0;i<this.elements.axes[0][1].length;i++){
            var y    = this.context.getPixY(this.context.getTickY(i));
            var text = this.elements.axes[0][1][i][0];
            text.animate({"y":y}, self.options.timing);
            //text.attr({"y":y});

            var tick = this.elements.axes[0][1][i][1];
            tick.animate({"path":"M"+frame.x+","+y+"L"+(frame.x-this.options.tickLength)+","+y}, self.options.timing);
            //path.attr({"path":"M"+this.options.margin[3]+","+y+"L"+(this.options.margin[3]-this.options.tickLength)+","+y});
            
            var grid = this.elements.axes[0][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.animate({"path":"M"+frame.x+","+y+"L"+(frame.x+frame.width)+","+y}, self.options.timing);
                //path.attr({"path":"M"+this.options.margin[3]+","+y+"L"+(this.context.getSize().w-this.options.margin[1])+","+y});
            }
        }

        //XAxis
        for(var i=0;i<this.data.categories.length;i++){
            var x = this.context.getPixX(this.data.categories.length, i, this.align);

            var text = this.elements.axes[1][1][i][0];
            text.animate({"x":x}, self.options.timing);
            //text.attr({"x":x});

            var tick = this.elements.axes[1][1][i][1];
            tick.animate({"path":"M"+x+","+minY+"L"+x+","+(minY+this.options.tickLength)}, self.options.timing);
            //path.attr({"path":"M"+x+","+minY+"L"+x+","+(minY+this.options.tickLength)});
            
            var grid = this.elements.axes[1][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.animate({"path":"M"+x+","+frame.y+"L"+x+","+minY}, self.options.timing);  
                //path.attr({"path":"M"+x+","+this.options.margin[0]+"L"+x+","+minY});  
            }
        }
    },
    drawBackground: function(){
        var self  = this;
        var minY  = this.context.getPixY(this.context.getMin());
        var frame = this.context.getFrame();
        var bg    = this.gc.rect(0, 0, this.context.getSize().width, this.context.getSize().height);
        
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
                if (els[i].events != undefined) {
                    for(var j = 0;j < els[i].events.length; j++) {
                        if (els[i].events[j].name == 'mouseout') {
                            els[i].events[j].f.apply(els[i]);
                        }
                    }
                }
            }

            self.clearTooltips();
            if(self.options.showTracker){
                els = self.getMarkers(0, offsetX);
                //draw tips
                for(var i=0;i<els.length;i++){
                    for(var j = 0; j < els[i].events.length; j++) {
                        if (els[i].events[j].name == 'mouseover') {
                            els[i].events[j].f.apply(els[i]);
                        }
                    }
                }
                //draw tracker
                if(offsetX >= frame.x && offsetX <= frame.x+frame.width){
                    if(self.options.showTracker){
                        //tracker.attr("path","M"+offsetX+","+self.options.margin[0]+"L"+offsetX+","+minY); 
                    }
                }
            }
        });

    },
    drawPlots: function(){
        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var data   = self.tdata.series[i];
            var serie  = self.elements.series[i];
            for(var j=0;j<data.length;j++){
                var el = serie;
                if(serie.length){
                    el = serie[j];
                }
                self.drawPlot(el, self.tdata.series, i, j);
            }
        }
    },
    drawPlot: function(el, data, i, j){
        var self = this, data = data[i], x = data[j][0], y = data[j][1];
        var threshold = self.context.getThreshold();
        var pathStart = el.data("pathStart")==undefined?"":el.data("pathStart");
        var pathEnd   = el.data("pathEnd")==undefined?"":el.data("pathEnd");

        if(j==0){
            pathStart = "M"+x+","+threshold;
            pathEnd   = "M"+x+","+y;
        }else{
            var x1    = data[j-1][0], y1 = data[j-1][1];
            var ix    = (x - x1)/1.5;
            pathStart += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
            pathEnd   += "S"+(x1+ix)+","+y+" "+x+","+y;   
        }
        el.data("pathStart", pathStart);
        el.data("pathEnd", pathEnd);
        if(j == data.length-1){
            el.attr("path", pathStart);
            el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
        }
    },
    drawMarkers: function(){
        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var dot    = self.elements.markers[i];
            var data   = self.tdata.series[i];
            for(var j=0;j<data.length;j++){
                var el = dot[j];
                self.drawMarker(el, self.tdata.series, i, j);
            }   
        }
    },
    drawMarker:function(el, data, i, j){
        var self = this, data = data[i], x = data[j][0], y = data[j][1];
        var threshold = self.context.getThreshold();
        el.attr("cx",x);
        el.attr("cy",threshold);
        el.animate({"cy":y}, self.options.timing, self.options.animationType);
    },
    drawTooltips: function (x, y, els) {
        var index = els[0][1];
        var angle = 5, indent = 7, xcorner = ycorner = 10 , padding = this.options.tipAttr.padding;
        var h = 2 * padding, w = h, maxWidth = 0; 
        x = Math.round(x) + indent;
        y = Math.round(y);

        var path = this.gc.path("");
        path.attr(this.options.tipAttr);
        this.elements.tooltips.push(path);

        var texts = [];
        for(var i=0;i<els.length;i++){
            var el   = els[i];
            var tip  = this.context.getTip(el[0], el[1], el[2]);
            var text = this.gc.text(0, y, tip);
            text.attr(this.options.tipAttr.textAttr);
            texts.push(text);
            this.elements.tipTexts.push(texts);
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
        if(hh < angle + ycorner){
            xcorner = ycorner = hh-angle;
        }
    
        var xa, tx, frame = this.context.getFrame();
        //check if tip's frame is out of bounds
        if(x+angle+w > frame.x+frame.width){
            w  = -w;
            x  -= 2*indent;
            xa = x-angle;
            tx = xa + w + padding;
            xcorner = -xcorner;  
        }else{
            xa = x+angle;
            tx = xa+padding;
        }

        var p = "M"+x+","+y+"L"+xa+","+(y-angle);
        p += "L"+xa+","+(y-hh+ycorner);
        p += "C"+xa+","+(y-hh)+" "+xa+","+(y-hh)+" "+(xa+xcorner)+","+(y-hh);
        p += "L"+(xa+w-xcorner)+","+(y-hh);
        p += "C"+(xa+w)+","+(y-hh)+" "+(xa+w)+","+(y-hh)+" "+(xa+w)+","+(y-hh+ycorner);
        p += "L"+(xa+w)+","+(y+hh-ycorner);
        p += "C"+(xa+w)+","+(y+hh)+" "+(xa+w)+","+(y+hh)+" "+(xa+w-xcorner)+","+(y+hh);
        p += "L"+(xa+xcorner)+","+(y+hh);
        p += "C"+xa+","+(y+hh)+" "+xa+","+(y+hh)+" "+xa+","+(y+hh-ycorner);
        p += "L"+xa+","+(y+angle);
        p += "L"+x+","+y;
        path.attr("path",p);

        for(var i=0;i<texts.length;i++){
            texts[i].attr("x",tx);
        }
    },
    clearTooltips: function(){
        for(var i=0;i<this.elements.tooltips.length;i++){
            this.elements.tooltips[i].remove();
            for(var j = 0; j< this.elements.tipTexts[i].length;j++){
                this.elements.tipTexts[i][j].remove();
            }
        }
        this.elements.tooltips.splice(0);
        this.elements.tipTexts.splice(0);
    },
    getMarkers:function(type, pos1, pos2){
        var els = [];
        //vertical
        if(type == 0){
            for(var i=0;i<this.elements.markers.length;i++){
                var markers = this.elements.markers[i];
                for(var j=0;j<markers.length;j++){
                    var el = markers[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2){
                        els.push(el);
                    }
                }
            }
        }

        //point
        if(type == 3){
            for(var i=0;i<this.elements.markers.length;i++){
                var markers = this.elements.markers[i];
                for(var j=0;j<markers.length;j++){
                    var el = markers[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2 && pos2 >= box.y && pos2 <= box.y2){
                        els.push(el);
                    }
                }
            }
        }
        return els;
    },
    isHidden: function(i){
        var legend = this.elements.legends[1][i];
        return legend.data("hidden") == undefined?false:legend.data("hidden");
    },
    getIndex: function(index){
        var pos = -1;
        for(var i=0;i<this.elements.legends[1].length;i++){
            var legend = this.elements.legends[1][i];
            if(!legend.data("hidden")){
                pos ++;
            }
            if(pos == index){
                pos = i;
                break;
            }
        }
        return pos;
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

    this.drawPlot = function(el, data, i, j){
        data = data[i];
        var self = this, x = data[j][0], y = data[j][1];
        var threshold = self.context.getThreshold();
        var pathStart = el.data("pathStart")==undefined?"":el.data("pathStart");
        var pathEnd   = el.data("pathEnd")==undefined?"":el.data("pathEnd");
        if(j==0){
            pathStart  = "M"+x+","+threshold;
            pathEnd = "M"+x+","+y;
        }else{
            var x0    = data[0][0], y0 = data[0][1];
            var x1    = data[j-1][0], y1 = data[j-1][1];
            var ix    = (x - x1)/1.4;
            pathStart += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
            pathEnd   += "S"+(x1+ix)+","+y+" "+x+","+y;   

            if(j == data.length - 1){
                pathStart += "L"+x+","+threshold+"L"+x+","+threshold+"L"+x0+","+threshold+"Z"+x0+","+threshold;
                pathEnd   += "L"+x+","+y+"L"+x+","+threshold+"L"+x0+","+threshold+"Z"+x0+","+y;
            }
        }
        el.data("pathStart", pathStart);
        el.data("pathEnd", pathEnd);

        if(j == data.length-1){
            el.attr("fill", el.attr("stroke"));
            el.attr("fill-opacity", el.attr("opacity")/2);
            el.attr("path", pathStart);
            el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
        }
    } 
}


/*
 * Column Chart 
 */
function ColumnRender(){
    extend(ColumnRender.prototype, Render.prototype);
    this.align = 1;
    this.createPlots = function(){
        var self = this;

        //clear markers
        for(var i=0;i<self.elements.series.length;i++){
            var serie = self.elements.series[i]
            for(var j=0;j<serie.length;j++){
                serie[j].remove();
            }
        }
        self.elements.series.splice(0);

        for(var i=0;i<self.tdata.series.length;i++){
            self.elements.series[i] = [];
            var data = self.tdata.series[i];
            for(var j=0;j<data.length;j++){
                var path = self.gc.path("");
                path.attr(self.options.lineAttr);
                path.attr("stroke", self.options.colors[self.getIndex(i)]);
                self.elements.series[i].push(path);
            }
        }
    }

    this.drawPlot = function(el, data, i, j){
        el.mouseover(function(){
            var dot = self.elements.markers[this.data("i")][this.data("j")];
            for(var e in dot.events){
                if (dot.events[e].name == 'mouseover') {
                    dot.events[e].f.apply(dot);
                }
            }
        }).mouseout(function(){
            var dot = self.elements.markers[this.data("i")][this.data("j")];
            for(var e in dot.events){
                if (dot.events[e].name == 'mouseout') {
                    dot.events[e].f.apply(dot);
                }
            }
        });

        el.attr("fill", el.attr("stroke"));
        el.attr("fill-opacity", el.attr("opacity"));
        el.data("i",i);
        el.data("j",j);

        var self    = this;
        var frame   = this.context.getFrame();
        var base    = self.context.getThreshold();
        var w       = (self.tdata.series[0][0][0] - frame.x)*2;
        var padding = w/5;
        var iw      = (w-2*padding)/self.tdata.series.length;
        var ix      = data[i][j][0] - w/2 + padding + iw*i, y = data[i][j][1];
        var pathStart = "M"+ix+","+base+"L"+ix+","+base+"L"+(ix+iw)+","+base+"L"+(ix+iw)+","+base+"Z";
        var pathEnd   = "M"+ix+","+base+"L"+ix+","+y+"L"+(ix+iw)+","+y+"L"+(ix+iw)+","+base+"Z";

        if(self.context.options.stacked){
            iw = w-2*padding;
            ix = data[i][j][0] - w/2 + padding;
            if(i>0){
                var baseNew = base; 
                for(var ii=0;ii<i;ii++){
                    var dis = base - data[ii][j][1]
                    baseNew  -= dis, y -= dis;
                }
                base = baseNew;
            }
            pathStart = "M"+ix+","+base+"L"+ix+","+base+"L"+(ix+iw)+","+base+"L"+(ix+iw)+","+base+"Z";
            pathEnd   = "M"+ix+","+base+"L"+ix+","+y+"L"+(ix+iw)+","+y+"L"+(ix+iw)+","+base+"Z";
        }
        
        el.attr("path", pathStart);
        el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
    }
    
    this.drawMarker = function(el, data, i, j){
        var self = this;
        var frame = this.context.getFrame();
        var base = self.context.getThreshold();
        var w    = (self.tdata.series[0][0][0] - frame.x)*2;
        var padding = w/5;
        var iw   = (w-2*padding)/self.tdata.series.length;
        var ix   = data[i][j][0] - w/2 + padding + iw*i + iw/2, y = data[i][j][1];

        if(self.options.stacked){
            iw = w-2*padding;
            ix = data[i][j][0];

            if(i>0){
                for(var ii=0;ii<i;ii++){
                    var dis = base - data[ii][j][1]
                    y -= dis;
                }
            }
        }
        var dot = self.elements.markers[i][j];
        dot.attr("cx",ix);
        dot.attr("cy",base);
        dot.animate({"cy":y}, self.options.timing, self.options.animationType);
    }
}

/*
 * utils
 */
function extend(){
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
    if ( typeof target === "boolean" ) {
        deep = target, target = arguments[1] || {}, i = 2;
    }
    if ( typeof target !== "object" && !this.isFunction(target)) target = {};
    if ( length === i ) {
        target = this, --i;
    }
    for ( ; i < length; i++ ) {
        if ( (options = arguments[i]) != null ) {
            for ( name in options ) {
                src = target[name], copy = options[name];
                if ( target === copy ) {
                    continue;
                }
                if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false, clone = src && this.isArray(src) ? src : [];
                    } else {
                        clone = src && this.isPlainObject(src) ? src : {};
                    }
                    target[name] = this.extend( deep, clone, copy );
                } else if ( copy !== undefined ) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}

function decimal(val, position) {
    var f = parseFloat(val);
    if (isNaN(f)) return false;
    var f = Math.round(f*100)/100, s = f.toString(), pos = s.indexOf('.');
    if (pos < 0) {
        pos = s.length, s += '.';
    }
    while (s.length <= pos + position) {
        s += '0'
    }
    return s;
}
