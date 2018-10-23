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
        moduleControlReadyList.addEventListener('touchstart',  function (e) { e.stopPropagation(); });

        var moduleControlBusyList = d3.select(viewport).select('.module-control-busy-list').node();
        L.DomEvent.disableClickPropagation(moduleControlBusyList);
        L.DomEvent.disableScrollPropagation(moduleControlBusyList);
        moduleControlBusyList.addEventListener('touchstart',  function (e) { e.stopPropagation(); });

        this._readyModuleItems = {};
        this._busyModuleItems = {};

        this._addReadyModuleItems({ models: this._moduleControlViewModel.readyModules.models });
        this._addBusyModuleItems({ models: this._moduleControlViewModel.busyModules.models });
        this._updateModuleItemsListVisibility();
        
        this._moduleControlViewModel.readyModules.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.readyModules.on('add', this._addReadyModuleItems, this);
        this._moduleControlViewModel.readyModules.on('remove', this._removeReadyModuleItems, this);

        this._moduleControlViewModel.busyModules.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.busyModules.on('add', this._addBusyModuleItems, this);
        this._moduleControlViewModel.busyModules.on('remove', this._removeBusyModuleItems, this);
    },

    onRemoveWindow: function () {
        this._moduleControlViewModel.readyModules.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.readyModules.off('add', this._addReadyModuleItems, this);
        this._moduleControlViewModel.readyModules.off('remove', this._removeReadyModuleItems, this);

        this._moduleControlViewModel.busyModules.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.busyModules.off('add', this._addBusyModuleItems, this);
        this._moduleControlViewModel.busyModules.off('remove', this._removeBusyModuleItems, this);

        this._removeReadyModuleItems({ models: this._moduleControlViewModel.readyModules.models });
        this._removeBusyModuleItems({ models: this._moduleControlViewModel.busyModules.models });
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

    _addBusyModuleItems: function (data) {
        if (!data || !Array.isArray(data.models)) return;

        var modules = data.models;        
        var moduleControl = d3.select(this.viewportElement()).select('.module-control');
        var moduleControlList = moduleControl.select('.module-control-busy-list').node();
        var moduleItems = this._busyModuleItems;
        
        this._addModuleItems(modules, moduleControlList, moduleItems);
    },

    _removeBusyModuleItems: function (data) {
        if (!data || !data.models) return;

        var modules = data.models;
        var moduleItems = this._busyModuleItems;
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
        var busyModules = this._moduleControlViewModel.busyModules.models;

        moduleControl.select('.module-control-empty')
            .classed('hidden', readyModules.length > 0 || busyModules.length > 0 );

        moduleControl.select('.module-control-ready-list')
            .classed('hidden', readyModules.length === 0);

        moduleControl.select('.module-control-busy-list')
            .classed('hidden', busyModules.length === 0);
    }

});

export default ModuleControlView;
