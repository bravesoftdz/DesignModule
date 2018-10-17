/**
 * ModuleControlView is awindow to display a list of server side modules.
 */

/* globals L, d3 */

import './moduleControl.css';
import WindowView from '../../core/window/windowView';
import moduleControlHtml from './moduleControl.html';
import ModuleControlItemView from './moduleControlItemView';

var ModuleControlView = WindowView.extend({
    
    onInitialize: function (opts) {
        if (!opts) throw new Error('No arguments are provided to the View');
        if (!opts.moduleControlViewModel) throw new Error('moduleControlViewModel is not provided');

        WindowView.prototype.onInitialize.call(
            this, 
            L.extend({ 
                class: 'module-control-view',
                title: 'Modules',
                minWidth: 350,
                maxWidth: 500,
                width: 400,
                height: 400
            }, opts)
        );

        this._moduleControlViewModel = opts.moduleControlViewModel;
    },

    onRenderWindow: function (viewport) {
        viewport.innerHTML = moduleControlHtml;

        var moduleControlList = d3.select(viewport).select('.module-control-list').node();
        L.DomEvent.disableClickPropagation(moduleControlList);
        L.DomEvent.disableScrollPropagation(moduleControlList);

        var moduleControlEmptyText = d3.select(viewport).select('.module-control-empty').node();
        L.DomEvent.disableClickPropagation(moduleControlEmptyText);
        L.DomEvent.disableScrollPropagation(moduleControlEmptyText);

        this._moduleItems = {};

        this._addModuleItems({ models: this._moduleControlViewModel.models });
        this._updateModuleItemsListVisibility();
        
        this._moduleControlViewModel.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.on('add', this._addModuleItems, this);
        this._moduleControlViewModel.on('remove', this._removeModuleItems, this);
    },

    onRemoveWindow: function () {
        this._moduleControlViewModel.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.off('add', this._addModuleItems, this);
        this._moduleControlViewModel.off('remove', this._removeModuleItems, this);

        this._removeModuleItems({ models: this._moduleControlViewModel.models });
    },

    _onCloseBtnClicked: function () {
        this.hide();
    },

    _addModuleItems: function (data) {
        if (!data || !Array.isArray(data.models)) return;

        var modules = data.models;
        var moduleItems = this._moduleItems;
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var moduleControlList = moduleControl.select('.module-control-list').node();
        
        modules.forEach(function (module) {
            if (moduleItems[module.id]) return;

            var moduleItemView = new ModuleControlItemView({
                parent: moduleControlList,
                moduleControlItemModel: module
            });

            moduleItems[module.id] = moduleItemView;
        });
    },

    _removeModuleItems: function (data) {
        if (!data || !data.models) return;

        var modules = data.models;
        var moduleItems = this._moduleItems;
        
        modules.forEach(function (module) {
            var moduleItemView = moduleItems[module.id];
            if (!moduleItemView) return;

            delete moduleItems[module.id];
            moduleItemView.remove();
        });
    },

    _updateModuleItemsListVisibility: function () {
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var modules = this._moduleControlViewModel.models;

        moduleControl.select('.module-control-empty')
            .classed('hidden', modules.length > 0);

        moduleControl.select('.module-control-list')
            .classed('hidden', modules.length === 0);
    }

});

export default ModuleControlView;
