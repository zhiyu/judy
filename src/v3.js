/*
 * v3 charting library
 */

//Utils
var utils = {
    isFunction: function( obj ) {
        return typeof obj === "function";
    },
    isArray: Array.isArray || function( obj ) {
        return typeof obj === "array";
    },
    isPlainObject: function( obj ) {
        if ( !obj || typeof obj !== "object" || obj.nodeType) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for ( key in obj ) {}

        return key === undefined || hasOwn.call( obj, key );
    },
    extend : function(){
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !this.isFunction(target)) {
            target = {};
        }
        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];
                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && this.isArray(src) ? src : [];
                        } else {
                            clone = src && this.isPlainObject(src) ? src : {};
                        }
                        // Never move original objects, clone them
                        target[ name ] = this.extend( deep, clone, copy );
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        return target;
    }
}    


/*
 *  Chart
 */
function Chart(id,data,options){
    this.init(id,data,options);
}

Chart.prototype = {
    init:function(id,data,options){
        this.properties = {};
        this.options    = {
            margin:[60,60,60,60]
        }
        utils.extend(this.options,options);
        this.container  = d3.select(id).append('svg:svg');
        this.chart      = this.container.append('svg:g');
        this.data       = data;

        this.set("wrapperWidth", parseInt(d3.select(id).attr('width')));
        this.set("wrapperHeight", parseInt(d3.select(id).attr('height')));
        this.container.attr("width",this.get("wrapperWidth"));
        this.container.attr("height",this.get("wrapperHeight"));
        
        var top=this.options.margin[0],right=this.options.margin[1],bottom=this.options.margin[2],left=this.options.margin[3];

        this.width  = this.get("wrapperWidth")-left-right;
        this.height = this.get("wrapperHeight")-top-bottom;

        this.max    = this.max();
        this.min    = this.min();

        if(this.options.margin){
            this.chart.attr('transform', "translate("+left+","+top+")");
        }

        this.render = this.getRender();
    },
    getRender:function(){
        eval("var Render = "+this.options.type+"Chart");
        var render =  new Render();
        render.context = this;
        return render;
    },
    draw:function(){
        this.render.draw();
    },
    get:function(key){
        return this.properties[key];
    },
    set:function(key, val){
        this.properties[key] = val;
    },
    x:function(){
        if(this.options.axisInverted == true)
            return d3.scale.linear().domain([this.min, this.max]).range([0,this.width]);    
        else
            return d3.scale.linear().domain([0, this.data.category.length-1]).range([0, this.width]);
    },
    y:function(){
        if(this.options.axisInverted == true)
            return d3.scale.linear().domain([0,this.data.category.length-1]).range([this.height,0]);    
        else
            return d3.scale.linear().domain([this.min, this.max]).range([this.height, 0]);    
    },
    count:function(){
        return this.data.length;
    },
    max:function(){
        if(this.data){
            var max = this.data.series[0][0].val;
            for(var i = 0;i < this.data.series.length;i++){
                for(var j = 0;j < this.data.series[i].length;j++){
                    if(this.data.series[i][j].val > max){
                        max = this.data.series[i][j].val;
                    }
                }
            }
            return max;
        }else{
            return 0;
        }
    },
    min:function(){
        if(this.data){
            var min = this.data.series[0][0].val;
            for(var i = 0;i < this.data.series.length;i++){
                for(var j = 0;j < this.data.series[i].length;j++){
                    if(this.data.series[i][j].val < min){
                        min = this.data.series[i][j].val;
                    }
                }
            }
            return min;
        }else{
            return 0;
        }
    }
}

/*
 *  Line Chart
 */
function LineChart(){}
LineChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        
        var scale = this.context.x();
        var ticksData = scale.ticks(data.category.length);
        var textFunc = function(d,i){
            return data.category[i];
        };
        var originFunc = function(d,i){
            return "translate(0,0)";
        };
        var transFunc = function(d,i) {
            return "translate("+scale(d)+",0)";
        };
        //invert axis
        if(this.context.options.axisInverted == true){
            ticksData = scale.ticks(10);
            textFunc = function(d,i) {
                return d;
            }
        }

        var ticks =  this.context.chart.selectAll('.tickx').data(ticksData).enter().append('svg:g');
        ticks.attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(textFunc).attr('y', h).attr('dy', 15).attr('dx', -2);

        if(this.context.options.axisInverted==true){
            ticks.attr("transform",originFunc); 
            ticks.transition().duration(500).ease("linear").attr('transform',transFunc);   
        }else{
            ticks.attr("transform",transFunc); 
        }
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.context.width;

        var scale = this.context.y();
        var ticksData = scale.ticks(10);
        var textFunc = function(d,i){
            return d;
        };
        var originFunc = function(d,i){
            return "translate(0, " + scale(self.context.min) + ")";
        };
        var transFunc = function(d,i) {
          return "translate(0, " + scale(d) + ")";
        };
        //invert axis
        if(this.context.options.axisInverted == true){
            ticksData = scale.ticks(data.category.length);
            textFunc = function(d,i){
                return data.category[i];
            };
        }

        ticks =  this.context.chart.selectAll('.ticky').data(ticksData).enter().append('svg:g');
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(textFunc).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);
        ticks.attr('class', 'ticky');

        if(this.context.options.axisInverted==true){
            ticks.attr("transform",transFunc); 
        }else{
            ticks.attr("transform",originFunc); 
            ticks.transition().duration(500).ease("linear").attr('transform',transFunc);   
        }
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            var line = this.context.chart.selectAll('line'+i).data([data.series[i]]).enter().append("svg:path");
            line.attr("d", d3.svg.line().interpolate("monotone").x(function(d, i) {
                if(self.context.options.axisInverted==true)
                    return self.context.x()(d.val);
                else
                    return self.context.x()(i);
            }).y(function(d,i){
                if(self.context.options.axisInverted==true)
                    return self.context.y()(i);
                else
                    return self.context.y()(d.val);    
            })).attr("class","line").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
                if(self.context.options.axisInverted==true)
                    return self.context.x()(d.val);
                else
                    return self.context.x()(i);
            }).attr("cy", function(d,i) {
                if(self.context.options.axisInverted==true)
                    return self.context.y()(i);
                else
                    return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

/*
 *  Area Chart
 */
function AreaChart(){}
AreaChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        
        var scale = this.context.x();
        var ticksData = scale.ticks(data.category.length);
        var textFunc = function(d,i){
            return data.category[i];
        };
        var originFunc = function(d,i){
            return "translate(0,0)";
        };
        var transFunc = function(d,i) {
            return "translate("+scale(d)+",0)";
        };
        //invert axis
        if(this.context.options.axisInverted == true){
            ticksData = scale.ticks(10);
            textFunc = function(d,i) {
                return d;
            }
        }

        var ticks =  this.context.chart.selectAll('.tickx').data(ticksData).enter().append('svg:g');
        ticks.attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(textFunc).attr('y', h).attr('dy', 15).attr('dx', -2);

        if(this.context.options.axisInverted==true){
            ticks.attr("transform",originFunc); 
            ticks.transition().duration(500).ease("linear").attr('transform',transFunc);   
        }else{
            ticks.attr("transform",transFunc); 
        }
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.context.width;

        var scale = this.context.y();
        var ticksData = scale.ticks(10);
        var textFunc = function(d,i){
            return d;
        };
        var originFunc = function(d,i){
            return "translate(0, " + scale(self.context.min) + ")";
        };
        var transFunc = function(d,i) {
          return "translate(0, " + scale(d) + ")";
        };
        //invert axis
        if(this.context.options.axisInverted == true){
            ticksData = scale.ticks(data.category.length);
            textFunc = function(d,i){
                return data.category[i];
            };
        }

        ticks =  this.context.chart.selectAll('.ticky').data(ticksData).enter().append('svg:g');
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(textFunc).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);
        ticks.attr('class', 'ticky');

        if(this.context.options.axisInverted==true){
            ticks.attr("transform",transFunc); 
        }else{
            ticks.attr("transform",originFunc); 
            ticks.transition().duration(500).ease("linear").attr('transform',transFunc);   
        }
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;
        
        for(var i=0;i<data.series.length;i++){
            var area = this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path");
            if(self.context.options.axisInverted==true){
                area.attr("d", d3.svg.area().interpolate("monotone").y(function(d, i) {
                    return self.context.y()(i);
                }).x0(function(){
                    return 0;
                }).x1(function(d,i){
                        return self.context.x()(d.val);
                })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
            }else{
                area.attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
                        return self.context.x()(i);
                }).y0(function(){
                    return self.context.height;
                }).y1(function(d,i){
                        return self.context.y()(d.val);    
                })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
            
            }
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
                if(self.context.options.axisInverted==true)
                    return self.context.x()(d.val);
                else
                    return self.context.x()(i);
            }).attr("cy", function(d,i) {
                if(self.context.options.axisInverted==true)
                    return self.context.y()(i);
                else
                    return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

/*
 *  Stack Area Chart
 */
function StackAreaChart(){}
StackAreaChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        var ticks =  this.context.chart.selectAll('.tickx').data(this.context.x().ticks(data.category.length)).enter().append('svg:g').attr('transform', 
            function(d, i) {
                return "translate(" + (self.context.x()(i)) + ", 0)";
            }).attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(function(d, i) {
          return data.category[i];
        }).attr('y', h).attr('dy', 15).attr('dx', -2);
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.width;
        
        ticks =  this.context.chart.selectAll('.ticky').data(this.context.y().ticks(10)).enter().append('svg:g').attr('class', 'ticky').attr("transform","translate(0, " + self.context.y()(this.min) + ")");    
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(function(d) {
          return d;
        }).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);

        ticks.transition().duration(500).ease("linear").attr('transform', function(d) {
          return "translate(0, " + (self.context.y()(d)) + ")";
        })
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path").attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
              return self.context.x()(i);
            }).y0(function(){
                return self.context.height;
            }).y1(function(d,i){
              return self.context.y()(d.val);
            })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
              return self.context.x()(i);
            }).attr("cy", function(d) {
              return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}


/*
 *  Column Chart
 */
function ColumnChart(){}
ColumnChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        var ticks =  this.context.chart.selectAll('.tickx').data(this.context.x().ticks(data.category.length)).enter().append('svg:g').attr('transform', 
            function(d, i) {
                return "translate(" + (self.context.x()(i)) + ", 0)";
            }).attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(function(d, i) {
          return data.category[i];
        }).attr('y', h).attr('dy', 15).attr('dx', -2);
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.width;
        
        ticks =  this.context.chart.selectAll('.ticky').data(this.context.y().ticks(10)).enter().append('svg:g').attr('class', 'ticky').attr("transform","translate(0, " + self.context.y()(this.min) + ")");    
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(function(d) {
          return d;
        }).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);

        ticks.transition().duration(500).ease("linear").attr('transform', function(d) {
          return "translate(0, " + (self.context.y()(d)) + ")";
        })
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path").attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
              return self.context.x()(i);
            }).y0(function(){
                return self.context.height;
            }).y1(function(d,i){
              return self.context.y()(d.val);
            })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
              return self.context.x()(i);
            }).attr("cy", function(d) {
              return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

/*
 *  Stack Column Chart
 */
function StackColumnChart(){}
StackColumnChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        var ticks =  this.context.chart.selectAll('.tickx').data(this.context.x().ticks(data.category.length)).enter().append('svg:g').attr('transform', 
            function(d, i) {
                return "translate(" + (self.context.x()(i)) + ", 0)";
            }).attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(function(d, i) {
          return data.category[i];
        }).attr('y', h).attr('dy', 15).attr('dx', -2);
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.width;
        
        ticks =  this.context.chart.selectAll('.ticky').data(this.context.y().ticks(10)).enter().append('svg:g').attr('class', 'ticky').attr("transform","translate(0, " + self.context.y()(this.min) + ")");    
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(function(d) {
          return d;
        }).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);

        ticks.transition().duration(500).ease("linear").attr('transform', function(d) {
          return "translate(0, " + (self.context.y()(d)) + ")";
        })
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path").attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
              return self.context.x()(i);
            }).y0(function(){
                return self.context.height;
            }).y1(function(d,i){
              return self.context.y()(d.val);
            })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
              return self.context.x()(i);
            }).attr("cy", function(d) {
              return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

/*
 *  Bar Chart
 */
function BarChart(){}
ColumnChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        var ticks =  this.context.chart.selectAll('.tickx').data(this.context.x().ticks(data.category.length)).enter().append('svg:g');
        ticks.attr('transform', 
            function(d, i) {
                return "translate(" + (self.context.x()(i)) + ", 0)";
            }).attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(function(d, i) {
          return data.category[i];
        }).attr('y', h).attr('dy', 15).attr('dx', -2);
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.width;
        
        ticks =  this.context.chart.selectAll('.ticky').data(this.context.y().ticks(10)).enter().append('svg:g').attr('class', 'ticky').attr("transform","translate(0, " + self.context.y()(this.min) + ")");    
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(function(d) {
          return d;
        }).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);

        ticks.transition().duration(500).ease("linear").attr('transform', function(d) {
          return "translate(0, " + (self.context.y()(d)) + ")";
        })
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path").attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
              return self.context.x()(i);
            }).y0(function(){
                return self.context.height;
            }).y1(function(d,i){
              return self.context.y()(d.val);
            })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
              return self.context.x()(i);
            }).attr("cy", function(d) {
              return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

/*
 *  Stack Bar Chart
 */
function StackBarChart(){}
StackBarChart.prototype = {
    draw:function(){
        this.drawAxis();
        this.drawPlots();
        this.drawPoints();
    },
    drawAxis:function(){
        this.drawXAxis();
        this.drawYAxis();
    },
    drawXAxis:function(){
        var data = this.context.data;
        var self = this;
        var h = this.context.height;
        var ticks =  this.context.chart.selectAll('.tickx').data(this.context.x().ticks(data.category.length)).enter().append('svg:g').attr('transform', 
            function(d, i) {
                return "translate(" + (self.context.x()(i)) + ", 0)";
            }).attr('class', 'tickx');
        ticks.append('svg:line').attr('y1', h).attr('y2', 0).attr('x1', 0).attr('x2', 0);
        ticks.append('svg:text').text(function(d, i) {
          return data.category[i];
        }).attr('y', h).attr('dy', 15).attr('dx', -2);
    },
    drawYAxis:function(){
        var data = this.context.data;
        var self = this;
        var w = this.width;
        
        ticks =  this.context.chart.selectAll('.ticky').data(this.context.y().ticks(10)).enter().append('svg:g').attr('class', 'ticky').attr("transform","translate(0, " + self.context.y()(this.min) + ")");    
        ticks.append('svg:line').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', w);
        ticks.append('svg:text').text(function(d) {
          return d;
        }).attr('text-anchor', 'end').attr('dy', 2).attr('dx', -4);

        ticks.transition().duration(500).ease("linear").attr('transform', function(d) {
          return "translate(0, " + (self.context.y()(d)) + ")";
        })
    },
    drawPlots:function(){
        var data = this.context.data;
        var self = this;

        for(var i=0;i<data.series.length;i++){
            this.context.chart.selectAll('area'+i).data([data.series[i]]).enter().append("svg:path").attr("d", d3.svg.area().interpolate("monotone").x(function(d, i) {
              return self.context.x()(i);
            }).y0(function(){
                return self.context.height;
            }).y1(function(d,i){
              return self.context.y()(d.val);
            })).attr("class","area").attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    },
    drawPoints:function(){
        var data = this.context.data;
        var self = this;
        for(var i=0;i<data.series.length;i++){
             this.context.chart.selectAll('point'+i).data(data.series[i]).enter().append("svg:circle").attr("class", function(d, i) {
                return 'point';
            }).attr("cursor","pointer").attr("r", function(d, i) {
                return 3;
            }).attr("cx", function(d, i) {
              return self.context.x()(i);
            }).attr("cy", function(d) {
              return self.context.y()(d.val);
            }).on('mouseover', function() {
              return d3.select(this).transition().attr('r', 5);
            }).on('mouseout', function() {
              return d3.select(this).transition().attr('r', 3);
            }).on('click', function(d, i) {
            }).attr("opacity","0").transition().duration(1000).attr("opacity","1");
        }
    }
}

