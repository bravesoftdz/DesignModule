/**
 * ModuleControlComponent. Moddule control component.
  */

/* globals L */

import ToastsController from './toastsController';
import ModuleService from './moduleService';
import ModuleControlViewController from './moduleControlViewController';
import ModuleControlToggleViewController from './moduleControlToggleViewController';

var ModuleControlComponent = L.Evented.extend({

    initialize: function (opts) {
        if (!opts) throw new Error('No arguments are provided the constructor');
        if (!opts.map) throw new Error('map is not provided');
        if (!opts.windowManager) throw new Error('windowManager is not provided');
        if (!opts.toastFunction) throw new Error('toastFunction is not provided');        

        this._map = opts.map;
        this._windowManager = opts.windowManager;
        this._toastFunction = opts.toastFunction;
        
        this._moduleService = new ModuleService();
        if (this._moduleService.enabled) {
            this._startComponent();
        }
        this._moduleService.on('enabled', this._onServiceEnabledChange, this);
    },

    remove: function() {
        if (!this._moduleService) return;

        this._moduleService.remove();
        this._moduleService = null;

        this._stopComponent();
    },

    service: function () {
        return this._moduleService;
    },

    _startComponent: function () {
        this._toastsController = new ToastsController({
            modules: this._moduleService.modules,
            toastFunction: this._toastFunction
        });

        this._moduleControlToggleViewController = new ModuleControlToggleViewController({
            modules: this._moduleService.modules
        });
        this._moduleControlToggleViewController.on('moduleControlToggle', this._toggleModuleControlView, this);

        this._moduleControlViewController = new ModuleControlViewController({
            modules: this._moduleService.modules
        });
        
        this._windowManager.addWindow(this._moduleControlViewController.view(), {
            position: 'center'
        });
        this._moduleControlViewController.hideModuleControlView();

        this._map.addControl(this._moduleControlToggleViewController.view());
    },

    _stopComponent: function () {
        this._toastsController.remove();
        this._toastsController = null;        

        this._moduleControlToggleViewController.remove();
        this._moduleControlToggleViewController = null;

        this._moduleControlViewController.remove();
        this._moduleControlViewController = null;
    },

    _onServiceEnabledChange: function (data) {
        if (data.enabled) {
            this._startComponent();
            
        } else {
            this._stopComponent();
        }
    },

    _toggleModuleControlView: function () {
        this._moduleControlViewController.toggleModuleControlView();
    }

});

export default ModuleControlComponent;
