// Modified from d3scatter_step4.js

let width = 750, height = 450;
let margin = { top: 20, right: 15, bottom: 30, left: 40 };
let w = width - margin.left - margin.right;
let h = height - margin.top - margin.bottom;

let startYear = "1984", endYear = "2020";
let dataset, maxVol, maxPrice, maxeValue, maxDelta, ranges, filter_query;
let chart, tooltip, x, y, col;
let attributes = ["vol", "price", "eValue", "delta"];// list of attributes

initiate()

async function initiate() {
  // read and cleaning data
  let baseball = await d3.csv("data/baseball.csv");
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

  // build players dataset
  /*
  players = {};
  for (const entry of baseball) {
    // create new player object if playerID does not currently exist
    if (!players[entry.playerID]) {
      players[entry.playerID] = {
        name: entry.nameGiven,
        years: {}
      }
    }
    player = players[entry.playerID];

    // create new year object if yearID does not currently exist (it shouldn't)
    if (!player.years[entry.yearID]) {
      player.years[entry.yearID] = {
        atBats: +entry.AB,
        hits: +entry.H,
        homeruns: +entry.HR,
        salary: +entry.salary,
        battingAvg: +entry.HperAB,
        homerunsPerHit: +entry.HRperH
      }
    }
  }
  
  dataset = players;
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

  dataset = baseball.slice(0, baseball.length / 5);
  console.log(dataset);

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
  chart.append("g")
    .attr("transform", "translate(0," + h + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", w)
    .attr("y", -6)
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Year");

  chart.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Batting Average");

  //all the data is now loaded, so draw the initial vis
  drawVis(dataset);
}

function drawVis(dataset) { //draw the circiles initially and on each interaction with a control
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
      tooltip.html("Player <b>" + d.nameGiven + "</b>: " + "salary=" + d.salary)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).attr("r", 4);
      tooltip.transition()
        .duration(500)
        .style("opacity", 0.5);
    });
}