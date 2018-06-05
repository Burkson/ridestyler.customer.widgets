namespace RideStylerShowcase.events {
    /**
     * A mapping of events that can be triggered, mapped to their event parameter type
     */
    export interface RideStylerShowcaseEventParameterMapping {
        "state-changed": state.StateChangedEvent;
        "initialized": undefined;
        "vehicle-selected": RideStylerVehicleSelectionModal.SelectedVehicleData;
        "modal-show": { modal: RideStylerShowcaseModal };
        "modal-hide": { modal: RideStylerShowcaseModal };
        "resize": undefined;
        "resized": undefined;
        "breakpoint-changed": RideStylerShowcase.styles.Breakpoint;
        "vehicle-description-loaded": ridestyler.Descriptions.VehicleDescriptionModel;
        "popState": undefined; 
    }

    export interface RideStylerShowcaseEventHandler<DataType = any> {
        /**
         * @param ev The event data
         * @return   false to cancel the event stop processing events
         */
        (ev: DataType): boolean|void
    };

    export interface DebugCallback {
        <K extends keyof RideStylerShowcaseEventParameterMapping>(eventName:K, eventData: RideStylerShowcaseEventParameterMapping[K], eventHandlers: RideStylerShowcaseEventHandler[]):void;
    }

    export class EventHandler {
        private eventHandlers: {[eventName in keyof RideStylerShowcaseEventParameterMapping]?:RideStylerShowcaseEventHandler[]} = {};

        /**
         * Listen for an event
         * @param eventName The name of the event to listen for
         * @param callback  The callback to run when the event is triggered
         */
        public on<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, callback: RideStylerShowcaseEventHandler<RideStylerShowcaseEventParameterMapping[K]>): void {
            if (eventName in this.eventHandlers === false) this.eventHandlers[eventName] = [];
            this.eventHandlers[eventName].push(callback);
        }

        /**
         * Stop listening for an event
         * @param eventName The name of the event to stop listening to
         * @param callback The callback that was originally registered
         */
        public off<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, callback: RideStylerShowcaseEventHandler<RideStylerShowcaseEventParameterMapping[K]>): void {
            if (eventName in this.eventHandlers === false) return;
            this.eventHandlers[eventName] = ArrayHelper.remove(this.eventHandlers[eventName], callback);
        }

        /**
         * Trigger an event
         * @param eventName The name of the event to trigger
         * @param ev        The data to send to the event handlers
         * @returns         false, if the event has been cancelled by a handler, otherwise true
         */
        public trigger<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, ev: RideStylerShowcaseEventParameterMapping[K]): boolean {
            if (typeof this.debugCallback === 'function')
                this.debugCallback(eventName, ev, this.eventHandlers[eventName] || []);

            if (eventName in this.eventHandlers === false) return true;
        
            for (let eventHandler of this.eventHandlers[eventName]) {
                if (eventHandler(ev) === false) return false;
            }

            return true;
        }

        /**
         * Allows the definition of a function to call for debugging triggered events
         */
        public debugCallback: DebugCallback;
    }
}