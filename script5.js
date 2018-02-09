/**
 * paperbuzzViz
 * See https://github.com/jalperin/paperbuzzviz for more details
 * Distributed under the GNU GPL v2. For full terms see the file docs/COPYING.
 * 
 * @brief Article level metrics visualization controller.
 */
function PaperbuzzViz(options) {
    // allow jQuery object to be passed in
    // in case a different version of jQuery is needed from the one globally defined
    $ = options.jQuery || $;

    // Init data
    var data = options.paperbuzzStatsJson;
    var categories_ = options.categories;

    console.log(data);
    // Init basic options
    var baseUrl_ = options.baseUrl;
    var hasIcon = options.hasIcon;
    var sources = [];
    var eventcount = [];
    var eventdate = [];
    var eventsource =[];
    var minItems_ = options.minItemsToShowGraph;
    var showTitle = options.showTitle;
    var formatNumber_ = d3.format(",d");
    var parseDate = d3.timeParse('%Y-%m-%d');
    var year = data.metadata["published-online"]["date-parts"][0][0];
    var month = data.metadata["published-online"]["date-parts"][0][1];
    var day = data.metadata["published-online"]["date-parts"][0][2];
    var published_date = year+"-"+month+"-"+day;

    // extract publication date
    var pub_date = parseDate(published_date);
    console.log(pub_date);

    var vizDiv;
    // Get the Div where the viz should go (default to one with ID "paperbuzz')
    if (options.vizDiv) {
        vizDiv = d3.select(options.vizDiv);
    } else {
        vizDiv = d3.select("#paperbuzz");
    }

    // look to make sure browser support SVG
    var hasSVG_ = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");

    // to track if any metrics have been found
    var metricsFound_;

    var a = 0;
        while (a < data.altmetrics_sources.length) {
            sources[a] = data.altmetrics_sources[a].source_id;
            a++;
        }

    // Fill eventcount, eventdate, and eventsources array with data from JSON call
    var i = 0;
    while (i < sources.length) {

                for (var j = 0; j<data.altmetrics_sources[i].events_count_by_day.length; j++) {
                                    eventcount.push(data.altmetrics_sources[i].events_count_by_day[j].count);
                                    eventdate.push(data.altmetrics_sources[i].events_count_by_day[j].date);
                                    eventsource.push(data.altmetrics_sources[i].source_id);
                }
                
     i++;
    }

     /**
     * Initialize the visualization.
     * NB: needs to be accessible from the outside for initialization
     */
    this.initViz = function() {
        vizDiv.select("#loading").remove();

        if (showTitle) {
            vizDiv.append("a")
                .attr('href', 'http://dx.doi.org/' + data.doi)
                .attr("class", "title")
                .text(data.metadata.title);
        }


        // loop through categories
        sources.forEach(function(source) {
            addSource_(vizDiv, source, data);
        });


        if (!metricsFound_) {
            vizDiv.append("p")
                .attr("class", "muted")
                .text("No metrics found.");
        }
    };

     /**
     * Build each article level statistics category.
     * @param {Object} canvas d3 element
     * @param {Array} sources Information about the source.
     * @param {Object} data Statistics.
     * @return {JQueryObject|boolean}
     */
    var addSource_ = function(canvas, source, data) {
        var $sourceRow = false;

        // Loop through sources to add statistics data to the category.
        sources.forEach(function(source) {
          
                // Only add the category row the first time
                if (!$sourceRow) {
                    $sourceRow = getSourceRow_(canvas, source);
                }

                // Flag that there is at least one metric
                metricsFound_ = true;
                addSource_(source, $sourceRow);
        });
    };


    /**
     * Get category row d3 HTML element. It will automatically
     * add the element to the passed canvas.
     * @param {d3Object} canvas d3 HTML element
     * @param {Array} source Source information.
     * @param {d3Object}
     */
    var getSourceRow_ = function(canvas, source) {
        var sourceRow, sourceTitle, tooltip;

        // Build category html objects.
        sourceRow = canvas.append("div")
            .attr("class", "paperbuzz-source-row")
            .attr("style", "width: 100%; overflow: hidden;")
            .attr("id", "source-" + source.name);

        sourceTitle = sourceRow.append("h2")
            .attr("class", "paperbuzz-source-row-heading")
            .attr("id", "month-" + source.name)
            .text(source.display_name);

        tooltip = sourceTitle.append("div")
            .attr("class", "paperbuzz-source-row-info").append("span")
            .attr("class", "ui-icon ui-icon-info");

        $(tooltip).tooltip({title: source, container: 'body'});

        return sourceRow;
    };


    var addStuff_ = function(source) {

                if (showDaily) {
                    $levelControlsDiv.append("a")
                        .attr("href", "javascript:void(0)")
                        .classed("alm-control", true)
                        .classed("disabled", !showDaily)
                        .classed("active", (level == 'day'))
                        .text("daily (first 30)")
                        .on("click", function() {
                            if (showDaily && !$(this).hasClass('active')) {
                                loadData_(viz, 'day');
                                update_controls($(this));
                            }
                        }
                    );

                    $levelControlsDiv.append("text").text(" | ");
                }

                if (showMonthly) {
                    $levelControlsDiv.append("a")
                        .attr("href", "javascript:void(0)")
                        .classed("alm-control", true)
                        .classed("disabled", !showMonthly || !showYearly)
                        .classed("active", (level == 'month'))
                        .text("monthly")
                        .on("click", function() { if (showMonthly && !$(this).hasClass('active')) {
                            loadData_(viz, 'month');
                            update_controls($(this));
                        } });

                    if (showYearly) {
                        $levelControlsDiv.append("text")
                            .text(" | ");
                    }

                }

                if (showYearly) {
                    $levelControlsDiv.append("a")
                        .attr("href", "javascript:void(0)")
                        .classed("alm-control", true)
                        .classed("disabled", !showYearly || !showMonthly)
                        .classed("active", (level == 'year'))
                        .text("yearly")
                        .on("click", function() {
                            if (showYearly && !$(this).hasClass('active')) {
                                loadData_(viz, 'year');
                                update_controls($(this));
                            }
                        }
                    );
                }

                // add a clearer and styles to ensure graphs on their own line
                $row.insert("div", ":first-child")
                    .attr('style', 'clear:both');
                $row.attr('style', "width: 100%");
            };
        };

        return $row;
    };


    /**
     * Extract the date from the source
     * @param level (day|month|year)
     * @param d the datum
     * @return {Date}
     */
    var getDate_ = function(level, d) {
        switch (level) {
            case 'year':
                return new Date(d.year, 0, 1);
            case 'month':
                // js Date indexes months at 0
                return new Date(d.year, d.month - 1, 1);
            case 'day':
                // js Date indexes months at 0
                return new Date(d.year, d.month - 1, d.day);
        }
    };


    /**
     * Format the date for display
     * @param level (day|month|year)
     * @param d the datum
     * @return {String}
     */
    var getFormattedDate_ = function(level, d) {
        switch (level) {
            case 'year':
                return d3.time.format("%Y")(getDate_(level, d));
            case 'month':
                return d3.time.format("%b %y")(getDate_(level, d));
            case 'day':
                return d3.time.format("%d %b %y")(getDate_(level, d));
        }
    };


    /**
     * Extract the data from the source.
     * @param {string} level (day|month|year)
     * @param {Object} source
     * @return {Array} Metrics
     */
    var getData_ = function(level, source) {
        switch (level) {
            case 'year':
                return source.by_year;
            case 'month':
                return source.by_month;
            case 'day':
                return source.by_day;
        }
    };

    /**
     * Returns a d3 timeInterval for date operations.
     * @param {string} level (day|month|year
     * @return {Object} d3 time Interval
     */
    var getTimeInterval_ = function(level) {
        switch (level) {
            case 'year':
                return d3.time.year.utc;
            case 'month':
                return d3.time.month.utc;
            case 'day':
                return d3.time.day.utc;
        }
    };


    /**
     * The basic general set up of the graph itself
     * @param {JQueryElement} chartDiv The div where the chart should go
     * @param {Object} sources
     * @return {Object}
     */
    var getViz_ = function(chartDiv, sources) {
        var viz = {};

        // size parameters
        viz.margin = {top: 20, right: 20, bottom: 90, left: 50};
        viz.width = 600 - viz.margin.left - viz.margin.right;
        viz.height = 300 - viz.margin.top - viz.margin.bottom;


        // div where everything goes
        viz.chartDiv = chartDiv;

        // sources data
        viz.sources = sources;

        // just for record keeping
        viz.name = sources.name;

        viz.x = d3.scaleTime()
                .domain(d3.extent(eventdate, function(d){ return parseDate(d); }))
                .range([0,viz.width])
                .nice(d3.timeMonth);

        viz.y = d3.scaleLinear()
                .domain([0, d3.max(newECArray)])
                .rangeRound([viz.height,0]);

        viz.z = d3.scale.ordinal();
        viz.z.range(['main', 'alt']);

        // the chart
        viz.svg = viz.chartDiv.append("svg")
            .attr("width", viz.width + viz.margin.left + viz.margin.right)
            .attr("height", viz.height + viz.margin.top + viz.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + viz.margin.left + "," + viz.margin.top + ")");


        // draw the bars g first so it ends up underneath the axes
        viz.bars = viz.svg.append("g");

        // and the shadow bars on top for the tooltips
        viz.barsForTooltips = viz.svg.append("g");

        viz.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (viz.height - 1) + ")");

        viz.svg.append("g")
            .attr("class", "y axis");

        return viz;
    };


    /**
     * Takes in the basic set up of a graph and loads the data itself
     * @param {Object} viz AlmViz object
     * @param {string} level (day|month|year)
     */
    var loadData_ = function(viz, level) {
        var level_data = getData_(level, viz.sources);
        var timeInterval = getTimeInterval_(level);

        var end_date = new Date();
        // use only first 29 days if using day view
        // close out the year otherwise
        if (level == 'day') {
            end_date = timeInterval.offset(pub_date, 29);
        } else {
            end_date = d3.time.year.utc.ceil(end_date);
        }

        //
        // Domains for x and y
        //
        // a time x axis, between pub_date and end_date
        viz.x.domain([timeInterval.floor(pub_date), end_date]);

        // a linear axis from 0 to max value found
        viz.y.domain([0, d3.max(newECArray)]);

        //
        // Axis
        //
        // a linear axis between publication date and current date
        viz.xAxis = d3.svg.axis()
            .scale(viz.x)
            .tickSize(0)
            .ticks(0);

        // a linear y axis between 0 and max value found in data
        viz.yAxis = d3.svg.axis()
            .scale(viz.y)
            .orient("left")
            .tickSize(0)
            .tickValues([d3.max(viz.y.domain())])   // only one tick at max
            .tickFormat(d3.format(",d"));

        //
        // The chart itself
        //

        // TODO: these transitions could use a little work
        var barWidth = Math.max((viz.width/(timeInterval.range(pub_date, end_date).length + 1)) - 2, 1);

        var barsForTooltips = viz.barsForTooltips.selectAll(".barsForTooltip")
            .data(level_data, function(d) { return getDate_(level, d); });

        barsForTooltips
            .exit()
            .remove();

        var bars = viz.bars.selectAll(".bar")
            .data(level_data, function(d) { return getDate_(level, d); });

        bars
            .enter().append("rect")
            .attr("class", function(d) { return "bar " + viz.z((level == 'day' ? d3.time.weekOfYear(getDate_(level, d)) : d.year)); })
            .attr("y", viz.height)
            .attr("height", 0);

        bars
            .attr("x", function(d) { return viz.x(getDate_(level, d)) + 2; }) // padding of 2, 1 each side
            .attr("width", barWidth);

        bars.transition()
            .duration(1000)
            .attr("width", barWidth)
            .attr("y", function(d) { return viz.y(d[category.name]); })
            .attr("height", function(d) { return viz.height - viz.y(d[category.name]); });

        bars
            .exit().transition()
            .attr("y", viz.height)
            .attr("height", 0);

        bars
            .exit()
            .remove();

        viz.svg
            .select(".x.axis")
            .call(viz.xAxis);

        viz.svg
            .transition().duration(1000)
            .select(".y.axis")
            .call(viz.yAxis);

        barsForTooltips
            .enter().append("rect")
            .attr("class", function(d) { return "barsForTooltip " + viz.z((level == 'day' ? d3.time.weekOfYear(getDate_(level, d)) : d.year)); });

        barsForTooltips
            .attr("width", barWidth + 2)
            .attr("x", function(d) { return viz.x(getDate_(level, d)) + 1; })
            .attr("y", function(d) { return viz.y(d[category.name]) - 1; })
            .attr("height", function(d) { return viz.height - viz.y(d[category.name]) + 1; });


        // add in some tool tips
        viz.barsForTooltips.selectAll("rect").each(
            function(d,i){
                $(this).tooltip('destroy'); // need to destroy so all bars get updated
                $(this).tooltip({title: formatNumber_(d[category.name]) + " in " + getFormattedDate_(level, d), container: "body"});
            }
        );
    }
};
