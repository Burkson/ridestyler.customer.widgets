namespace RideStylerShowcase {
    export enum States {
        ChooseVehicle = 0,
        Visualize = 1
    }
}

namespace RideStylerShowcase.state {
    export interface StateChangedEvent {
        oldState: States;
        newState: States;
        newData: StateData
    }

    export interface StateChangedCallback {
        /**
         * @param event  The state changed event
         * @return       If returning false, cancel the state change
         */
        (event:StateChangedEvent): boolean;
    }

    export interface StateChangedCallback {
        /**
         * @param event  The state changed event
         * @return       If returning false, cancel the state change
         */
        (event:StateChangedEvent): boolean;
    }

    export interface DebugStateCallback {
        /**
         * @param event    The state changed event
         * @param finished If false, the state change is beginning, otherwise the state change
         *                 has finished
         */
        (event:StateChangedEvent, finished:boolean): void;
    }

    export interface StateExitCallback {
        /**
         * @param currentState  The state being changed from
         * @param newState      The state being changed to
         * @return              If returning false, cancel the state change
         */
        (currentState:States, newState:States, newData:StateData): boolean;
    }

    export interface StateEnterCallback {
        /**
         * @param oldState      The state being changed from
         * @param currentState  The state being changed to
         * @return              If returning false, cancel the state change
         */
        (oldState:States, currentState:States, newData:StateData): boolean;
    }

    export interface StateDataChangedCallback {
        /**
         * @param newData The new state data
         */
        (newData:StateData): void;
    }

    /**
     * A register holding the exit/enter callbacks for a specific state
     */
    class StateCallbackRegister {
        state:States;
        exitCallbacks: StateExitCallback[];
        enterCallbacks: StateEnterCallback[];

        constructor(state:States) {
            this.state = state;
            this.exitCallbacks = [];
            this.enterCallbacks = [];
        }

        /**
         * Trigger all of the exit callbacks for this state. If a callback returns false,
         * skip triggering the remaining callbacks and return false;
         */
        triggerExitCallbacks(currentState:States, newState:States, newData:StateData) : boolean {
            for (let exitCallback of this.exitCallbacks) {
                if (exitCallback(currentState, newState, newData) === false)
                    return false;
            }

            return true;
        }
        
        /**
         * Trigger all of the enter callbacks for this state. If a callback returns false,
         * skip triggering the remaining callbacks and return false;
         */
        triggerEnterCallbacks(oldState:States, currentState:States, newData:StateData) : boolean {
            for (let enterCallback of this.enterCallbacks) {
                if (enterCallback(oldState, currentState, newData) === false)
                    return false;
            }

            return true;
        }
    }

    export interface StateData {
        currentVehicleConfigurationID: string;
        currentVehicleDescription: string;
        currentVehicleDescriptionModel: ridestyler.Descriptions.VehicleDescriptionModel;

        currentVehicleTireOptionID: string;
        currentVehicleTireOptionDescription: string;

        vehicleHasSideImage: boolean;
        vehicleHasAngledImage: boolean;

        currentPaintScheme: ridestyler.Descriptions.VehiclePaintSchemeDescriptionModel;
        currentWheel: ridestyler.Descriptions.WheelModelDescriptionModel;
        currentWheelFitment: ridestyler.Descriptions.WheelFitmentDescriptionModel;
        currentTire: ridestyler.Descriptions.TireModelDescriptionModel;
        currentTireOption: ridestyler.Descriptions.VehicleTireOptionDescriptionModel;
        
        currentSuspension: number;
    }

    export type PartialStateData = {
        [P in keyof StateData]?: StateData[P];
    }

    export class RideStylerShowcaseState {
        /**
         * The current state
         */
        public currentState:States;

        constructor (initialState:States) {
            this.currentState = initialState;
        }

        private currentData:StateData = {
            currentVehicleConfigurationID: undefined,
            currentVehicleDescription: undefined,
            vehicleHasAngledImage: undefined,
            vehicleHasSideImage: undefined,
            currentVehicleTireOptionDescription: undefined,
            currentVehicleTireOptionID: undefined,
            currentPaintScheme: undefined,
            currentTire: undefined,
            currentWheel: undefined,
            currentWheelFitment: undefined,
            currentTireOption: undefined,
            currentVehicleDescriptionModel: undefined,
            currentSuspension: undefined
        };

        public getData() { return this.currentData; }

        public setData(newData:StateData) {
            let beforeCallbacks:StateDataChangedCallback[] = [],
                afterCallbacks:StateDataChangedCallback[] = [];
            
            for (let dataChangedCallback of this.dataChangedCallbacks) {
                let {callback, before} = dataChangedCallback;

                if (before) beforeCallbacks.push(callback);
                else afterCallbacks.push(callback);
            }

            for (let callback of beforeCallbacks)
                callback(newData);

            this.currentData = newData;
        
            for (let callback of afterCallbacks)
                callback(this.currentData);
        }
        public extendData(dataExtension:PartialStateData): StateData {
            let hasChanged: boolean = false;
            let newData: PartialStateData = {}; 
            let currentData: StateData = this.currentData;

            for (let key in currentData) {
                if (currentData.hasOwnProperty(key)) {
                    let currentValue = currentData[key];
                    let newValue = dataExtension[key];
                    
                    if (key in dataExtension && currentValue !== newValue) {
                        hasChanged = true;
                        newData[key] = newValue;
                    } else {
                        newData[key] = currentValue;
                    }
                }
            }

            if (hasChanged) {
                this.setData(newData as StateData);
            }

            return this.currentData;
        }

        /**
         * A dictionary of States to StateCallbackRegisters
         */
        private callbacks: {[state: number]: StateCallbackRegister} = {};

        /**
         * State changed callbacks
         */
        private changeCallbacks:StateChangedCallback[] = [];

        /**
         * Data changed callbacks
         */
        private dataChangedCallbacks:{callback:StateDataChangedCallback, before:boolean}[] = [];
    
        /**
         * Returns an exiting callback register for the specified state or creates
         * a new one
         * @param state The state to return a callback register for
         */
        private callbacksForState(state: States):StateCallbackRegister
        {
            if (state in this.callbacks) return this.callbacks[state];
            return this.callbacks[state] = new StateCallbackRegister(state);
        }

        /**
         * Register a callback that is triggered when exiting a specific state
         * @param state The state to register a exit callback for
         * @param callback The callback to execute when exiting the state
         */
        onExit (state:States, callback:StateExitCallback) {
            this.callbacksForState(state).exitCallbacks.push(callback);
        }

        /**
         * Register a callback that is triggered when entering a specific state
         * @param state The state to register an enter callback for
         * @param callback The callback to execute when entering the state
         */
        onEnter(state:States, callback:StateEnterCallback)  {
            this.callbacksForState(state).enterCallbacks.push(callback);
        }

        /**
         * Register a function to call when the state has been changed
         * @param callback The callback to run
         */
        onChange(callback:StateChangedCallback) {
            this.changeCallbacks.push(callback);
        }

        /**
         * Register a function to be called before the state data has been changed.
         * This allows callback functions to modify the data before it's sent to other callbacks.
         * @param callback The callback to run
         */
        beforeDataChange(callback:StateDataChangedCallback) {
            this.dataChangedCallbacks.push({
                callback: callback,
                before: true
            });
        }

        /**
         * Register a function to be called after the state data has changed
         * @param callback The callback to run
         */
        afterDataChange(callback:StateDataChangedCallback) {
            this.dataChangedCallbacks.push({
                callback: callback,
                before: false
            });
        }

        changeState(newState:States, newData?:StateData) {
            if (this.currentState === newState) return;

            let previousState = this.currentState;

            // Set our state data
            if (newData) this.setData(newData);

            var stateChangedEvent:StateChangedEvent = {
                oldState: previousState,
                newState: newState,
                newData: this.currentData
            };

            if (typeof this.debugCallback === 'function') this.debugCallback(stateChangedEvent, false);

            // Trigger the state-changed event, cancel state change if cancelled
            for (let callback of this.changeCallbacks) {
                if (!callback(stateChangedEvent)) return;
            }

            // Trigger exit callbacks
            if (this.callbacksForState(previousState).triggerExitCallbacks(previousState, newState, this.currentData) === false) {
                // One of the exit callbacks canceled the state change
                return;
            }

            // Trigger enter callbacks
            if (this.callbacksForState(newState).triggerEnterCallbacks(previousState, newState, this.currentData) === false) {
                // One of the enter callbacks canceled the state change
                return;
            }

            if (typeof this.debugCallback === 'function') this.debugCallback(stateChangedEvent, true);

            // All of the callbacks have been ran, change the state
            this.currentState = newState;
        }

        debugCallback: DebugStateCallback;
    }
}