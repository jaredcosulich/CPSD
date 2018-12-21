
var mapInterval = setInterval(function() {
  var containerId = "#map"
  if (window.topojson && window.maDistricts && window.maTeacherSalaries && window.maMedianHomePrices && window.maDistrictEnrollment && $(containerId).length) {
    clearInterval(mapInterval);
    drawMap(containerId, maDistricts, maTeacherSalaries, maMedianHomePrices, maDistrictEnrollment);
  }
}, 100);

function drawMap(containerId, maDistrictData, maTeacherSalariesData, maMedianHomePriceData, maDistrictEnrollmentData) {
  var width = 750,
      height = 600;

  var tooltip = d3.select(containerId).append("div").attr("class", "tooltip hidden");

  var transform = {k: 1, x: 0, y: 0}

  function redraw() {
    var t = transform = d3.event.transform;
    console.log(t)
    svg.style("stroke-width", 1 / t.k).attr("transform", "translate(" + t.x + "," + t.y + ")scale(" + t.k + ")");
  }

  var projection = d3.geoAlbersUsa()
                    .scale(22000)
                    .translate([-6820, 2550]);

  var path = d3.geoPath().projection(projection);

  var svg = d3.select(containerId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom()
      .on("zoom", redraw))
      .append("g")

  var topo = topojson.feature(maDistrictData, maDistrictData.objects.high).features;

  var land = svg.selectAll(".land").data(topo);

  var district = land.enter().insert("path")
      .attr("class", "land")
      .attr("d", path)
      .attr("id", function(d,i) { return "DISTRICT" + d.properties.DISTRICTID; })
      // .style("fill", function(d,i) { return color(d) });

  maTeacherSalariesData.forEach(function(info) {
    var item = maDistrictData.objects.high.geometries.filter(
      function(i) { return i.properties.DISTCODE8 == info["District Code"] }
    )[0];
    if (item) {
      item.properties.AverageSalary = info["Average Salary"];
      item.properties.FTE = info["FTE Count"];
    }
  });

  maMedianHomePriceData.forEach(function(info) {
    var name = info["Neighborhood / Town"]
    var items = maDistrictData.objects.high.geometries.filter(
      function(i) { return (i.properties.DISTNAME || "").includes(name) }
    );

    var item;
    if (items.length > 1) {
      item = items.filter(function(i) { return i.properties.DISTNAME == name })[0]
    }

    if (!item) {
      item = items[0];
    }

    if (item) {
      item.properties.MedianHomePrice = info["2016 Median Price"];

      var c = color(item)
      svg.select("#DISTRICT" + item.properties.DISTRICTID).style("fill", c);
    } else {
      console.log("No Median Home Price: " + info["Neighborhood / Town"])
    }
  });

  maDistrictEnrollmentData.forEach(function(info) {
    var item = maDistrictData.objects.high.geometries.filter(
      function(i) { return i.properties.DISTCODE4 == info["ORG_CODE"] }
    )[0];
    if (item) {
      item.properties.Enrollment = info["District_Total"];
    }
  });

  //tooltips
  district.on('mouseover', function(d) {
    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
    var t = transform
    mouse[0] = (mouse[0] * t.k) + t.x;
    mouse[1] = (mouse[1] * t.k) + t.y

    var p = d.properties
    var enrollmentNumber = cleanFloat(p.Enrollment)
    var averageSalary = cleanFloat(p.AverageSalary)
    var medianHomePrice = cleanFloat(p.MedianHomePrice)
    var fte = cleanFloat(p.FTE)

    tooltip
      .classed("hidden", false)
      .attr("style", "left:"+(mouse[0] - 120)+"px; top:"+(mouse[1] - 120)+"px")
      .attr("transform", "translate(" + t.x + "," + t.y + ")scale(" + t.k + ")")
      .html(
        p.DISTNAME + " (" + p.DISTCODE4 + ")" + "<br/>" +
        p.Enrollment + " Students, " +
        p.FTE + " FTE (" + (parseInt(enrollmentNumber/fte*10)/10) + " Students/FTE)<br/>" +
        "Avg Salary: " + p.AverageSalary + ", Median Home Price: " + (p.MedianHomePrice || "N/A") +
        (p.MedianHomePrice ? (" (" + parseInt(averageSalary / medianHomePrice * 100) + "%)") : "")
      );
  }).on("mouseout",  function(d,i) {
    tooltip.classed("hidden", true)
  });

  function cleanFloat(numberString) {
    return parseFloat((numberString + "").replace(/[\s,$]/g, ""))
  }

  function color(data) {
    // Try a gradient: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html

    var c = d3.scaleThreshold()
      .domain([0, 4, 8, 12, 18, 25, 35, 50])
      .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"].reverse());

    var value = cleanFloat(data.properties.AverageSalary) / cleanFloat(data.properties.MedianHomePrice) * 100

    return c(value);
  }

  d3.select(self.frameElement).style("height", height + "px");

  window.employees = function() {
    maDistrictEnrollmentData.forEach(function(info) {
      var item = maDistrictData.objects.high.geometries.filter(
        function(i) { return i.properties.DISTCODE4 == info["ORG_CODE"] }
      )[0];

      if (item) {
        var value = cleanFloat(item.properties.Enrollment) / cleanFloat(item.properties.FTE)
        console.log(item.properties.DISTNAME, value)

        var c = d3.scaleThreshold()
          .domain([10, 11, 12, 13, 14, 16, 18, 20])
          .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

        svg.select("#DISTRICT" + item.properties.DISTRICTID).style("fill", c(value));
      }
    });
  }

  window.salaries = function() {
    maMedianHomePriceData.forEach(function(info) {
      var name = info["Neighborhood / Town"]
      var items = maDistrictData.objects.high.geometries.filter(
        function(i) { return (i.properties.DISTNAME || "").includes(name) }
      );

      var item;
      if (items.length > 1) {
        item = items.filter(function(i) { return i.properties.DISTNAME == name })[0]
      }

      if (!item) {
        item = items[0];
      }

      if (item) {
        var c = color(item)
        svg.select("#DISTRICT" + item.properties.DISTRICTID).style("fill", c);
      }
    });
  }

}
