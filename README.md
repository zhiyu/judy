<script src="./src/raphael-min.js" type="text/javascript" charset="utf-8"></script>
<script src="./src/judy.js" type="text/javascript" charset="utf-8"></script>
    
About
-------------------------
[judy](http://github.com/nodengine/judy) is a javascript charting library for web application development.

License
-------------------------
Copyright ©2012  zhiyu zheng    all rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. 
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Contact
-------------------------
any question about judy, please feel free to contact zhengzhiyu@yeah.net

Demos
-------------------------

* Line Charts
  <div id='chart' style="height:400px;" /></div>
* Area Charts
* Column Charts






<script type="text/javascript">
    var chart = new Chart(document.getElementById("chart"),"Line",{series:[
                   [{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}],
                   [{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4}],
                   [{x:3,y:7},{x:7.3,y:1}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9},{x:7.3,y:20}, {x:9.8,y:10}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9}]
                  ],categories:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],legends:["test1","test2"]},
      {
        getMin:function(){
          return 0;
        }
      } 
    );
    chart.draw();

    var chart1 = new Chart(document.getElementById("chart1"),"Area",{series:[
                   [{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}],
                   [{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4}],
                   [{x:3,y:7},{x:7.3,y:1}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9},{x:7.3,y:20}, {x:9.8,y:10}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9}]
                  ],categories:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],legends:["test1","test2"]},
      {
        getMin:function(){
          return 0;
        }
      } 
    );
    chart1.draw();

    var chart2 = new Chart(document.getElementById("chart2"),"Column",{series:[
                   [{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}],
                   [{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4},{x:7.3,y:9}],
                   [{x:3,y:7},{x:7.3,y:1}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9},{x:7.3,y:20}]
                  ],categories:["Jan","Feb","Mar","Apr","May","Jun","Jul"],legends:["test1","test2"]},
      {
        getMin:function(){
          return 0;
        },
        animationType:"bounce",
        lineAttr:{
          "stroke-width":1,
          "opacity":0.9       
        }
      }
    );
    chart2.draw();

    var chart201 = new Chart(document.getElementById("chart201"),"Column",{series:[
                   [{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}],
                   [{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4},{x:7.3,y:9}],
                   [{x:3,y:7},{x:7.3,y:1}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9},{x:7.3,y:20}]
                  ],categories:["Jan","Feb","Mar","Apr","May","Jun","Jul"],legends:["test1","test2"]},
      {
        getMin:function(){
          return 0;
        },
        animationType:"bounce",
        threshold:10,
        lineAttr:{
          "stroke-width":1,
          "opacity":0.9       
        }
      }
    );
    chart201.draw();

    var chart202 = new Chart(document.getElementById("chart202"),"Column",{series:[
                   [{x:3,y:3},{x:7.3,y:10}, {x:9.8,y:12}, {x:1,y:6},{x:3.5,y:10},{x:3,y:3},{x:7.3,y:10}],
                   [{x:3,y:4},{x:7.3,y:9}, {x:9.8,y:15}, {x:1,y:5},{x:3.5,y:19},{x:3,y:4},{x:7.3,y:9}],
                   [{x:3,y:7},{x:7.3,y:1}, {x:9.8,y:5}, {x:1,y:10},{x:3.5,y:6},{x:3,y:9},{x:7.3,y:20}]
                  ],categories:["Jan","Feb","Mar","Apr","May","Jun","Jul"],legends:["test1","test2"]},
      {
        getMin:function(){
          return 0;
        },
        stacked:true,
        animationType:"bounce",
        lineAttr:{
          "stroke-width":1,
          "opacity":0.9       
        }
      }
    );
    chart202.draw();
</script>
