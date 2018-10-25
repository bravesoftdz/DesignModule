/**
 * ModuleControlViewController. This is a controller for ModuleControlView.
 */

/* globals L */ 

import ModuleControlView from './moduleControlView';
import ModuleControlViewModel from './moduleControlViewModel';
import ModuleControlItemModel from './moduleControlItem/moduleControlItemModel';
import { ModuleStatus } from '../moduleModel';
import ModelCollection from '../../../core/modelCollection';

var moduleStatusToStringMap = {};
moduleStatusToStringMap[ModuleStatus.READY] = 'ready';
moduleStatusToStringMap[ModuleStatus.CALCULATING] = 'busy...';
moduleStatusToStringMap[ModuleStatus.BUSY] = 'busy...';

function moduleStatusToString(moduleStatus) {
    var statusText = moduleStatusToStringMap[moduleStatus] || '';
    return statusText;
}

function isModuleBusy(moduleStatus) {
    return moduleStatus === ModuleStatus.CALCULATING ||
           moduleStatus === ModuleStatus.BUSY;
}

function isModuleReady(moduleStatus) {
    return moduleStatus === ModuleStatus.READY;
}

function moduleStatusToLoadingFlag(moduleStatus) {
    return isModuleBusy(moduleStatus);
}

function buildModuleControlItemModelData(moduleModel) {
    return {
        id: moduleModel.id,
        name: moduleModel.name,
        status: moduleStatusToString(moduleModel.status),
        loading: moduleStatusToLoadingFlag(moduleModel.status)
    };
}

var ModuleControlViewController = L.Evented.extend({

    initialize: function (opts) {
        if (!opts) throw new Error('No arguments are provided to the View');
        if (!opts.modules) throw new Error('modules argument is not provided');

        this._modules = opts.modules;
        this._moduleControlItemModelsCache = new ModelCollection();
        this._updateModuleControlItemModelsCache();

        this._moduleControlViewModel = new ModuleControlViewModel();
        this._moduleControlView = new ModuleControlView({
            moduleControlViewModel: this._moduleControlViewModel
        });

        this._subscribeOnModuleModels({ models: this._modules.models });
        this._updateModuleControlViewModel();

        this._modules.on('add', this._subscribeOnModuleModels, this);
        this._modules.on('remove', this._unsubscribeFromModuleModels, this);
        this._modules.on('change', this._updateModuleControlViewModel, this);
    },

    remove: function () {
        if (!this._moduleControlView) return;

        this._modules.off('add', this._subscribeOnModuleModels, this);
        this._modules.off('remove', this._unsubscribeFromModuleModels, this);
        this._modules.off('change', this._updateModuleControlViewModel, this);

        this._unsubscribeFromModuleModels({ models: this._modules.models });

        this._moduleControlView.close();
        this._moduleControlView = null;
    },

    view: function () {
        return this._moduleControlView;        
    },

    model: function () {
        return this._moduleControlViewModel;
    },

    hideModuleControlView: function () {
        this._moduleControlView.hide();
    },

    showModuleControlView: function () {
        this._moduleControlView.show();
    },

    toggleModuleControlView: function () {
        if (this._moduleControlView.isVisible()) {
            this._moduleControlView.hide();
        } else {
            this._moduleControlView.show();
        }
    },

    _updateModuleControlItemModelsCache: function () {
        var moduleControlItemModelsCache = this._moduleControlItemModelsCache;
        var moduleModels = this._modules.models;

        function toModuleControlItemModel(moduleModel) {
            var moduleControlItemModelData = buildModuleControlItemModelData(moduleModel);
            var moduleControlItemModel = moduleControlItemModelsCache.getById(moduleModel.id);
            
            if (moduleControlItemModel) {
                moduleControlItemModel.set(moduleControlItemModelData);
            } else {
                moduleControlItemModel = new ModuleControlItemModel(moduleControlItemModelData);
            }

            return moduleControlItemModel;
        }
        
        var moduleControlItemModels = moduleModels.map(toModuleControlItemModel);
        moduleControlItemModelsCache.set(moduleControlItemModels);
    },

    _updateModuleControlViewModel: function () {
        this._updateModuleControlItemModelsCache();

        var moduleControlItemModelsCache = this._moduleControlItemModelsCache;

        function getModuleControlItemModel(moduleModel) {
            return moduleControlItemModelsCache.getById(moduleModel.id);
        }

        function filterReadyModels(moduleModel) {
            if (!moduleModel) return false;
            return isModuleReady(moduleModel.status);
        }

        function filterBusyModels(moduleModel) {
            if (!moduleModel) return false;
            return isModuleBusy(moduleModel.status);
        }

        function filterNotEmpty(item) {
            return !!item;
        }

        var moduleModels = this._modules.models;

        var readyModuleControlItemModels = moduleModels
            .filter(filterReadyModels)
            .map(getModuleControlItemModel)
            .filter(filterNotEmpty);        

        var busyModuleControlItemModels = moduleModels
            .filter(filterBusyModels)
            .map(getModuleControlItemModel)
            .filter(filterNotEmpty);

        this._moduleControlViewModel.readyModules.set(readyModuleControlItemModels);
        this._moduleControlViewModel.busyModules.set(busyModuleControlItemModels);
    },

    _subscribeOnModuleModels: function (data) {
        if (!data) return;
        if (!Array.isArray(data.models)) return;

        var modules = data.models;
        modules.forEach(function (module) {
            module.on('change', this._updateModuleControlItemModel, this);
            module.on('status', this._updateModuleControlViewModel, this);
        }.bind(this));
    },

    _unsubscribeFromModuleModels: function (data) {
        if (!data) return;
        if (!Array.isArray(data.models)) return;

        var modules = data.models;
        modules.forEach(function (module) {
            module.off('change', this._updateModuleControlItemModel, this);
            module.off('status', this._updateModuleControlViewModel, this);
        }.bind(this));
    },

    _updateModuleControlItemModel: function (data) {
        var moduleModel = data.module;
        if (!moduleModel) return;

        var moduleControlItem = 
            this._moduleControlViewModel.readyModules.getById(moduleModel.id) || 
            this._moduleControlViewModel.busyModules.getById(moduleModel.id);        
        
        if (moduleControlItem) {
            var moduleControlItemData = buildModuleControlItemModelData(moduleModel);
            moduleControlItem.set(moduleControlItemData);
        }
    }
    
}); 

export default ModuleControlViewController;
