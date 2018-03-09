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

    var data = options.paperbuzzStatsJson;

    // TODO: Fix to use parseDate
    // TODO: Fix to work when no pub date is available. Use earliest event
    // var year = data.metadata["published-online"]["date-parts"][0][0];
    // var month = data.metadata["published-online"]["date-parts"][0][1];
    // var day = data.metadata["published-online"]["date-parts"][0][2];
    var published_date = '2017-08-02'; // year+"-"+month+"-"+day;
    // var published_date = year+"-"+month+"-"+day;

    // extract publication date
    var pub_date = parseDate(published_date);

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

    sources = data.altmetrics_sources

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
            metricsFound_ = true;
            addSourceRow_(vizDiv, source);
        });

        // add a tooltip: this will be moved around when going in/out of a bar in a graph
        vizDiv.append("div")
            .attr("id", "paperbuzzTooltip")
            .style("opacity", 0);

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
    var addSourceRow_ = function(canvas, source) {
        var sourceRow, sourceTitle;

        // Build category html objects.
        sourceRow = canvas.append("div")
            .attr("class", "paperbuzz-source-row")
            .attr("style", "width: 100%; overflow: hidden;")
            .attr("id", "source-" + source.source_id);

        sourceTitle = sourceRow.append("h2")
            .attr("class", "paperbuzz-source-row-heading")
            .attr("id", "month-" + source)
            .text(source.source_id);

        addSource_(source, sourceRow)

        return sourceRow;
    };


    /**
     * Add source information to the passed category row element.
     * @param {Object} source
     * @param {Object} category
     * @param {JQueryObject} $sourceRow
     * @return {JQueryObject}
     */
    var addSource_ = function(source, $sourceRow) {
        var $row, $countLabel, $count,
            total = source.events_count;

        $row = $sourceRow
            .append("div")
            .attr("class", "paperbuzz-row")
            .attr("style", "float: left")
            .attr("id", "paperbuzz-row-" + source.source_id);

        $countLabel = $row.append("div")
            .attr("class", "paperbuzz-count-label");

        // if (hasIcon.indexOf(source.name) >= 0) {
        //     $countLabel.append("img")
        //         .attr("src", baseUrl_ + '/assets/' + source.name + '.png')
        //         .attr("alt", 'a description of the source')
        //         .attr("class", "label-img");
        // }

        // Check how to change this
        if (source.events_url) {
            // if there is an events_url, we can link to it from the count
            $count = $countLabel.append("a")
                .attr("href", function(d) { return source.events_url; });
        } else {
            // if no events_url, we just put in the count
            $count = $countLabel.append("span");
        }

        $count
            .attr("class", "paperbuzz-count")
            .attr("id", "paperbuzz-count-" + source.source_id)
            .text(formatNumber_(total));

        $countLabel.append("br");
        $countLabel.append("span")
            .text(source.display_name);

        // Only add a chart if the browser supports SVG
        if (hasSVG_) {
            var level = false;

            // check what levels we can show
            var showDaily = false;
            var showMonthly = false;
            var showYearly = false;

            if (source.events_count_by_year) {
                level_data = source.events_count_by_year;
                var yearTotal = level_data.reduce(function(i, d) { return i + d.count; }, 0);
                var numYears = d3.timeYear.range(pub_date, new Date()).length;

                if (yearTotal >= minItems_.minEventsForYearly &&
                    numYears >= minItems_.minYearsForYearly) {
                    showYearly = true;
                    level = 'year';
                };
            }

            if (source.events_count_by_month) {
                level_data = source.events_count_by_month;
                var monthTotal = level_data.reduce(function(i, d) { return i + d.count; }, 0);
                var numMonths = d3.timeMonth.range(pub_date, new Date()).length;

                if (monthTotal >= minItems_.minEventsForMonthly &&
                    numMonths >= minItems_.minMonthsForMonthly) {
                    showMonthly = true;
                    level = 'month';
                };
            }

            if (source.events_count_by_day){
                level_data = source.events_count_by_month;
                var dayTotal = level_data.reduce(function(i, d) { return i + d.count; }, 0);
                var numDays = d3.timeDay.range(pub_date, new Date()).length;

                if (dayTotal >= minItems_.minEventsForDaily && numDays >= minItems_.minDaysForDaily) {
                    showDaily = true;
                    level = 'day';
                };
            }


            // The level and level_data should be set to the finest level
            // of granularity that we can show
            timeInterval = getTimeInterval_(level);

            // check there is data for
            if (showDaily || showMonthly || showYearly) {
                var $chartDiv = $row.append("div")
                    .attr("style", "width: 70%; float:left;")
                    .attr("class", "paperbuzz-chart-area");

                var viz = getViz_($chartDiv, source);
                loadData_(viz, level);

                var update_controls = function(control) {
                    control.siblings('.paperbuzz-control').removeClass('active');
                    control.addClass('active');
                };

                var $levelControlsDiv = $chartDiv.append("div")
                    .attr("style", "width: " + (viz.margin.left + viz.width) + "px;")
                    .append("div")
                    .attr("style", "float:right;");

                if (showDaily) {
                    $levelControlsDiv.append("a")
                        .attr("href", "javascript:void(0)")
                        .classed("paperbuzz-control", true)
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
                        .classed("paperbuzz-control", true)
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
                        .classed("paperbuzz-control", true)
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
        var parseString = ''
        if (level == 'year') {
            parseString = '%Y';
        } else if (level == 'month') {
            parseString = '%Y-%m';
        } else if (level == 'day') {
            parseString = '%Y-%m-%d';
        }
        return d3.timeParse(parseString)(d.date);

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
                return source.events_count_by_year;
            case 'month':
                return source.events_count_by_month;
            case 'day':
                return source.events_count_by_day;
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
                return d3.timeYear;
            case 'month':
                return d3.timeMonth;
            case 'day':
                return d3.timeDay;
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
        viz.name = sources.source_id;

        viz.x = d3.scaleTime()
                .range([0,viz.width])
                .nice(d3.timeMonth);

        viz.y = d3.scaleLinear()
                .rangeRound([viz.height,0]);

        viz.z = d3.scaleOrdinal();
        viz.z.range(['main', 'alt']);

        // the chart
        viz.svg = viz.chartDiv.append("svg")
            .attr("width", viz.width + viz.margin.left + viz.margin.right)
            .attr("height", viz.height + viz.margin.top + viz.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + viz.margin.left + "," + viz.margin.top + ")");


        // draw the bars g first so it ends up underneath the axes
        viz.bars = viz.svg.append("g");

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
            end_date = d3.timeYear.ceil(end_date);
        }

        //
        // Domains for x and y
        //
        // a time x axis, between pub_date and end_date
        viz.x.domain([timeInterval.floor(pub_date), end_date]);

        // a linear axis from 0 to max value found
        viz.y.domain([0, d3.max(level_data, function(d) { return d.count; })]);

        //
        // Axis
        //
        var yAxis = d3.axisLeft(viz.y)
                .tickValues([d3.max(viz.y.domain())]);
        
        var ticks;
        if (level == 'day') {
            ticks = d3.timeDay.every(4);
        } else if (level == 'month') {
            ticks = d3.timeMonth.every(2);
        } else {
            ticks = d3.timeYear.every(1)
        }
        var xAxis = d3.axisBottom(viz.x)
                        .ticks(ticks);

        //
        // The chart itself
        //

        // TODO: these transitions could use a little work
        var barWidth = Math.max((viz.width/(timeInterval.range(pub_date, end_date).length + 1)) - 2, 1);

        var bars = viz.bars.selectAll(".bar")
            .data(level_data, function(d) { return getDate_(level, d); });

        bars
            .enter().append("rect")
            .attr("class", function(d) { return "bar " + viz.z((level == 'day' ? d3.timeWeek(getDate_(level, d)) : d.year)); })
            .attr("x", function(d) { return viz.x(getDate_(level, d)) + 2; }) // padding of 2, 1 each 
            .attr("y", function(d) { return viz.y(d.count) } )
            .attr("width", barWidth)
            .attr("height", function(d) { return viz.height - viz.y(d.count); })
            .on("mouseover", function(d) {
                tooltipDiv = d3.select("#paperbuzzTooltip");
                tooltipDiv.transition()
                    .duration(100)
                    .style("opacity", .9)
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 50 + "px");
                tooltipDiv.html("count: " + d.count + "<br>" + "date: " + d.date);
                })
            .on("mouseout", function(d) {
                tooltipDiv = d3.select("#paperbuzzTooltip");
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
                });

        bars
            .exit()
            .remove();

        viz.svg
            .select(".x.axis")
            .call(xAxis);

        viz.svg
            .transition().duration(1000)
            .select(".y.axis")
            .call(yAxis);
    }
};
