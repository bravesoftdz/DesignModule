/**
 * ModuleControlView is awindow to display a list of server side modules.
 */

/* globals L, d3 */

import './moduleControl.css';
import WindowView from '../../../core/window/windowView';
import moduleControlHtml from './moduleControl.html';
import ModuleControlItemListView from './moduleControlItemList/ModuleControlItemListView';

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

        var moduleControlReadyListNode = d3.select(viewport).select('.module-control-ready-list').node();
        L.DomEvent.disableClickPropagation(moduleControlReadyListNode);
        L.DomEvent.disableScrollPropagation(moduleControlReadyListNode);
        moduleControlReadyListNode.addEventListener('touchstart',  function (e) { e.stopPropagation(); });

        this._moduleControlReadyItemsList = new ModuleControlItemListView({
            modules: this._moduleControlViewModel.readyModules,
            parent: moduleControlReadyListNode
        });

        var moduleControlBusyListNode = d3.select(viewport).select('.module-control-busy-list').node();
        L.DomEvent.disableClickPropagation(moduleControlBusyListNode);
        L.DomEvent.disableScrollPropagation(moduleControlBusyListNode);
        moduleControlBusyListNode.addEventListener('touchstart',  function (e) { e.stopPropagation(); });

        this._moduleControlBusyItemsList = new ModuleControlItemListView({
            modules: this._moduleControlViewModel.busyModules,
            parent: moduleControlBusyListNode
        });

        this._updateModuleItemsListVisibility();
        
        this._moduleControlViewModel.readyModules.on('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.busyModules.on('change', this._updateModuleItemsListVisibility, this);
    },

    onRemoveWindow: function () {
        this._moduleControlViewModel.readyModules.off('change', this._updateModuleItemsListVisibility, this);
        this._moduleControlViewModel.busyModules.off('change', this._updateModuleItemsListVisibility, this);
    },

    _onCloseBtnClicked: function () {
        this.hide();
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
