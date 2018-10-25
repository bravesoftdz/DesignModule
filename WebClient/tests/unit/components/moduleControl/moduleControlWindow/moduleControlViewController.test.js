'use strict';

import ModuleControlViewController from 
    'components/moduleControl/moduleControlWindow/moduleControlViewController';
import ModelCollection from 'core/modelCollection';
import ModuleModel, { ModuleStatus } from 'components/moduleControl/moduleModel';

describe('ModuleControlViewController', () => {
    let modules;
    let moduleControlViewController;
    let moduleModel;
    
    beforeEach(() => {
        modules = new ModelCollection({
            models: [
                new ModuleModel({
                    id: 'Air2',
                    name: 'Air Quality1',
                    progress: 12345,
                    status: ModuleStatus.IDLE
                }),
                new ModuleModel({
                    id: 'Air2',
                    name: 'Air Quality2',
                    progress: 12345,
                    status: ModuleStatus.IDLE
                }),
                new ModuleModel({
                    id: 'Air3',
                    name: 'Air Quality3',
                    progress: 12345,
                    status: ModuleStatus.IDLE
                })
            ]
        });

        moduleControlViewController = new ModuleControlViewController({ modules });

        moduleModel = new ModuleModel({
            id: 'Traffic',
            name: 'Traffic',
            progress: 12345,
            status: ModuleStatus.IDLE
        });

        modules.add(moduleModel);
    });

    it('ready list does not contain modules with unexpected status', ()=> {
        moduleModel.status = ModuleStatus.IDLE;
        expect(moduleControlViewController.model().readyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.LOCKED;
        expect(moduleControlViewController.model().readyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.CALCULATING;
        expect(moduleControlViewController.model().readyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.BUSY;
        expect(moduleControlViewController.model().readyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.REMOVED;
        expect(moduleControlViewController.model().readyModules.length).toBe(0);
    });

    it('busy list does not contain modules with unexpected status', ()=> {
        moduleModel.status = ModuleStatus.IDLE;
        expect(moduleControlViewController.model().busyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.LOCKED;
        expect(moduleControlViewController.model().busyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.READY;
        expect(moduleControlViewController.model().busyModules.length).toBe(0);

        moduleModel.status = ModuleStatus.REMOVED;
        expect(moduleControlViewController.model().busyModules.length).toBe(0);
    });
    
    it('ready list contains modules with "ready" status', () => {
        moduleModel.status = ModuleStatus.READY;

        expect(moduleControlViewController.model().readyModules.length).toBe(1);
        expect(moduleControlViewController.model().readyModules.models[0]).toMatchObject({
            id: moduleModel.id,
            name: moduleModel.name,
            status: 'ready',
            loading: false
        });
    });

    it('busy list contains modules with "calculating" status', () => {
        moduleModel.status = ModuleStatus.CALCULATING;

        expect(moduleControlViewController.model().busyModules.length).toBe(1);
        expect(moduleControlViewController.model().busyModules.models[0]).toMatchObject({
            id: moduleModel.id,
            name: moduleModel.name,
            status: 'busy...',
            loading: true
        });
    });

    it('busy list contains modules with "busy" status', () => {
        moduleModel.status = ModuleStatus.BUSY;

        expect(moduleControlViewController.model().busyModules.length).toBe(1);
        expect(moduleControlViewController.model().busyModules.models[0]).toMatchObject({
            id: moduleModel.id,
            name: moduleModel.name,
            status: 'busy...',
            loading: true
        });
    });

    it('module item is transfered from ready list to busy list', () => {
        moduleModel.status = ModuleStatus.READY;
        moduleModel.status = ModuleStatus.BUSY;
        
        expect(moduleControlViewController.model().readyModules.length).toBe(0);
        expect(moduleControlViewController.model().busyModules.length).toBe(1);
        expect(moduleControlViewController.model().busyModules.models[0]).toMatchObject({
            id: moduleModel.id,
            name: moduleModel.name,
            status: 'busy...',
            loading: true
        });
    });

    it('module item is transfered from busy list to ready list', () => {
        moduleModel.status = ModuleStatus.BUSY;
        moduleModel.status = ModuleStatus.READY;
        
        expect(moduleControlViewController.model().busyModules.length).toBe(0);
        expect(moduleControlViewController.model().readyModules.length).toBe(1);        
        expect(moduleControlViewController.model().readyModules.models[0]).toMatchObject({
            id: moduleModel.id,
            name: moduleModel.name,
            status: 'ready',
            loading: false
        });
    });

    it('existing module item instance presists on status changes', () => {
        let actualModuleItemModel;

        moduleModel.status = ModuleStatus.BUSY;
        const expectedModuleItemModel = moduleControlViewController.model().busyModules.models[0];
        
        moduleModel.status = ModuleStatus.IDLE;        
        moduleModel.status = ModuleStatus.CALCULATING;

        actualModuleItemModel = moduleControlViewController.model().busyModules.models[0];
        expect(Object.is(actualModuleItemModel, expectedModuleItemModel)).toBe(true);
        
        moduleModel.status = ModuleStatus.READY;
        
        actualModuleItemModel = moduleControlViewController.model().readyModules.models[0];
        expect(Object.is(actualModuleItemModel, expectedModuleItemModel)).toBe(true);
    });

});
