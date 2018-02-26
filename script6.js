var paperbuzz = {}

paperbuzz.initViz = function(options) {
    console.log(options);
    
    var d = options.paperbuzzStatsJson;
    var minimums = options.minItemsToShowGraph;
    var parseDate = d3.timeParse('%Y-%m-%d');
    var formatNumber = d3.format(",d");

    var vizDiv = d3.select("#paperbuzz");
    
    // Remove the loading message
    vizDiv.select("#loading").remove();

    // Add the title and link
    vizDiv.append("a")
            .attr('href', 'http://dx.doi.org/' + d.doi)
            .attr("class", "title")
            .text(d.metadata.title);

    // Define variables
    var source = [],
        event_counts_by_day = [],
        event_dates_by_day = [],
        event_counts_by_month = [],
        event_dates_by_month = [],
        event_counts_by_year = [],
        event_dates_by_year = [],
        eventsource =[],
        eventsource_month = [],
        eventsource_year = [],
        margin = {top: 50, right: 20, bottom: 150, left: 50},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;


        // Fill source array with sources found for specific doi
        var a = 0;
        while (a < d.altmetrics_sources.length) {
            source[a] = d.altmetrics_sources[a].source_id;
            a++;
        }

        // Fill event_counts_by_day, event_dates_by_day, and eventsources array with data from JSON call
        var i = 0;
        while (i < source.length) {

                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                        event_counts_by_day.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                        event_dates_by_day.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                                        eventsource.push(d.altmetrics_sources[i].source_id);
                    }
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_month.length; j++) {
                                        event_counts_by_month.push(d.altmetrics_sources[i].events_count_by_month[j].count);
                                        event_dates_by_month.push(d.altmetrics_sources[i].events_count_by_month[j].date);
                                        eventsource_month.push(d.altmetrics_sources[i].source_id);
                    }
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_year.length; j++) {
                                        event_counts_by_year.push(d.altmetrics_sources[i].events_count_by_year[j].count);
                                        event_dates_by_year.push(d.altmetrics_sources[i].events_count_by_year[j].date);
                                        eventsource_year.push(d.altmetrics_sources[i].source_id);
                    }
                    
         i++;
        }


    // For each source in the source array, build new count and date arrays  and output the paperbuzz
    var a = 0;

    while (a < source.length) {
	    var newECdailyArray = [];
        var newEDdailyArray = [];
        var newECmonthlyArray = [];
        var newEDmonthlyArray = [];
        var newECyearlyArray = [];
        var newEDyearlyArray = [];
        var y = 0;
	    while (y < event_counts_by_day.length) {
		    if (source[a] == eventsource[y]) {
			    newECdailyArray.push(event_counts_by_day[y]);
                newEDdailyArray.push(event_dates_by_day[y])}
		    y++;
        }
        var y = 0;
	    while (y < event_counts_by_month.length) {
		    if (source[a] == eventsource_month[y]) {
			    newECmonthlyArray.push(event_counts_by_month[y]);
                newEDmonthlyArray.push(event_dates_by_month[y])}
		    y++;
        }
        var y = 0;
	    while (y < event_counts_by_year.length) {
		    if (source[a] == eventsource_year[y]) {
			    newECyearlyArray.push(event_counts_by_year[y]);
                newEDyearlyArray.push(event_dates_by_year[y])}
		    y++;
        }

        var dailyArray=[]
        for (i in newECdailyArray){
	            var val = {};
                val['date'] = newEDdailyArray[i];
                val['value'] = newECdailyArray[i];
                dailyArray.push(val)
        }

        var monthlyArray=[]
        for (i in newECmonthlyArray){
	            var val = {};
                val['date'] = newEDmonthlyArray[i];
                val['value'] = newECmonthlyArray[i];
                monthlyArray.push(val)
        }

        var yearlyArray=[]
        for (i in newECyearlyArray){
	            var val = {};
                val['date'] = newEDyearlyArray[i];
                val['value'] = newECyearlyArray[i];
                yearlyArray.push(val)
        }

        // Draw the visualization as per function
        drawInitVis(d);

        function drawInitVis(d) {
            console.log(source[a]);
            console.log(dailyArray.length);
            console.log(minimums.minDaysForDaily);
            console.log(d3.max(newECdailyArray));
            console.log(minimums.minEventsForDaily);
            console.log(dailyArray.length >= minimums.minDaysForDaily);
            console.log(d3.max(newECdailyArray) >= minimums.minEventsForDaily);

            
        if ((dailyArray.length >= minimums.minDaysForDaily) && (d3.max(newECdailyArray) >= minimums.minEventsForDaily)) {
            
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var y = d3.scaleLinear()
                .domain([0, d3.max(newECdailyArray)])
                .rangeRound([height,0]);


            // Use the higher-level event_dates_by_day array for the min and max x-values. This will make all x-axes consistent with each other
            var x = d3.scaleTime()
                .domain(d3.extent(event_dates_by_day, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);

            var yAxis = d3.axisLeft(y)
                    .tickValues([d3.max(y.domain())]);
            
            var xAxis = d3.axisBottom(x);

            var graphContainer = d3.select('#paperbuzz').append('div');

            graphContainer.attr("class", "alm-category-row")
                    .attr("style", "width: 100%; overflow: hidden;")
                    .attr("id", "category-" + a);

            var svg = graphContainer.append('svg')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

            var ChartGroup = svg.append("g")
                        .attr("transform","translate("+margin.left+","+margin.top+")")
            
            ChartGroup.selectAll('rect')
            .data(dailyArray)
            .enter().append('rect')
                .attr('width', 3)
                .attr("height", function(d) { return height - y(d.value); })
                .attr('x', function(d, i) {
                    return x(parseDate(d.date));
                })
                .attr("y", function(d) { return y(d.value); })
                .attr('fill', "blue")
                .on("mouseover", function(d) {
                    div.transition()
                    .duration(100)
                    .style("opacity", .9)
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 50 + "px");
                    div.html("count: " + d.value + "<br>" + "date: " + d.date);
                    })
                .on("mouseout", function(d) {
                    div.transition()
                    .duration(500)
                    .style("opacity", 0);
                    });

            ChartGroup.append('g')
                    .attr("class", "axis y")
                    .call(yAxis);

            ChartGroup.append('g')
                    .attr("class", "axis x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%Y-%m-%d")))
                    .selectAll("text")	
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-65)");

            ChartGroup.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text(source[a].toUpperCase() + " EVENT COUNT");
            
            ChartGroup.append("text")             
                    .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 30) + ")")
                    .style("text-anchor", "middle")
                    .text("DATE");

            ChartGroup.append("text")             
                    .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top -250) + ")")
                    .attr("font-size", "11px")
                    .attr("fill", "blue")
                    .style("text-anchor", "middle")
                    .text("TOTAL " + source[a].toUpperCase() + " EVENTS: " + d3.sum(dailyArray, function(d) { return d.value; }));
                    
            ChartGroup.append("text")
                    .attr("transform", "translate(" + (width/1.3) + " ," + (height + margin.top + 60) + ")")    
                    .attr("class", "legend")
                    .style("fill", "steelblue")         
                    .on("click", function(){
                        })
                    .text("Monthly |");

            ChartGroup.append("text")
                    .attr("transform", "translate(" + (width/1.115) + " ," + (height + margin.top + 60) + ")")    
                    .attr("class", "legend")
                    .style("fill", "steelblue")         
                    .on("click", function(){
                    })
                    .text("Yearly");

                    }
                }

    a++;}
};
