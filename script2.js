var parseDate = d3.timeParse('%Y-%m-%d');

d3.json("https://api.paperbuzz.org/v0/doi/10.1371/journal.pmed.0020124", function(error, d) {
    if (error) return console.warn(error);

    
    var twitterevents = [],
        twittereventsdates = [],
        wpevents = [],
        wpeventsdates = [],
        wikievents = [],
        wikieventsdates = [],
        redlinksevents = [],
        redlinkseventsdates = [],
        hypothesisevents = [],
        hypothesiseventsdates = [],
        webevents = [],
        webeventsdates = [],
        redditevents = [],
        redditeventsdates = [],
        newsevents = [],
        newseventsdates = [],
        source_id = d.altmetrics_sources[0].source_id,
        margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        var i = 0;
        while (i < d.altmetrics_sources.length) {

            switch (d.altmetrics_sources[i].source_id) {
                case 'twitter':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                        twitterevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                        twittereventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                case 'wordpressdotcom':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                        wpevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                        wpeventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                case 'wikipedia':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 wikievents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 wikieventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                case 'reddit-links':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 redlinksevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 redlinkseventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                 case 'hypothesis':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 hypothesisevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 hypothesiseventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                case 'web':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 webevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 webeventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                 case 'reddit':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 redditevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 redditeventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                case 'newsfeed':
                    for (var j = 0; j<d.altmetrics_sources[i].events_count_by_day.length; j++) {
                                 newsevents.push(d.altmetrics_sources[i].events_count_by_day[j].count);
                                 newseventsdates.push(d.altmetrics_sources[i].events_count_by_day[j].date);
                    }
                    break;
                default:
                    console.log('No available source_id located.');
            }
        
        
         i++;
        }
        



            console.log(twitterevents);
            console.log(twittereventsdates);
            console.log(d3.max(twitterevents));
            console.log(twitterevents.length);
            console.log(twittereventsdates.length);
            console.log(source_id);
            console.log(d.altmetrics_sources.length);

    
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
