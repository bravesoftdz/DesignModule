/**
 * GraphLegendView represents a legend attached to a graph.
 */

/* globals L, d3 */ 

import './graphLegend.css';
import View from '../../core/view';

var GraphLegendView = View.extend({

    onInitialize: function (opts) {
        if (!opts.element) throw new Error('element is not provided');
        if (!opts.model) throw new Error('model is not provided');

        this.element = opts.element;
        this.model = opts.model;
    },   

    onRender: function () {
        L.DomEvent.disableClickPropagation(this.element);

        d3.select(this.element)
            .classed('hidden', !this._needToShow())
            .on('click touchend', this._notifyFocus.bind(this));

        this._redraw();

        this.model.on('entries', this._redraw, this);
        this.model.on('entries', this._adjustVisibility, this);

        return this.element;
    },

    onRemove: function () {
        d3.select(this.element).on('click touchend', null);

        this.model.off('entries', this._redraw, this);
        this.model.off('entries', this._adjustVisibility, this);
    },

    _redraw: function () {        
        function entryMarkerColor(d) { 
            return d.enabled ? d.color : 'rgba(0, 0, 0, 0)';
        }

        var entries = d3.select(this.element).selectAll('div.graph-legend-entry')
            .data(this.model.entries);

        entries.exit().remove();

        var newEntry = entries.enter().append('div')
            .attr('class', 'graph-legend-entry')
            .on('click touchend', this._notifyFocus.bind(this))
            .on('click touchend', this._notifyEntryClicked.bind(this));

        newEntry.append('div')
            .attr('class', 'graph-legend-entry-marker')
            .style('border-color', function (d) { return d.color; })
            .style('background-color', entryMarkerColor);

        newEntry.append('span')
            .attr('class', 'graph-legend-entry-text')
            .text(function (d) { return d.title; });

        entries.merge(newEntry).select('.graph-legend-entry-marker')
            .style('border-color', function (d) { return d.color; })
            .style('background-color', entryMarkerColor);

        entries.merge(newEntry).select('.graph-legend-entry-text')
            .text(function (d) { return d.title; });
    },

    _needToShow: function () {
        return this.model.entries.length > 1;
    },

    _adjustVisibility: function () {
        if (this._needToShow()) {
            this.show();
        } else {
            this.hide();
        }
    },

    _notifyEntryClicked: function (entry) {
        this.fire('entryClicked', { entry: entry });
    }

});

export default GraphLegendView;
