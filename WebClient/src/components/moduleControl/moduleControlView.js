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

        var moduleControlReadyList = d3.select(viewport).select('.module-control-ready-list').node();
        L.DomEvent.disableClickPropagation(moduleControlReadyList);
        L.DomEvent.disableScrollPropagation(moduleControlReadyList);

        var moduleControlCalculatingList = d3.select(viewport).select('.module-control-calculating-list').node();
        L.DomEvent.disableClickPropagation(moduleControlCalculatingList);
        L.DomEvent.disableScrollPropagation(moduleControlCalculatingList);

        var moduleControlEmptyText = d3.select(viewport).select('.module-control-empty').node();
        L.DomEvent.disableClickPropagation(moduleControlEmptyText);
        L.DomEvent.disableScrollPropagation(moduleControlEmptyText);

        this._readyModuleItems = {};
        this._calculatingModuleItems = {};

        this._addReadyModuleItems({ models: this._moduleControlViewModel.readyModules.models });
        this._addCalculatingModuleItems({ models: this._moduleControlViewModel.calculatingModules.models });
        this._updateModuleItemsListVisibility();
        
        this._moduleControlViewModel.readyModules.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.readyModules.on('add', this._addReadyModuleItems, this);
        this._moduleControlViewModel.readyModules.on('remove', this._removeReadyModuleItems, this);

        this._moduleControlViewModel.calculatingModules.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.calculatingModules.on('add', this._addCalculatingModuleItems, this);
        this._moduleControlViewModel.calculatingModules.on('remove', this._removeCalculatingModuleItems, this);
    },

    onRemoveWindow: function () {
        this._moduleControlViewModel.readyModules.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.readyModules.off('add', this._addReadyModuleItems, this);
        this._moduleControlViewModel.readyModules.off('remove', this._removeReadyModuleItems, this);

        this._moduleControlViewModel.calculatingModules.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.calculatingModules.off('add', this._addCalculatingModuleItems, this);
        this._moduleControlViewModel.calculatingModules.off('remove', this._removeCalculatingModuleItems, this);

        this._removeReadyModuleItems({ models: this._moduleControlViewModel.readyModules.models });
        this._removeCalculatingModuleItems({ models: this._moduleControlViewModel.calculatingModules.models });
    },

    _onCloseBtnClicked: function () {
        this.hide();
    },

    _addReadyModuleItems: function (data) {
        if (!data || !Array.isArray(data.models)) return;

        var modules = data.models;        
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var moduleControlList = moduleControl.select('.module-control-ready-list').node();
        var moduleItems = this._readyModuleItems;
        
        this._addModuleItems(modules, moduleControlList, moduleItems);
    },

    _removeReadyModuleItems: function (data) {
        if (!data || !data.models) return;

        var modules = data.models;
        var moduleItems = this._readyModuleItems;
        this._removeModuleItems(modules, moduleItems);
    },

    _addCalculatingModuleItems: function (data) {
        if (!data || !Array.isArray(data.models)) return;

        var modules = data.models;        
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var moduleControlList = moduleControl.select('.module-control-calculating-list').node();
        var moduleItems = this._calculatingModuleItems;
        
        this._addModuleItems(modules, moduleControlList, moduleItems);
    },

    _removeCalculatingModuleItems: function (data) {
        if (!data || !data.models) return;

        var modules = data.models;
        var moduleItems = this._calculatingModuleItems;
        this._removeModuleItems(modules, moduleItems);
    },

    _addModuleItems: function (modules, moduleControlList, moduleItems) {
        modules.forEach(function (module) {
            if (moduleItems[module.id]) return;

            var moduleItemView = new ModuleControlItemView({
                parent: moduleControlList,
                moduleControlItemModel: module
            });

            moduleItems[module.id] = moduleItemView;
        });
    },

    _removeModuleItems: function (modules, moduleItems) {
        modules.forEach(function (module) {
            var moduleItemView = moduleItems[module.id];
            if (!moduleItemView) return;

            delete moduleItems[module.id];
            moduleItemView.remove();
        });
    },

    _updateModuleItemsListVisibility: function () {
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var readyModules = this._moduleControlViewModel.readyModules.models;
        var calculatingModules = this._moduleControlViewModel.calculatingModules.models;

        moduleControl.select('.module-control-empty')
            .classed('hidden', readyModules.length > 0 || calculatingModules.length > 0 );

        moduleControl.select('.module-control-ready-list')
            .classed('hidden', readyModules.length === 0);

        moduleControl.select('.module-control-calculating-list')
            .classed('hidden', calculatingModules.length === 0);
    }

});

export default ModuleControlView;
