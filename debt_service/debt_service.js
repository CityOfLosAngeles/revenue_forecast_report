// code mostly copied from https://bl.ocks.org/mbostock/3887051

/* Initial Setup */

// Constants for sizing  
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

// maintain a ratio of 2.5 width to 1 height, but scale to window. Max width of 1000.
var width = d3.min([1000, y * 1.2, x * 0.75]);
var height = width / 2.5;

var svg = d3.select("#vis")
    .append("svg")
    .attr('height', height)
    .attr('width', width);

var margin = {top: 40, right: width * 0.3, bottom: 80, left: 80},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// scale for groups
var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.2);

// scale within groups
var x1 = d3.scaleBand()
    .padding(0.1);

// scale for height
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// scale for color
var z = d3.scaleOrdinal()
    .range(["skyblue", "steelblue"]);

var axisTextSize = d3.min([d3.max([8, (height / 20)]), 15]) + "px"


// function from https://bl.ocks.org/mbostock/7555321 for wrapping text
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}





d3.csv("debt_service.csv", function(d, i, columns) {
  // convert data from text to numbers, divide by 1000
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]] / 1000;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  x0.domain(data.map(function(d) { return d.Name; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.Name) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", height)
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", function(d) { return z(d.key); });

  d3.selectAll('rect')
    .transition()
    .duration(500)
    .attr("y", function(d) {return y(d.value)})
    .attr("height", function(d) { return height - y(d.value); });

  g.append("g")
      .attr("class", "axis-x0")
      .style('font-size', axisTextSize)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "axis")
      .style('font-size', axisTextSize)
      .call(d3.axisLeft(y).ticks(null))
    .append("text")
      .attr('font-size', axisTextSize)
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "-2em")
      .attr("fill", "#000")
      .text('$ (Millions)');

  var legend = g.append("g")
      .attr('transform', 'translate(130,100)')
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 35 + ")"; });

  legend.append("rect")
      .attr("x", width - 25)
      .attr("width", 25)
      .attr("height", 25)
      .attr("fill", z);

  legend.append("text")
      .style('font-size', axisTextSize)
      .attr("x", width - 30)
      .attr("y", 11.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  // wrap x-axis labels
  d3.select('.axis-x0').selectAll(".tick text")
    .call(wrap, 80);
});
