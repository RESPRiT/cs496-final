// Initial code modified from d3scatter_step4.js

let width = 750, height = 450;
let margin = { top: 20, right: 15, bottom: 30, left: 60 };
let w = width - margin.left - margin.right;
let h = height - margin.top - margin.bottom;

let startYear = "1985", endYear = "2016";
let dataset, maxVol, maxPrice, maxeValue, maxDelta, ranges, filter_query;
// html elements
let chart, tooltip, dropdown, xAxis, yAxis, yAxisLabel;
// d3 scales
let x, y, col;
let attributes = ["vol", "price", "eValue", "delta"];// list of attributes

initiate()

async function initiate() {
  // read and cleaning data
  let baseball = await d3.csv("data/baseball_filtered.csv");
  /*
   * Baseball columns:
   * - playerID
   * - yearID
   * - AB: At Bats
   * - H: Hits
   * - HR: Homeruns
   * - nameFirst
   * - nameLast
   * - nameGiven
   * - salary
   * - HperAB: Batting Average
   * - HRperH: Homeruns per Hit 
   */

   // set types
  baseball.forEach(d => {
    d.yearID = new Date(d.yearID);
    d.AB = +d.AB;
    d.H = +d.H;
    d.HR = +d.HR;
    d.salary = +d.salary;
    d.HperAB = +d.HperAB;
    d.HRperH = +d.HRperH;
  });

  dataset = baseball;

  // create drop-down menu
  // derived from: https://www.d3-graph-gallery.com/graph/interactivity_button.html
  let yOptions = [
    {
      name: "Batting Average",
      value: "HperAB"
    },
    {
      name: "Homeruns per Hit",
      value: "HRperH"
    },
    {
      name: "Hits",
      value: "H"
    },
    {
      name: "At Bats",
      value: "AB"
    },
    {
      name: "Salary",
      value: "salary"
    }
  ];

  dropdown = d3.select("#y-dropdown").append("select");

  dropdown.selectAll("y-options")
    .data(yOptions)
    .enter()
    .append("option")
    .text(d => d.name)
    .attr("value", d => d.value);

  dropdown.on("change", function(d) {
    let yOption = {
      name: yOptions[d3.select(this).property("selectedIndex")].name,
      value: d3.select(this).property("value")
    };
    updateY(dataset, yOption);
  });

  // get scales
  x = d3.scaleTime()
    .domain([new Date(startYear), new Date(endYear)]) // some offset
    .range([0, w]);

  y = d3.scaleLinear()
    .domain([0, 1]) // some offset
    .range([h, 0]);

  col = d3.scaleOrdinal(d3.schemeCategory10);

  // chart object
  chart = d3.select(".chart")
    .attr("width", width)
    .attr("height", height + 15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // initiate tooltip
  tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // draw axes
  xAxis = chart.append("g")
    .attr("class", ".x-axis")
    .attr("transform", "translate(0," + h + ")")
    .call(d3.axisBottom(x))
    
  xAxis.append("text")
    .attr("x", w)
    .attr("y", -6)
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Year");

  yAxis = chart.append("g")
    .attr("class", ".y-axis")
    .call(d3.axisLeft(y))
  
  yAxisLabel = yAxis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Batting Average");
  
  console.log(yAxis);

  //all the data is now loaded, so draw the initial vis
  drawVis(dataset);
}

function updateY(dataset, yOption) {
  console.log(yOption);
  console.log(dataset);

  let column = [];
  for(const entry of dataset) {
    column.push(entry[yOption.value]);
  }
  console.log(column);

  // Rescale the Y-axis, update label
  y.domain([
    d3.min(column), 
    d3.max(column)
  ]);

  yAxis.transition()
    .duration(750)
    .ease(d3.easeSinInOut)
    .call(d3.axisLeft(y));
  
  yAxisLabel.text(yOption.name);

  // Redraw the vis
  drawVis(dataset, yOption.value);
}

function drawVis(dataset, yOption="HperAB") { //draw the circiles initially and on each interaction with a control
  /*
  let circle = chart.selectAll("circle")
    .data(dataset, d => d.playerID + d.yearID); // assign key!!!

  // filter out first
  circle.exit().remove();

  // enter (keyed data)
  circle.enter().append("circle")
    .attr("cx", d => x(d.yearID))
    .attr("cy", d => y(d.HperAB))
    .style("fill", d => col(d.type))
    .attr("r", 4)
    .style("stroke", "black")
    .style("opacity", 0.5)
    .on("mouseover", function (event, d, i) {
      d3.select(this).attr("r", 8);
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);
      tooltip.html("Player <b>" + d.nameGiven + "</b>: " + "H/AB=" + d.H + "/" + d.AB)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).attr("r", 4);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0.5);
    });
  */

  // derived from: https://www.d3-graph-gallery.com/graph/line_several_group.html
  groupedData = d3.nest()
    .key(d => d.playerID)
    .entries(dataset);

  let lines = chart.selectAll(".player-line")
    .data(groupedData, d => d);
  
  lines.exit().remove();

  let paths = lines.enter()
    .append("path")
      .attr("class", "player-line")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("opacity", "0")
      .attr("stroke-width", 1)
      .attr("d", d => {
        return d3.line()
          .x(d => x(d.yearID))
          .y(d => y(d[yOption]))
          (d.values);
      })
      .on("mouseover", function(event, d, i) {
        d3.select(this)
          .attr("stroke", "#002D72")
          .attr("stroke-width", 2)
          .attr("opacity", "1");
        
        let player = d.values[0];
        let startYear = d.values[0].yearID;
        let endYear = d.values[d.values.length - 1].yearID;
        let printString = "Player <b>" + player.nameGiven + 
          "</b> of team " + player["teamID.x"] +
          " from " + startYear.getUTCFullYear() + "-" + endYear.getUTCFullYear();

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.html(printString)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(e, d, i) {
        d3.select(this)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("opacity", "0.05");
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition()
      .duration(500)
      .attr("opacity", "0.05");
}