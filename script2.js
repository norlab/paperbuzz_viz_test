var parseDate = d3.timeParse('%Y-%m-%d');

d3.json("https://api.paperbuzz.org/v0/doi/10.1371/journal.pmed.0020124", function(error, d) {
    if (error) return console.warn(error);

    // Define variables
    var source = [],
        eventcount = [],
        eventdate = [],
        eventsource =[],
        // source_id = d.altmetrics_sources[0].source_id,
        margin = {top: 20, right: 20, bottom: 90, left: 50},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


        // Fill source array with sources found for specific doi
        var a = 0;
        while (a < d.altmetrics_sources.length) {
            source[a] = d.altmetrics_sources[a].source_id;
            a++;
        }

        console.log(source);

        // Fill eventcount, eventdate, and eventsources array with data from JSON call
        var i = 0;
        while (i < source.length) {

                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                        eventcount.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                        eventdate.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                                        eventsource.push(d.altmetrics_sources[i].source_id);
                    }
                    
                    if (error) return console.log('An error occurred');
         i++;
        }
        
    console.log(source.length);
    console.log(source[0]);
    console.log(eventcount);
    console.log(eventdate);
    console.log(eventsource);

    var a = 0;
    while (a < source.length) {
	    var newECArray = [];
        var newEDArray = [];
        var y = 0;
	    while (y < eventcount.length) {
		    if (source[a] == eventsource[y]) {
			    newECArray.push(eventcount[y]);
                newEDArray.push(eventdate[y])}
		    y++;
        }
        console.log(newECArray);
        

        var y = d3.scaleLinear()
            .domain([0, d3.max(newECArray)])
            .rangeRound([height,0]);

        var x = d3.scaleTime()
            .domain(d3.extent(eventdate, function(d){ return parseDate(d); }))
            .range([0,width])
            .nice(d3.timeMonth);

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(newECArray)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(newEDArray[i]));
                    })
                    .attr("y", function(d) { return y(d); })
                    .attr('fill', "blue");

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
                .text(source[a] + " Event Count");
        
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date"); 
        
    a++;}
    }
           
); // json import
