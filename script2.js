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
        margin = {top: 20, right: 20, bottom: 90, left: 50},
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

    if (twitterevents[0] != null) {
    
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
                .text("Twitter Event Count");
        
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (wpevents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(wpevents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(wpeventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(wpeventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(wpevents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(wpeventsdates[i]));
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
                .text("Wordpress Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (wikievents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(wikievents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(wikieventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(wikieventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(wikievents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(wikieventsdates[i]));
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
                .text("Wikipedia Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (redlinksevents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(redlinksevents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(redlinkseventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(redlinkseventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);

        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(redlinksevents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(redlinkseventsdates[i]));
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
                .text("Reddit-Links Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (hypothesisevents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(hypothesisevents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(hypothesiseventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(hypothesiseventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(hypothesisevents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(hypothesiseventsdates[i]));
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
                .text("Hypothesis Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (webevents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(webevents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(webeventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(webeventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(webevents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(webeventsdates[i]));
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
                .text("Web Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

    //start new viz

    if (redditevents[0] != null) {

        var y = d3.scaleLinear()
                .domain([0, d3.max(redditevents)])
                .rangeRound([height,0]);
            
        var x = d3.scaleTime()
                .domain(d3.extent(redditeventsdates, function(d){ return parseDate(d); }))
                .range([0,width])
                .nice(d3.timeMonth);
            
        console.log(d3.extent(redditeventsdates, function(d){ return parseDate(d); }))

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select('#viz').append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
        var ChartGroup = svg.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")")

        ChartGroup.selectAll('rect')
                .data(redditevents)
                .enter().append('rect')
                    .attr('width', 5)
                    .attr("height", function(d) { return height - y(d); })
                    .attr('x', function(d, i) {
                        return x(parseDate(redditeventsdates[i]));
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
                .text("Reddit Event Count");
            
        ChartGroup.append("text")             
                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                .style("text-anchor", "middle")
                .text("Date");
    }

        //start new viz

        if (newsevents[0] != null) {

            var y = d3.scaleLinear()
                    .domain([0, d3.max(newsevents)])
                    .rangeRound([height,0]);
                
            var x = d3.scaleTime()
                    .domain(d3.extent(newseventsdates, function(d){ return parseDate(d); }))
                    .range([0,width])
                    .nice(d3.timeMonth);
                
            console.log(d3.extent(newseventsdates, function(d){ return parseDate(d); }))
    
            var yAxis = d3.axisLeft(y);
            var xAxis = d3.axisBottom(x);
    
            var svg = d3.select('#viz').append('svg')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
                
            var ChartGroup = svg.append("g")
                        .attr("transform","translate("+margin.left+","+margin.top+")")
    
            ChartGroup.selectAll('rect')
                    .data(newsevents)
                    .enter().append('rect')
                        .attr('width', 5)
                        .attr("height", function(d) { return height - y(d); })
                        .attr('x', function(d, i) {
                            return x(parseDate(newseventsdates[i]));
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
                    .text("News Event Count");
                
            ChartGroup.append("text")             
                    .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
                    .style("text-anchor", "middle")
                    .text("Date");
        }
           
}); // json import
