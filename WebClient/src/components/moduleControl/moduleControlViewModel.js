/**
 * ModuleControlViewModel. This model is used only to present data 
 * to ModuleControlView for visualization and not meant to be a domain model.
 */

/* globals L */

import ModelCollection from '../../core/modelCollection';

var ModuleControlViewModel = L.Evented.extend({

    initialize: function (opts) {
        var options = opts || {};

        var readyModules = options.readyModules || new ModelCollection();
        Object.defineProperty(this, 'readyModules', {
            get: function () { return readyModules; }
        });

        var calculatingModules = options.calculatingModules || new ModelCollection();
        Object.defineProperty(this, 'calculatingModules', {
            get: function () { return calculatingModules; }
        });
    }

});

export default ModuleControlViewModel;
