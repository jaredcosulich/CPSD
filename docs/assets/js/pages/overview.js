var cambridgeDESE2017DataInterval = setInterval(function() {
  var containerId = "#cambridgeDESE2017Data"
  if (window.cambridgeDESE2017Data && $(containerId).length) {
    clearInterval(cambridgeDESE2017DataInterval);
    drawCambridgeDese2017Data(containerId, cambridgeDESE2017Data);
  }
}, 100);

var allDESE2017DataInterval = setInterval(function() {
  var containerId = "#allDESE2017Data"
  if (window.allDESE2017Data && $(containerId).length) {
    clearInterval(allDESE2017DataInterval);
    drawAllDese2017Data(containerId, allDESE2017Data);
  }
}, 100);

function color(magnitude) {
  return d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)(magnitude)
}

function drawCambridgeDese2017Data(containerId, data) {
  var	margin = {top: 0, right: 0, bottom: 0, left: 0},
  	width = 690 - margin.left - margin.right,
  	height = 690 - margin.top - margin.bottom;

  var	chart = d3.select(containerId)
  	.append("svg")
  		.attr("width", width + margin.left + margin.right)
  		.attr("height", height + margin.top + margin.bottom)
  	.append("g")
  		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var rootChildren = {};
  data.forEach(function(d, index) {
    if (!rootChildren[d.category]) {
      rootChildren[d.category] = [];
    }
    rootChildren[d.category].push({
      name: d.item,
      size: d.amount,
      id: index
    });
  });

  var items = [], item;
  for (var itemName in rootChildren) {
    item = {};
    item.name = itemName;
    item.children = rootChildren[itemName]
    items.push(item);
  }

  var data = {name: "Budget", children: items}

  var root = d3.pack()
    .size([width - 2, height - 2])
    .padding(15)
  (d3.hierarchy(data)
    .sum(function(d) { return d.size})
    .sort((a, b) => b.value - a.value))

  let focus = root;
  let view;

  const svg = d3.select(containerId + " svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("background", "white")
      .style("cursor", "pointer")
      .on("click", () => zoom(root));

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .enter().append("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      // .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { d3.select(this).attr("stroke", null); })
      .on("click", function(d) {
        if (!d.children) d = d.parent
        focus !== d
        zoom(d)
        d3.event.stopPropagation()
      });

  node.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n$${d3.format(",d")(d.value)}`);

  const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().filter(d => d != root))
    .enter().append("text")
      .style("font", function(d) { return (3 + (d.r / 8)) + "px sans-serif" })
      .text(d => !d.children ? "$" + d3.format(",d")(d.value) : "")

  label.append("defs").append("path")
    .attr("id", function (d) { return "textPath" + d.data.name.replace(/\s/, "-") })
    .attr("d", function (d) {
      var r = d.r * 0.85
      return "M 0," + r + " a " + r + "," + r + " 0 0 1 0," + (r * -2) +
             "M 0," + (r * -1) + " a " + r + "," + r + " 0 0 1 0," + (r * 2)
    })

  label.append("textPath")
      .attr("xlink:href", function(d) { return "#textPath" + d.data.name.replace(/\s/, "-") } )
      .attr("startOffset", "50%")
      .text(d => d.data.name);


  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
    const k = height / v[2];

    view = v;

    label.attr("transform", function(d) { return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k}) scale(${k})` });
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(d) {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

    // label
    //   .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    //   .transition(transition)
    //     .style("fill-opacity", d => d.parent === focus ? 1 : 0)
    //     .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
    //     .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }
  return svg.node();
}

function drawAllDese2017Data(containerId, data) {
  var districts = ["Cambridge", "Somerville", "Boston", "State Totals"]
  var selectData = data.filter(function(d) { return districts.includes(d.District) })

  var excludeKeys = [
    "LEA",
    "District",
    "In-District FTE Pupils",
    "Out-of-District FTE Pupils",
    "Total FTE Pupils",
    "Total In-District Expenditures",
    "Total Expenditures"
  ]
  var keys = Object.keys(selectData[0]).filter(
    function(k) { return !excludeKeys.includes(k.replace(/[\r\n]/g, ' ')) }
  )

  var	margin = {top: 0, right: 0, bottom: 0, left: 0},
  	width = 750 - margin.left - margin.right;

  var	chart = d3.select(containerId)

  var rowHeight = 150

  var svg = chart.append("svg")
  		.attr("width", width + margin.left + margin.right)
      .attr("height", rowHeight * keys.length)
  	.append("g")
  		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("defs")
    .selectAll("path")
    .data(keys)
      .enter().append("path")
        .attr("id", function(d) { return id(d) })
        .attr("d", function(d, i) { return "M 0," + ((i+1) * rowHeight) + " l " + width + ",0" })
        .attr("stroke", "black");

  var row = svg
    .selectAll("g")
    .data(keys)
      .enter()
        .append("g")

  row.append("use")
    .attr("xlink:href", function(d) { return "#" + id(d) })

  row.append("text")
    .attr("transform", function(d) {
      var midPoint = (750/2) - (d.length*7.5/2)
      return "translate(" + midPoint  + ",-" + (rowHeight-15) + ")"
    })
    .append("textPath")
      .attr("xlink:href", function(d) { return "#" + id(d) })
      .text(function(d) { return d })
      .attr("font-weight", 800)

  var circlePortion = 0.6

  function relativeCircle(districtName) {
    var index;
    for (var i=0; i<districts.length; ++i) {
      if (districts[i] == districtName) {
        index = i;
        break
      }
    };

    var district = selectData.filter(
      function (d) { return d.District == districtName }
    )[0];

    row.append("circle")
      .attr("cx", function (d, i) {
        return (rowHeight * index) + rowHeight
      })
      .attr("cy", function (d, i) {
        return (rowHeight * i) + (rowHeight/2)
      })
      .attr("r", function (d) {
        return rowHeight * percentage(district, d)
      })
      .attr("fill", "white")
      .attr("stroke", "black")
      .append("title")
        .text(function(d) {
          return [
            d,
            district.District,
            "$" + money(district[d]) + " per student",
            "$" + money(district["Total FTE Pupils"] * district[d]) + " total",
            (percentage(district, d) * 100).toFixed(1) + "%"
          ].join("\n")
        });

    var nameWidth = ((rowHeight * index) + rowHeight) - ((districtName.length/2)*8.5)
    row.append("text")
      .attr("transform", "translate(" + nameWidth + ",-" + (rowHeight-45) + ")")
      .append("textPath")
      .attr("xlink:href", function(d) { return "#" + id(d) })
      .text(districtName);

    row.append("text")
      .attr("transform", function(d) {
        var percent = (percentage(district, d) * 100).toFixed(1) + "%"
        var value = district[d + "Percentage"] = percent
        var valueWidth = ((rowHeight * index) + rowHeight) - ((district[d + "Percentage"].length/2)*7)
        return "translate(" + valueWidth + ",-" + 45 + ")"
      })
      .append("textPath")
        .attr("xlink:href", function(d) { return "#" + id(d) })
        .text(function(d) { return district[d + "Percentage"] });
  }

  for (var i=0; i<districts.length; ++i) {
    relativeCircle(districts[i]);
  }

  function id(value) {
    return value.replace(/\s/g, "-")
  }

  function percentage(district, key) {
    var total = district["Total\nIn-District Expenditures"]
    return (district[key] / total)
  }

  function money(number) {
    return d3.format(",d")(number.toFixed(2))
  }
}
