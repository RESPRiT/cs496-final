// Initial code modified from d3scatter_step4.js

let width = 1000, height = 750;
let margin = { top: 20, right: 15, bottom: 30, left: 60 };
let w = width - margin.left - margin.right;
let h = height - margin.top - margin.bottom;

let startYear = "1985", endYear = "2016";
let dataset, maxVol, maxPrice, maxeValue, maxDelta, ranges, filter_query;
// html elements
let chart, supChart1, supChart2, tooltip, dropdown, dropdown1, dropdown2, sliderRange,
xAxis, yAxis, yAxisLabel, xAxis1, yAxis1, yAxisLabel1, xAxis2, yAxis2, yAxisLabel2;
// d3 scales
let x, y, x1, y1, x2, y2, col;
// filter variables
let playerSelection, teamSelection, yOption, yOption1, yOption2, currVar;
// helper data
let playerMap, teamMap;
// misc
let gRange;

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
    d.RBI = +d.RBI;
    d.BB = +d.BB;
    d.SO = +d.SO;
  });

  dataset = baseball;

  // get scales
  x = d3.scaleTime()
    .domain([new Date(startYear), new Date(endYear)]) // some offset
    .range([0, w]);

  y = d3.scaleLinear()
    .domain([0, 1]) // some offset
    .range([h + 27, 0]);
  
  x1 = d3.scaleTime()
    .domain([new Date(startYear), new Date(endYear)]) // some offset
    .range([0, w / 2]);

  y1 = d3.scaleLinear()
    .domain([0, 1]) // some offset
    .range([h / 2, 0]);
  
  x2 = d3.scaleTime()
    .domain([new Date(startYear), new Date(endYear)]) // some offset
    .range([0, w / 2]);

  y2 = d3.scaleLinear()
    .domain([0, 1]) // some offset
    .range([h / 2, 0]);

  // chart objects
  chart = d3.select(".chart")
    .attr("width", width)
    .attr("height", height + 15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  supChart1 = d3.select(".sup-chart-1")
    .attr("width", width / 2)
    .attr("height", height / 2 + 7.5)
    .append("g")
    .attr("transform", "translate(" + margin.left / 2 + "," + margin.top / 2 + ")");

  supChart2 = d3.select(".sup-chart-2")
    .attr("width", width / 2)
    .attr("height", height / 2 + 7.5)
    .append("g")
    .attr("transform", "translate(" + margin.left / 2 + "," + margin.top / 2 + ")");
  
  // initiate tooltip
  tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // draw axes
  xAxis = chart.append("g")
    .attr("class", ".x-axis")
    .attr("transform", "translate(0," + (h + 27) + ")")
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

  xAxis1 = supChart1.append("g")
    .attr("class", ".x-axis")
    .attr("transform", "translate(0," + h / 2 + ")")
    .call(d3.axisBottom(x1).ticks(5));
    
  xAxis1.append("text")
    .attr("x", w / 2)
    .attr("y", -6)
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Year");

  yAxis1 = supChart1.append("g")
    .attr("class", ".y-axis")
    .call(d3.axisLeft(y1));
  
  yAxisLabel1 = yAxis1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Batting Average");

  xAxis2 = supChart2.append("g")
    .attr("class", ".x-axis")
    .attr("transform", "translate(0," + h / 2 + ")")
    .call(d3.axisBottom(x2).ticks(5));
    
  xAxis2.append("text")
    .attr("x", w / 2)
    .attr("y", -6)
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Year");

  yAxis2 = supChart2.append("g")
    .attr("class", ".y-axis")
    .call(d3.axisLeft(y2));
  
  yAxisLabel2 = yAxis2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("fill", "black")
    .text("Batting Average");

  // setup range slide
  // derived from: https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
  sliderRange = d3
    .sliderLeft()
    .min(0)
    .max(1)
    .height(height - 45)
    .ticks(10)
    .default([0, 1])
    .fill('#2196f3')
    .on('onchange', val => {
      currVar.min = val[0];
      currVar.max = val[1];

      drawVis(dataset, chart, x, y, yOption);
      drawVis(dataset, supChart1, x1, y1, yOption1);
      drawVis(dataset, supChart2, x2, y2, yOption2);
    });

  gRange = d3
    .select('div#slider-vertical')
    .append('svg')
    .attr('width', 100)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(90,30)');

  gRange.call(sliderRange);
  
  // setup dropdown menus
  // derived from: https://www.d3-graph-gallery.com/graph/interactivity_button.html
  let yOptions = [
    {
      name: "Batting Average",
      value: "HperAB",
      format: ".2r"
    },
    {
      name: "Homeruns per Hit",
      value: "HRperH",
      format: ".2r"
    },
    {
      name: "Hits",
      value: "H",
      format: ".2s"
    },
    {
      name: "At Bats",
      value: "AB",
      format: ".2s"
    },
    {
      name: "Salary",
      value: "salary",
      format: ".2s"
    },
    {
      name: "Homeruns",
      value: "HR",
      format: ".2s"
    },
    {
      name: "Runs Batted In",
      value: "RBI",
      format: ".2s"
    },
    {
      name: "Base on Balls",
      value: "BB",
      format: ".2s"
    },
    {
      name: "Strike Outs",
      value: "SO",
      format: ".2s"
    }
  ];

  yOption = yOptions[0];
  yOption1 = yOptions[4];
  yOption2 = yOptions[3];
  
  currVar = {
    min: 0,
    max: 1,
    yOption: yOption
  };

  // initialize dropdowns
  dropdown = d3.select("#y-dropdown").append("select");
  dropdown1 = d3.select("#y-dropdown-1").append("select");
  dropdown2 = d3.select("#y-dropdown-2").append("select");

  dropdown.selectAll("y-options")
    .data(yOptions)
    .enter()
    .append("option")
    .text(d => d.name)
    .attr("value", d => d.value)
    .attr("selected", d => d.value == yOption.value ? "" : null);
  dropdown1.selectAll("y-options")
    .data(yOptions)
    .enter()
    .append("option")
    .text(d => d.name)
    .attr("value", d => d.value)
    .attr("selected", d => d.value == yOption1.value ? "" : null);
  dropdown2.selectAll("y-options")
    .data(yOptions)
    .enter()
    .append("option")
    .text(d => d.name)
    .attr("value", d => d.value)
    .attr("selected", d => d.value == yOption2.value ? "" : null);

  dropdown.on("change", function(d) {
    yOption = {
      name: yOptions[d3.select(this).property("selectedIndex")].name,
      value: d3.select(this).property("value"),
      format: yOptions[d3.select(this).property("selectedIndex")].format
    };
    updateY(dataset, chart, x, y, yOption, yAxis, yAxisLabel, true);
  });
  dropdown1.on("change", function(d) {
    yOption1 = {
      name: yOptions[d3.select(this).property("selectedIndex")].name,
      value: d3.select(this).property("value"),
      format: yOptions[d3.select(this).property("selectedIndex")].format
    };
    updateY(dataset, supChart1, x1, y1, yOption1, yAxis1, yAxisLabel1);
  });
  dropdown2.on("change", function(d) {
    yOption2 = {
      name: yOptions[d3.select(this).property("selectedIndex")].name,
      value: d3.select(this).property("value"),
      format: yOptions[d3.select(this).property("selectedIndex")].format
    };
    updateY(dataset, supChart2, x2, y2, yOption2, yAxis2, yAxisLabel2);
  });

  // generate map of players and their player ids, teams + team ids
  playerMap = {};
  teamMap = {
    "Anaheim Angels": "ANA",
    "Arizona Diamondbacks": "ARI",
    "Atlanta Braves": "ATL",
    "Baltimore Orioles": "BAL",
    "Boston Red Sox": "BOS",
    "California Angels": "CAL",
    "Chicago Cubs": "CHN",
    "Chicago White Sox": "CHA",
    "Cincinnati Reds": "CIN",
    "Cleveland Indians": "CLE",
    "Colorado Rockies": "COL",
    "Detroit Tigers": "DET",
    "Florida Marlins": "FLO",
    "Houston Astros": "HOU",
    "Kansas City Royals": "KCA",
    "Los Angeles Angels of Anaheim": "LAA",
    "Los Angeles Dodgers": "LAN",
    "Miami Marlins": "MIA",
    "Milwaukee Brewers": "ML4",
    "Minnesota Twins": "MIN",
    "Montreal Expos": "MON",
    "New York Mets": "NYN",
    "New York Yankees": "NYA",
    "Oakland Athletics": "OAK",
    "Philadelphia Phillies": "PHI",
    "Pittsburgh Pirates": "PIT",
    "San Diego Padres": "SDN",
    "San Francisco Giants": "SFN",
    "Seattle Mariners": "SEA",
    "St. Louis Cardinals": "SLN",
    "Tampa Bay Rays": "TBA",
    "Texas Rangers": "TEX",
    "Toronto Blue Jays": "TOR",
    "Washington Nationals": "WAS"
  };

  for(const entry of dataset) {
    playerMap[entry.fullName] = entry.playerID;
  }

  // init selections
  playerSelection = [];
  teamSelection = [];

  // setup autocomplete, from: https://jqueryui.com/autocomplete/#multiple
  function split( val ) {
    return val.split( /,\s*/ );
  }
  function extractLast( term ) {
    return split( term ).pop();
  }

  $("#player-selection").val("")
    .on( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
          $( this ).autocomplete( "instance" ).menu.active ) {
        event.preventDefault();
      }
    })
    .autocomplete({
      minLength: 0,
      source: function( request, response ) {
        // delegate back to autocomplete, but extract the last term
        response( $.ui.autocomplete.filter(
          Object.keys(playerMap), extractLast( request.term ) ) );
      },
      focus: function() {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        this.value = terms.join( ", " );
        return false;
      }
    })
    .on("autocompleteselect", function(event, ui) {
      playerSelection = event.currentTarget.value.split(","); 
      playerSelection[playerSelection.length - 1] = ui.item.value;
      playerSelection = playerSelection.map(name => {
        return playerMap[name.trim()];
      });

      drawVis(dataset, chart, x, y, yOption);
      drawVis(dataset, supChart1, x1, y1, yOption1);
      drawVis(dataset, supChart2, x2, y2, yOption2);
    })
    .on("autocompletechange", function(event, ui) {
      playerSelection = event.currentTarget.value.split(","); 
      if(ui.item) {
        playerSelection[playerSelection.length - 1] = ui.item.value;
      }

      playerSelection = playerSelection.map(name => {
        return playerMap[name.trim()];
      }).filter(val => val);

      drawVis(dataset, chart, x, y, yOption);
      drawVis(dataset, supChart1, x1, y1, yOption1);
      drawVis(dataset, supChart2, x2, y2, yOption2);
    });

  $("#team-selection").val("")
    .on( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
          $( this ).autocomplete( "instance" ).menu.active ) {
        event.preventDefault();
      }
    })
    .autocomplete({
      minLength: 0,
      source: function( request, response ) {
        // delegate back to autocomplete, but extract the last term
        response( $.ui.autocomplete.filter(
          Object.keys(teamMap), extractLast( request.term ) ) );
      },
      focus: function() {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        this.value = terms.join( ", " );
        return false;
      }
    })
    .on("autocompleteselect", function(event, ui) {
      teamSelection = event.currentTarget.value.split(","); 
      teamSelection[teamSelection.length - 1] = ui.item.value;
      
      teamSelection = teamSelection.map(name => {
        return teamMap[name.trim()];
      });

      drawVis(dataset, chart, x, y, yOption);
      drawVis(dataset, supChart1, x1, y1, yOption1);
      drawVis(dataset, supChart2, x2, y2, yOption2);
    })
    .on("autocompletechange", function(event, ui) {
      teamSelection = event.currentTarget.value.split(","); 
      if(ui.item) {
        teamSelection[teamSelection.length - 1] = ui.item.value;
      }
      
      teamSelection = teamSelection.map(name => {
        return teamMap[name.trim()];
      }).filter(val => val);

      drawVis(dataset, chart, x, y, yOption, true);
      drawVis(dataset, supChart1, x1, y1, yOption1);
      drawVis(dataset, supChart2, x2, y2, yOption2);
    });
  
  //all the data is now loaded, so draw the initial vis
  drawVis(dataset, chart, x, y, yOption);
  drawVis(dataset, supChart1, x1, y1, yOption1);
  drawVis(dataset, supChart2, x2, y2, yOption2);
    
  // and also set y axes
  updateY(dataset, chart, x, y, yOption, yAxis, yAxisLabel, true);
  updateY(dataset, supChart1, x1, y1, yOption1, yAxis1, yAxisLabel1);
  updateY(dataset, supChart2, x2, y2, yOption2, yAxis2, yAxisLabel2);
}

function updateY(dataset, currChart, xScale, yScale, _yOption, _yAxis, _yAxisLabel, updateScale=false) {
  let column = [];
  
  for(const entry of dataset) {
    column.push(entry[_yOption.value]);
  }
  
  let min = d3.min(column);
  let max = d3.max(column);

  // Rescale the Y-axis, update label
  yScale.domain([min, max]);

  _yAxis.transition()
    .duration(750)
    .ease(d3.easeSinInOut)
    .call(d3.axisLeft(yScale).tickFormat(d3.format(_yOption.format)));
  
  _yAxisLabel.text(_yOption.name);

  // Update slider
  if(updateScale) {
    gRange.remove();

    sliderRange
      .min(min)
      .max(max)
      .default([min, max])
      .displayFormat(d3.format(_yOption.format))
      .tickFormat(d3.format(_yOption.format));

    gRange = d3
      .select('div#slider-vertical svg')
      .attr('width', 100)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(90,30)');
      gRange.call(sliderRange);
  
      // Update filter variable
      currVar = {
        min: min,
        max: max,
        yOption: _yOption
      };
    }

  // Redraw the vis
  drawVis(dataset, currChart, xScale, yScale, _yOption);
}

function drawVis(dataset, currChart, xScale, yScale, _yOption) { //draw the circiles initially and on each interaction with a control
  // derived from: https://www.d3-graph-gallery.com/graph/line_several_group.html
  // styling
  const styles = {
    default: {
      opacity: 0.1,
      stroke: "black",
      "stroke-width": 1
    },
    filtered: {
      opacity: 0.5,
      stroke: "black",
      "stroke-width": 1
    },
    selected: {
      opacity: 1,
      stroke: "#002D72",
      "stroke-width": 3,
    }
  };

  const teamMapInverted = {
    "OAK":"Oakland Athletics",
    "FLO":"Florida Marlins",
    "COL":"Colorado Rockies",
    "NYN": "New York Mets",
    "ATL": "Atlanta Braves",
    "HOU": "Houston Astros",
    "PHI": "Philadelphia Phillies",
    "NYA": "New York Yankees",
    "LAA": "Los Angeles Angels of Anaheim",
    "SFN": "San Francisco Giants",
    "MON": "Montreal Expos",
    "CLE": "Cleveland Indians",
    "BAL": "Baltimore Orioles",
    "CHN": "Chicago Cubs",
    "BOS": "Boston Red Sox",
    "SLN": "St. Louis Cardinals",
    "ANA": "Anaheim Angels",
    "TEX": "Texas Rangers",
    "KCA": "Kansas City Royals",
    "DET": "Detroit Tigers",
    "CAL": "California Angels",
    "SDN": "San Diego Padres",
    "TOR": "Toronto Blue Jays",
    "CHA": "Chicago White Sox",
    "PIT": "Pittsburgh Pirates",
    "SEA": "Seattle Mariners",
    "ARI": "Arizona Diamondbacks",
    "LAN": "Los Angeles Dodgers",
    "CIN": "Cincinnati Reds",
    "TBA": "Tampa Bay Rays",
    "WAS": "Washington Nationals",
    "MIL": "Milwaukee Brewers",
    "MIN": "Minnesota Twins",
    "MIA": "Miami Marlins",
    "ML4": "Milwaukee Brewers"
  };

  let currStyle = styles.default;

  let filteredDataset = dataset;
  
  if(playerSelection.length > 0 || teamSelection.length > 0) {
    filteredDataset = dataset.filter(entry => {
      return playerSelection.includes(entry.playerID) ||
             teamSelection.includes(entry["teamID.x"]);
    });

    currStyle = styles.filtered;
  }

  filteredDataset = filteredDataset.filter(entry => {
    return entry[currVar.yOption.value] >= currVar.min &&
           entry[currVar.yOption.value] <= currVar.max;
  });
  
  groupedData = d3.nest()
    .key(d => d.playerID + d["teamID.x"])
    .entries(filteredDataset);

  let lines = currChart.selectAll(".player-line")
    .data(groupedData, d => d.values[0].playerID);
  
  lines.exit()
    .remove()
    .transition()
    .duration(500)
    .attr("opacity", 0);

  let paths = lines.enter()
    .append("path")
      .attr("class", d => "player-line " + d.values[0]["teamID.x"])
      .attr("id", d => d.values[0].playerID)
      .attr("fill", "none")
      .merge(lines)
      .on("mouseover", function(event, d, i) {
        let player = d.values[0];
        let startYear = d.values[0].yearID;
        let endYear = d.values[d.values.length - 1].yearID;
        let printString = "Currently Selected: <b>" + player.fullName + 
          "</b> of the " + teamMapInverted[player["teamID.x"]] +
          " from " + startYear.getUTCFullYear() + "-" + endYear.getUTCFullYear();

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.html(printString)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.selectAll("#" + player.playerID)
          .attr("stroke", styles.selected.stroke)
          .attr("stroke-width", styles.selected["stroke-width"])
          .attr("border", "black")
          .attr("opacity", styles.selected.opacity)
          .raise();

        d3.select(this)
          .attr("stroke-width", styles.selected["stroke-width"] * 2);
      })
      .on("mouseout", function(e, d, i) {
        let player = d.values[0];

        d3.selectAll("#" + player.playerID)
          .attr("stroke", currStyle.stroke)
          .attr("opacity", currStyle.opacity)
          .attr("border", "none")
          .attr("stroke-width", d => playerSelection.includes(d.values[0].playerID) ?
                                currStyle["stroke-width"] * 3 : currStyle["stroke-width"])
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition()
      .duration(500)
      .attr("stroke", currStyle.stroke)
      .attr("opacity", currStyle.opacity)
      .attr("stroke-width", d => playerSelection.includes(d.values[0].playerID) ?
                            currStyle["stroke-width"] * 3 : currStyle["stroke-width"])
      .attr("class", d => "player-line " + d.values[0]["teamID.x"])
      .attr("d", d => {
        return d3.line()
          .x(d => xScale(d.yearID))
          .y(d => yScale(d[_yOption.value]))
          (d.values);
      });
}