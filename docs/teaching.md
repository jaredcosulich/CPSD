---
index: 2
title: Teaching
layout: landing
snippet: A look at teaching in Cambridge
image: assets/images/teaching.jpg
nav-menu: true
js:
  - topojson
  - data/MADistricts
  - data/MATeacherSalaries
  - data/MAMedianHomePrices
  - data/MADistrictEnrollment
  - data/MASelectedPopulations
  - pages/teaching
---

<style>
	#map {
		position: relative;
	}

	.land {
	  fill: #a1a1a1;
	  stroke: #000;
	  stroke-width: .1px;
	}

	.hidden {
	  display: none;
	}

	div.tooltip {
	  color: #222;
	  background: #fff;
	  padding: .5em;
	  text-shadow: #f5f5f5 0 1px 0;
	  border-radius: 2px;
	  box-shadow: 0px 0px 2px 0px #a6a6a6;
	  opacity: 0.9;
	  position: absolute;
		font-size: 15px;
	}

	p {
		margin-bottom: 1em;
	}
</style>

<div class='narrative'>
  <div id="map" class="graph-right"></div>

  <p>
  	Teaching, in all it's forms (e.g. classroom teachers, specialists, coaches, benefits, etc)
		account for the majority of the budget. It seems there are a lot of ways one could
		examine teaching in Cambridge from a budget perspective.
  </p>
	<p>
		So I've gathered data from a variety of sources and have begun putting together
		comparisons of Massachusetts districts.
	</p>
	<p>
		You can mouse over the map to see all available data for each district and zoom in
		and out using the scroll wheel.
	</p>
	<p>
		The map is colored based on the teacher salaries
		in each community. You can switch the coloring using the links below.
	</p>
	<p>Cambridge is highlighted with a black border.</p>
	<ul>
		<li><a href="javascript:salaries()">Teacher Salaries</a></li>
		<li><a href="javascript:homePrices()">Teacher Salaries / Median Home Price</a></li>
		<li><a href="javascript:employees()">Student Enrollment / Full-Time Employees</a></li>
		<li>
			<a href="javascript:highNeeds()">High Need Students</a> --
			<a href="javascript:disadvantaged()">Economically Disadvantaged Students</a>
		</li>
		<li>
			<a href="javascript:needsToEmployees()">High Need Students / Full-Time Employees</a>
		</li>
	</ul>
	<p>The graph draws data from:</p>
	<ul>
		<li>
			<a href="http://profiles.doe.mass.edu/statereport/teachersalaries.aspx">MA Department of Education Teacher Salaries</a>
		</li>
		<li>
			<a href="http://www.doe.mass.edu/infoservices/reports/enroll/default.html?yr=1617">MA Department of Education Student Enrollment</a>
		</li>
		<li>
			<a href="https://www.bostonmagazine.com/best-places-to-live-2017-single-family-homes/">Home prices in Greater Boston from Boston Magazine</a>
		</li>
		<li>
			<a href="https://github.com/LearningLab/ma-districts">Massachusetts District Boundaries</a>
		</li>
	</ul>
</div>
