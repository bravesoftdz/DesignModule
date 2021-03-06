
function LineBottomLeft(graphObject) {
    this.graphObject = graphObject;
    this.visible = false;
    graphObject.preview = {};
    this.graphID = graphObject.id;
    this.previewDiv = null;
    this.Initialize = function (container) {
        var width = this.graphObject.width - GraphManager.defaultValues.axisMargin.y;
        var height = this.graphObject.height - GraphManager.defaultValues.axisMargin.x;
        var marginLeft = GraphManager.defaultValues.graphPadding.left + GraphManager.defaultValues.axisMargin.y;
        var marginTop = GraphManager.defaultValues.graphPadding.top;

        if (this.graphObject.x.set)
            {
                this.graphObject.minX = this.graphObject.x.min;
                this.graphObject.maxX = this.graphObject.x.max;
            }

        var ySet = false;
        var minY = Number.POSITIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;
        for (var i = 0; i < this.graphObject.y.length; i++)
            if (this.graphObject.y[i].set)
            {
                ySet = true;
                if (graphObject.y[i].min < minY)
                    minY = graphObject.y[i].min;
                if (graphObject.y[i].max > maxY)
                    maxY = graphObject.y[i].max;
            }
        if (ySet && minY != Number.POSITIVE_INFINITY && maxY != Number.NEGATIVE_INFINITY)
        {
            this.graphObject.minY = minY;
            this.graphObject.maxY = maxY;
        }

        var svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.className = "graph-svg";

        if (this.graphObject.clickable != clickOptions.none) {
            svg.on("click", this.onsvgclick);
        }

        var clipPath = svg.append("clipPath")
            .attr("id", "clip" + this.graphID);

        var clipShape = clipPath.append("rect");

        var lineG = svg.append("g")
            .attr("clip-path", "url(#clip" + this.graphID + ")");
        
        var text = null;

        if (typeof this.graphObject.name !== "undefined") {
            text = svg.append("text")
                .attr("x", width / 2)
                .attr("y", marginTop)
                .attr("dy", 20 - GraphManager.defaultValues.graphPadding.top)
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
                .attr("class", "graph-title-text")
                .style("font-size", "16px")
                .text(this.graphObject.name);
        }

        //generate x axis;
        var axisX = svg.append("g")
            .attr("class", "axis xAxis");
        this.graphObject.axisX = axisX;
        if (this.graphObject.x.label != "") {
            var axisXLabel = svg.append("text")
                .attr("class", "axisLabel xAxisLabel")
                .text(this.graphObject.x.label);
            this.graphObject.axisXLabel = axisXLabel;
        }

        //generate y axis
        var axisY = svg.append("g")
            .attr("class", "axis yAxis");
        this.graphObject.axisY = axisY;
        if (this.graphObject.y[0].label != "") { // todo: check to see if there are different labels -> label lines instead of axis!
            var axisYLabel = svg.append("text")
                .attr("class", "axisLabel yAxisLabel")
                .text(this.graphObject.y[0].label);
            this.graphObject.axisYLabel = axisYLabel;
        }


        this.graphObject.container = container;
        this.graphObject.svg = svg;

        var data = graphObject.data;
        this.graphObject.data = [];
        this.graphObject.displayData = [];
        for (var i = 0; i < this.graphObject.y.length; i++) {
            this.graphObject.data.push([]);
            this.graphObject.displayData.push([]);
        }


        if (data) {
            GraphManager.AddGraphData(this.graphObject, data);
        }
        this.graphObject.lineG = lineG;
        this.graphObject.text = text;
        this.graphObject.clipPath = clipPath;
        this.graphObject.clipShape = clipShape;

        container.style.visibility = "hidden";
        container.graph = this;
        this.Update();
    };

    this.Reset = function () {
        this.graphObject.data = [];
        this.graphObject.displayData = [];
        if (this.graphObject.holdminmax) 
            delete this.graphObject.holdvalues;
        for (var i = 0; i < this.graphObject.y.length; i++) {
            this.graphObject.data.push([]);
            this.graphObject.displayData.push([]);
        }
        this.Update();
    };

    this.onsvgclick = function (e) {
        var xScale = this.graphObject.Scales.x;
        var yScale = this.graphObject.Scales.y;

        var relativePos = d3.mouse(this.graphObject.svg[0][0]);

        if (relativePos[0] < xScale.range()[0] || relativePos[0] > xScale.range()[1])
            return;

        if (relativePos[1] < yScale.range()[1] || relativePos[1] > yScale.range()[0])
            return;
        
        if (this.graphObject.data.length > 0 && this.graphObject.data[0].length > 0) {
            var closest = null;
            var distance = Number.MAX_VALUE;
            for (var i = 0; i < this.graphObject.data.length; i++)
                for (var j = 0; j < this.graphObject.data[i].length; j++) {
                    if (Math.abs(xScale(graphObject.data[i][j].x.GetDisplayValue()) - relativePos[0]) < distance) {
                        closest = graphObject.data[i][j];
                        distance = Math.abs(xScale(graphObject.data[i][j].x.GetDisplayValue()) - relativePos[0]);
                    }
                }
            if (closest != null) {
                var siX = closest.x.value;
                var siY = closest.y.value;
                // todo: ??
                console.log(JSON.stringify({ wsSend: { query: { x: siX, y: siY } } }));
            }

        }

    },

    this.onsvgclick = this.onsvgclick.bind(this);

    this._UpdatePreview = function () {
        // todo: implement update for preview on reset of graph!
        if (this.previewDiv == null || this.graphObject.data == null || this.graphObject.data.length == 0)
            return;
        else {
            var found = false;
            for (var i = 0; i < this.graphObject.data.length; i++) {
                if (this.graphObject.data[i].length > 0)
                    found = true;
            }
            if (!found)
                return;
        }

        var graph = this.graphObject;

        var width = DataManager.detailsInfo.chartWidth;
        var height = DataManager.detailsInfo.chartHeight;

        var minX = graph.bounds.minX;
        var maxX = graph.bounds.maxX;
        var minY = graph.bounds.minY;
        var maxY = graph.bounds.maxY;

        var xScale;
        var yScale;

        switch (graph.xScale) {
            case "linear": xScale = d3.scale.linear().domain([minX, maxX]).range([DataManager.detailsInfo.graphMargin, width - DataManager.detailsInfo.graphMargin]);
                break;
            case "ordinal": xScale = d3.scale.ordinal().domain([minX, maxX]).range([DataManager.detailsInfo.graphMargin, width - DataManager.detailsInfo.graphMargin]);
                break;
            case "power": xScale = d3.scale.power().domain([minX, maxX]).range([DataManager.detailsInfo.graphMargin, width - DataManager.detailsInfo.graphMargin]);
                break;
            case "log": xScale = d3.scale.log().domain([minX, maxX]).range([DataManager.detailsInfo.graphMargin, width - DataManager.detailsInfo.graphMargin]);
                break;
            case "time": xScale = d3.time.scale().domain([minX, maxX]).range([DataManager.detailsInfo.graphMargin, width - DataManager.detailsInfo.graphMargin]);
                break;
        }

        switch (graph.yScale) {
            case "linear": yScale = d3.scale.linear().domain([minY, maxY]).range([height - DataManager.detailsInfo.graphMargin, DataManager.detailsInfo.graphMargin]);
                break;
            case "ordinal": yScale = d3.scale.ordinal().domain([minY, maxY]).range([height - DataManager.detailsInfo.graphMargin, DataManager.detailsInfo.graphMargin]);
                break;
            case "power": yScale = d3.scale.power().domain([minY, maxY]).range([height - DataManager.detailsInfo.graphMargin, DataManager.detailsInfo.graphMargin]);
                break;
            case "log": yScale = d3.scale.log().domain([minY, maxY]).range([height - DataManager.detailsInfo.graphMargin, DataManager.detailsInfo.graphMargin]);
                break;
            case "time": yScale = d3.time.scale().domain([minY, maxY]).range([height - DataManager.detailsInfo.graphMargin, DataManager.detailsInfo.graphMargin]);
                break;
        }


        graph.preview.clipShape
            .attr("x", DataManager.detailsInfo.graphMargin)
            .attr("y", DataManager.detailsInfo.graphMargin)
            .attr("width", width - (2 * DataManager.detailsInfo.graphMargin))
            .attr("height", height - (2 * DataManager.detailsInfo.graphMargin));

        graph.preview.lineG.selectAll("path").remove();

        var lineFunction = d3.svg.line()
            .defined(function (d) { return d; })
            .x(function (d) { return xScale(d.x.GetDisplayValue()); }) 
            .y(function (d) { return yScale(d.y.GetDisplayValue()); }) 
            .interpolate(graph.interpolation);

        for (var g = 0; g < graph.y.length; g++) {

            graph.preview.lineG.append("path")
                .attr("d", lineFunction(graph.displayData[g]))
                .attr("class", "graphLine")
                .attr("stroke", graph.y[g].color)
                .attr('stroke-width', 2)
                .attr("fill", "none");
        }
    };

    this.GetPreview = function (container) {

        if (this.previewDiv != null)
            return container.appendChild(this.previewDiv);


        var previewContainer = container.appendChild(document.createElement("div"));
        previewContainer.className = "detailContainer graphDetails";
        previewContainer.style.width = DataManager.detailsInfo.chartWidth + "px";
        previewContainer.style.height = DataManager.detailsInfo.elementHeight + "px";

        this.previewDiv = previewContainer;
        previewContainer.graph = this;

        previewContainer.addEventListener("click", this._clickEvent);

        var title = previewContainer.appendChild(document.createElement("h4"));
        title.className = "detailTitle graphDetailTitle";
        title.textContent = this.graphObject.name;
        title.style.width = DataManager.detailsInfo.elementWidth + "px";

        var svgContainer = previewContainer.appendChild(document.createElement("div"));
        svgContainer.className = "preview-svg-container";
        svgContainer.style.width = DataManager.detailsInfo.chartWidth + "px";
        svgContainer.style.height = DataManager.detailsInfo.chartHeight + "px";

        var svg = d3.select(svgContainer).append("svg")
            .attr("width", DataManager.detailsInfo.chartWidth)
            .attr("height", DataManager.detailsInfo.chartHeight);

        svg.className = "graph-svg-preview";

        var clipPath = svg.append("clipPath")
            .attr("id", "preview-clip" + this.graphID);

        var clipShape = clipPath.append("rect");


        var lineG = svg.append("g")
            .attr("clip-path", "url(#preview-clip" + this.graphID + ")");

        lineG.className = "graph-g-preview";
        
        this.graphObject.preview.container = previewContainer;
        this.graphObject.preview.svg = svg;
        this.graphObject.preview.lineG = lineG;
        this.graphObject.preview.clipPath = clipPath;
        this.graphObject.preview.clipShape = clipShape;

        this._UpdatePreview();

    };
    this.Update = function (data) {
        var graph = this.graphObject;


        //sets data and displaydata
        if (typeof data !== "undefined")
            GraphManager.AddGraphData(graph, data);

        var width = graph.container.clientWidth;
        var height = graph.container.clientHeight;
        var marginLeft = GraphManager.defaultValues.graphPadding.left + GraphManager.defaultValues.axisMargin.y;
        var marginTop = GraphManager.defaultValues.graphPadding.top;
        var marginRight = GraphManager.defaultValues.graphPadding.right;
        var marginBottom = GraphManager.defaultValues.graphPadding.bottom + GraphManager.defaultValues.axisMargin.x;


        graph.axisX.attr("transform", "translate(" + 0 + ", " + (height - marginBottom) + ")");

        graph.axisY.attr("transform", "translate(" + marginLeft + ", " + 0 + ")");

        //sets the labels //todo possible to remove this from Update and add it to initialization and resizing;
        if (typeof graph.axisXLabel !== "undefined") {
            var yTransform = height - (marginBottom + GraphManager.defaultValues.axisTextPadding);

            graph.axisXLabel.attr("text-anchor", "end");
            graph.axisXLabel.attr("x", width - marginRight);
            graph.axisXLabel.attr("y", yTransform);
        }
        if (typeof graph.axisYLabel !== "undefined") {
            var xTransform = marginLeft + GraphManager.defaultValues.axisTextPadding;
            var rotation = 90;

            graph.axisYLabel.attr("text-anchor", "start");
            graph.axisYLabel.attr("x", xTransform);
            graph.axisYLabel.attr("y", marginTop);
            graph.axisYLabel.attr("transform", "rotate(" + rotation + "," + xTransform + "," + marginTop + ")");
        }

        graph.svg.attr("width", width);
        graph.svg.attr("height", height);

        if (graph.text != null)
            graph.text.attr("x", width / 2);

        //gets the data to display
        var displayData = graph.displayData;

        //sets min/max values
        var minX = (typeof graph.minX === "undefined") ? d3.min(displayData, function (d) {
            return d3.min(d, function (p) {
                if (p)
                    return p.x.GetDisplayValue();
                return null;
            });
        }) : graph.minX;
        var maxX = (typeof graph.maxX === "undefined") ? d3.max(displayData, function (d) {
            return d3.max(d, function (p) {
                if (p)
                    return p.x.GetDisplayValue();
                return null;
            });
        }) : graph.maxX;
        var minY = (typeof graph.minY === "undefined") ? d3.min(displayData, function (d) {
            return d3.min(d, function (p) {
                if (p)
                    return p.y.GetDisplayValue();
                return null;
            });
        }) : graph.minY;
        var maxY = (typeof graph.maxY === "undefined") ? d3.max(displayData, function (d) {
            return d3.max(d, function (p) {
                if (p)
                    return p.y.GetDisplayValue();
                return null;
            });
        }) : graph.maxY;


        if(!(typeof graph.graphAxisMinY === "undefined") && !(typeof graph.graphAxisMaxY === "undefined")) 
        {
            minY = graph.graphAxisMinY;
            maxY = graph.graphAxisMaxY;
        }
        else
        {
            if (graph.holdminmax) {
                if (typeof graph.holdvalues === "undefined") { //todo fix possible missed values when new data.length > maxPoints
                    graph.holdvalues = {
                        minY: minY,
                        maxY: maxY
                    };
                }
                else {
                    minY = (minY > graph.holdvalues.minY) ? graph.holdvalues.minY : minY;
                    maxY = (maxY < graph.holdvalues.maxY) ? graph.holdvalues.maxY : maxY;
                }
            }
        }
        
        if (minX == maxX) {
            minX--;
            maxX++;
        }
        if (minY == maxY) {
            minY--;
            maxY++;
        }


        graph.bounds = {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        };

        var xScale;
        var yScale;

        switch (graph.xScale) {
            case "linear": xScale = d3.scale.linear().domain([minX, maxX]).range([marginLeft, width - marginRight]).nice();
                break;
            case "ordinal": xScale = d3.scale.ordinal().domain([minX, maxX]).range([marginLeft, width - marginRight]).nice();
                break;
            case "power": xScale = d3.scale.power().domain([minX, maxX]).range([marginLeft, width - marginRight]).nice();
                break;
            case "log": xScale = d3.scale.log().domain([minX, maxX]).range([marginLeft, width - marginRight]).nice();
                break;
            case "time": xScale = d3.time.scale().domain([minX, maxX]).range([marginLeft, width - marginRight]).nice();
                break;
        }

        switch (graph.yScale) {
            case "linear": yScale = d3.scale.linear().domain([minY, maxY]).range([height - marginBottom, marginTop]);
                break;
            case "ordinal": yScale = d3.scale.ordinal().domain([minY, maxY]).range([height - marginBottom, marginTop]);
                break;
            case "power": yScale = d3.scale.power().domain([minY, maxY]).range([height - marginBottom, marginTop]);
                break;
            case "log": yScale = d3.scale.log().domain([minY, maxY]).range([height - marginBottom, marginTop]);
                break;
            case "time": yScale = d3.time.scale().domain([minY, maxY]).range([height - marginBottom, marginTop]);
                break;
        }

        graph.Scales = { x: xScale, y: yScale };

        var xAxis = d3.svg.axis().scale(xScale).orient(graph.xAxisOrient).ticks(5);
        if(graph.xScale === 'time')
            xAxis.tickFormat(d3.time.format("%H:%M"));
        graph.axisX.call(xAxis);


        var yAxis = d3.svg.axis().scale(yScale).orient(graph.yAxisOrient).ticks(5);
        if(graph.yScale === 'time')
            yAxis.tickFormat(d3.time.format("%H:%M"));
        graph.axisY.call(yAxis);

        graph.clipShape
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - (marginLeft + marginRight))
            .attr("height", height - (marginTop + marginBottom));

        graph.lineG.selectAll("path").remove();

        graph.lineG.on('mouseleave', function () {
            d3.select(graph.container).select('.tooltipcontainer').remove();
            d3.select(graph.container).select('.tooltip').remove();
        });

        var lineFunction = d3.svg.line()
            .defined(function (d) { return d; })
            .x(function (d) {
                return xScale(d.x.GetDisplayValue()); 
            })
            .y(function (d) {
                return yScale(d.y.GetDisplayValue()); 
            })
            .interpolate(graph.interpolation);

        graph.lineG.selectAll(".line-graph-avg-line").remove();

        for (var i = 0; i < graph.y.length; i++) {
            var name;
            if (graph.y[i].name) {
                name = graph.y[i].name;
            } else {
                name = false;
            }

            graph.lineG.append("path")
                .attr("d", lineFunction(displayData[i]))
                .attr("class", "graphLine")
                .attr("stroke", graph.y[i].color)
                .attr("stroke-width", 3)
                .attr("fill", "none")
                .attr("name", name);

            //Average line computation
            if(graph.showAvgLine) 
            {
                var yValAvg = this._calculateAverageY(displayData[i]);
                if(yValAvg != -1)
                {
                    var yVal = yScale(yValAvg);
                    graph.lineG.append('line')
                        .attr('class', 'line-graph-avg-line')
                        .style('stroke', graph.y[i].color)
                        .style('stroke-dasharray', ('5, 5'))
                        .style('stroke-width', 2)
                        .attr('visibility', 'visible')
                        .attr('x1', 0)
                        .attr('y1', yVal)
                        .attr('x2', width)
                        .attr('y2', yVal);
                }
            }

        }

        d3.select(graph.container).select('svg').select('g').selectAll('path').on('mousemove', mMove);
        function mMove() {
            var tooltipContainer;
            var tooltip;
            if (d3.select('.tooltipcontainer').empty()) {
                tooltipContainer = d3.select(graph.container).select('svg').select('g').append("rect").attr("class", "tooltipcontainer").style("opacity", 1);
                tooltip = d3.select(graph.container).select('svg').select('g').append("text").attr("class", "tooltip").style("opacity", 1);
            } else {
                tooltipContainer = d3.select('.tooltipcontainer');
                tooltip = d3.select('.tooltip');
            }
            var m = d3.mouse(this);
            tooltip
                .attr('x', event.offsetX)
                .attr('y', event.offsetY)
                .style("fill", "#fff")
                .style("font-size", "10px")
                .text(this.attributes.name.value)
                .style('cursor', 'pointer')
                .style("text-anchor", "end");
            tooltipContainer
                .style('opacity', 1)
                .style('border-radius', '5')
                .style("fill", this.attributes.stroke.value)
                .attr('width', tooltip[0][0].getBoundingClientRect().width + 20)
                .attr('height', tooltip[0][0].getBoundingClientRect().height + 8)
                .attr('x', event.offsetX - (tooltip[0][0].getBoundingClientRect().width + 10))
                .attr('y', event.offsetY - tooltip[0][0].getBoundingClientRect().height);
        }
        this._UpdatePreview();
    };

    this._calculateAverageY = function (data) {
        var total = 0;
        for(var i = 0; i < data.length; i++)
        {
            total += data[i].y.GetDisplayValue();
        }
        if(total != 0)
            return total/data.length;
        else
            return -1;
    };

    this._clickEvent = function (e) {
        var graph = e.currentTarget.graph;

        if (graph.visible) {
            graph._closeGraph();
        }
        else {
            graph._openGraph();
        }
    };

    this.ShowGraph = function () {
        this._openGraph();
    };

    this.HideGraph = function () {
        this._closeGraph();
    };

    this._closeGraph = function () {
        this.visible = false;
        GraphManager.RemoveGraph(this.graphID);
        L.DomUtil.removeClass(this.previewDiv, "chartPreviewActive");
    };

    this._openGraph = function () {
        this.visible = true;
        this._resetSize();
        GraphManager.AddGraph(this.graphObject.container);
        L.DomUtil.addClass(this.previewDiv, "chartPreviewActive");
    };

    this._resetSize = function () {
        var changed = false;
        if (parseInt(this.graphObject.container.style.width) != this.graphObject.width) {
            this.graphObject.container.style.width = this.graphObject.width + "px";
            changed = true;
        }
        if (parseInt(this.graphObject.container.style.height) != this.graphObject.height) {
            this.graphObject.container.style.height = this.graphObject.height + "px";
            changed = true;
        }

        if (changed)
            this.Update();
    };
}
