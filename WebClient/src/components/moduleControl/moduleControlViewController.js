/**
 * ModuleControlViewController. This is a controller for ModuleControlView.
 */

/* globals L */ 

import ModuleControlView from './moduleControlView';
import ModuleControlViewModel from './moduleControlViewModel';
import ModuleControlItemModel from './moduleControlItemModel';
import { ModuleStatus } from './moduleModel';

var moduleStatusToStringMap = {};
moduleStatusToStringMap[ModuleStatus.READY] = 'ready';
moduleStatusToStringMap[ModuleStatus.CALCULATING] = 'calculating...';

function moduleStatusToString(moduleStatus) {
    var statusText = moduleStatusToStringMap[moduleStatus] || '';
    return statusText;
}

function moduleStatusToLoadingFlag(moduleStatus) {
    return moduleStatus === ModuleStatus.CALCULATING;
}

function buildModuleControlItemModelData(moduleModel) {
    return {
        id: moduleModel.id,
        name: moduleModel.name,
        status: moduleStatusToString(moduleModel.status),
        loading: moduleStatusToLoadingFlag(moduleModel.status)
    };
}

var visibleStatuses = [ModuleStatus.READY, ModuleStatus.CALCULATING];

var ModuleControlViewController = L.Evented.extend({

    initialize: function (opts) {
        if (!opts) throw new Error('No arguments are provided to the View');
        if (!opts.modules) throw new Error('modules argument is not provided');

        this._modules = opts.modules;

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

        this._unsubscribeFromModuleModels({ models: this._modules.models });

        this._moduleControlView.close();
        this._moduleControlView = null;

        this._modules.off('change', this._updateModuleControlViewModel, this);
    },

    view: function () {
        return this._moduleControlView;        
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

    _updateModuleControlViewModel: function () {
        var moduleControlItemsModel = this._moduleControlViewModel;
        var newModuleItemModels = [];
        var moduleModels = this._modules.models;

        moduleModels
            .filter(function (moduleModel) {
                if (!moduleModel) return false;
                if (visibleStatuses.indexOf(moduleModel.status) < 0) return false;
                return true;
            })
            .forEach(function (moduleModel) {
                var moduleItemData = buildModuleControlItemModelData(moduleModel);
                var moduleItem = moduleControlItemsModel.getById(moduleModel.id);
                
                if (moduleItem) {
                    moduleItem.set(moduleItemData);                
                } else {
                    moduleItem = new ModuleControlItemModel(moduleItemData);
                }               

                newModuleItemModels.push(moduleItem);
            });

        this._moduleControlViewModel.set(newModuleItemModels);        
    },

    _updateModuleControlItemModel: function (data) {
        var moduleModel = data.module;
        if (!moduleModel) return;

        var moduleControlItemData;
        var moduleControlItem = this._moduleControlViewModel.getById(moduleModel.id);        
        if (moduleControlItem) {
            moduleControlItemData = buildModuleControlItemModelData(moduleModel);
            moduleControlItem.set(moduleControlItemData);
        }
    }

}); 

export default ModuleControlViewController;
