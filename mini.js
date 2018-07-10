var miniViz = d3.select("body").append("svg")
                .attr('height', "100%")
                .attr("width", "100%");

miniViz.selectAll("rect")
    .data([6])
    .enter().append("rect")
        .attr("fill", "#CECCCC")
        .attr("height", "100")
        .attr("width", "400")
        .attr("x", "0")
        .attr("y", "0");

miniViz.append("text")
    .attr("x", "20")
    .attr("y", "20")
    .text("hello world");