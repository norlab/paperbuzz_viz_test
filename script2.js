d3.json("https://api.paperbuzz.org/v0/doi/10.1371/journal.pmed.0020124", function(error, d) {
    if (error) return console.warn(error);
    
    var twitterevents = [],
        twittereventsdates = [];

    
            for (var i = 0; i<d.altmetrics_sources[1].events_count_by_day.length; i++) {
                twitterevents.push(d.altmetrics_sources[1].events_count_by_day[i].count);
                twittereventsdates.push(d.altmetrics_sources[1].events_count_by_day[i].date);
            }
            console.log(twitterevents);
            console.log(twittereventsdates);
            console.log(d3.max(twitterevents));
            console.log(twitterevents.length);
            console.log(twittereventsdates.length);


    var margin = {top: 20, right: 20, bottom: 70, left: 40},
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;


    var parseDate = d3.timeParse('%Y-%m-%d');
    
    var y = d3.scaleLinear()
        .domain([0, d3.max(twitterevents)])
        .rangeRound([height,0]);

    var x = d3.scaleTime()
        .domain(d3.extent(twittereventsdates, function(d){ return parseDate(d); }))
        .range([0,width])
        .nice(d3.timeMonth);

    console.log(d3.extent(twittereventsdates, function(d){ return parseDate(d); }))


    var yAxis = d3.axisLeft(y);
    var xAxis = d3.axisBottom(x);

    var svg = d3.select('#viz').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

    var ChartGroup = svg.append("g")
                .attr("transform","translate("+margin.left+","+margin.top+")")

    ChartGroup.selectAll('rect')
            .data(twitterevents)
            .enter().append('rect')
                .attr('width', 5)
                .attr("height", function(d) { return height - y(d); })
                .attr('x', function(d, i) {
                    return x(parseDate(twittereventsdates[i]));
                  })
                .attr("y", function(d) { return y(d); })
                .attr('fill', "blue");

    ChartGroup.append('g')
            .attr("class", "axis y")
            .call(yAxis);

    ChartGroup.append('g')
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%Y-%m-%d")))
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
           
}); // json import
