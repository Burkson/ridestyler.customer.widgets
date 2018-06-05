namespace RideStylerShowcase {
    export interface RideStylerShowcaseOptions {
        debug?: {
            events?:boolean;
            state?:boolean;
        };
    }

    export type RideStylerShowcaseSettings = 
        (RideStylerShowcaseOptions & RideStylerShowcaseAPIInitializeSettingsKeyToken) | 
        (RideStylerShowcaseOptions & RideStylerShowcaseAPIInitializeSettingsUser);

    export interface RideStylerShowcaseContainer extends HTMLElement {
        ridestylerShowcase: RideStylerShowcaseInstance;
    }

    export class RideStylerShowcaseInstance {
        /**
         * The main container for the showcase
         */
        public container: RideStylerShowcaseContainer;

        /**
         * The main components (screens for example) to be rendered in the showcase
         */
        private mainComponents: MainComponentBase[];

        /**
         * Other components to be rendered in the showcase
         */
        private otherComponents: ComponentBase[];

        /**
         * A mapping of states to main components
         */
        private stateComponentMapping: {[state: number]:MainComponentBase};

        /**
         * The currently visible main component
         */
        private currentMainComponent: MainComponentBase;
        
        /**
         * The state handler
         */
        public state:state.RideStylerShowcaseState;

        /**
         * The style manager
         */
        public style:styles.StyleManager;

        /**
         * The event handler
         */
        public events:events.EventHandler;

        /**
         * The url check handler
         */
        public parameters:parameters.RideStylerShowcaseParameters; 
        /**
         * Settings specified when the showcase was created
         */

        public settings:RideStylerShowcaseSettings;

        /**
         * Settings loaded from the API
         */
        public settingsFromAPI:api.settings.RideStylerShowcaseSettingsFromAPI;

        /**
         * The filter controller
         */
        public filters:filters.FilterController;
        
        /**
         * Create a RideStyler Showcase instance and do not initialize it
         */
        public constructor();

        /**
         * Create a RideStyler Showcase instance and initialize it inside a container with the specified ID
         * @param containerID Specifies the ID of the container to initialize the showcase in
         */
        public constructor(containerID: string, settings?:RideStylerShowcaseSettings);

        /**
         * Create a RideStyler Showcase instance and initialize it inside the specified container
         * @param container Specifies the element to initialize the showcase in
         */
        public constructor (container: HTMLElement, settings?:RideStylerShowcaseSettings);

        public constructor (container?: string | HTMLElement, settings?:RideStylerShowcaseSettings) {
            this.settings = settings || {};
            this.settings.debug = this.settings.debug || {};

            this.events = new events.EventHandler();

            if (this.settings.debug.events === true)
                this.events.debugCallback = function (name, e, handlers) {
                    if (name === 'resize') return;

                    console.log(`[RideStylerShowcase Event] Name: ${name} Data:`, e, handlers);
                };

            if (container) {
                if (typeof container === 'string') {
                    container = document.getElementById(container);

                    if (!container) console.error('The ID "' + container + '" could not be found in the DOM.');
                }

                this.initialize(container);
            }
        }

        /**
         * Register the main components used by the showcase
         */
        private registerComponents(): void {
            let eventHandler = this.events;

            // Register other components to be displayed
            this.otherComponents = [
                new RideStylerShowcaseBackground(this)
            ];

            // Register our mapping of states to main components
            this.stateComponentMapping = {};
            this.stateComponentMapping[States.ChooseVehicle] = new RideStylerShowcaseVehicleSelection(this);
            this.stateComponentMapping[States.Visualize] = new RideStylerShowcaseVehicleVisualization(this);

            // Generate mainComponents from the stateComponentMapping
            this.mainComponents = [];
            for (let state in this.stateComponentMapping)
                this.mainComponents.push(this.stateComponentMapping[state]);
        }

        /**
         * Set the container of this showcase instance and initialize (or re-initialize) it
         * @param container The container to initialize this showcase in
         */
        public initialize(container: HTMLElement) : void {

            if (!container) throw "Cannot initialize showcase without a container to put it in.";

            this.container = ObjectHelper.assign(container, {
                ridestylerShowcase: this
            });
            this.initializeParameters();

            this.initializeState();

            this.registerComponents();

            api.initialize(this.settings);

            this.initializeStyle();

            this.initializeFilters();
            
            this.initializeComponents();

            this.events.on("vehicle-selected", selection => {
                var vehicleSelectionState = {
                    currentVehicleConfigurationID: selection.VehicleConfiguration,
                    currentVehicleDescription: selection.VehicleDescription,
                    currentVehicleTireOptionID: selection.TireOptionID,
                    currentVehicleTireOptionDescription: selection.TireOptionString,
                    currentPaintScheme: selection.PaintScheme || undefined,
                    vehicleHasAngledImage: selection.vehicleHasAngledImage || undefined,
                    vehicleHasSideImage: selection.vehicleHasSideImage || undefined,
                    currentTire: selection.currentTire || undefined,
                    currentWheel: selection.currentWheel || undefined,
                    currentWheelFitment: selection.currentWheelFitment || undefined,
                    currentTireOption: selection.currentTireOption || undefined,
                    currentVehicleDescriptionModel: selection.currentVehicleDescriptionModel || undefined,
                    currentSuspension: selection.currentSuspension || undefined
                };
                this.state.changeState(States.Visualize, vehicleSelectionState);
                return true;
            });

            let settingsRetrieved = PromiseHelper.then(api.authenticated, () => {
                return api.settings.getSettings().done(settingsFromAPI => {
                    this.settingsFromAPI = settingsFromAPI;
                });
            });

            PromiseHelper.all([this.style.initialized, settingsRetrieved]).done(() => {
                this.events.trigger('initialized', undefined);
            });

            this.onStateChanged({
                newState: this.state.currentState,
                oldState: undefined,
                newData: undefined
            });
        }

        private initializeState() {
            this.state = new state.RideStylerShowcaseState(States.ChooseVehicle);

            if (this.settings.debug.state === true) this.state.debugCallback = function(e, finished) {
                let finishedString = finished ? 'Finished' : 'Beginning';
                let stateChange = "to " + States[e.newState];

                if (typeof e.oldState === 'number') {
                    stateChange = "from " + States[e.oldState] + " " + stateChange;
                }

                console.log(`[RideStylerShowcase State] ${stateChange} ${finishedString}`, e);
            };
            
            this.state.onChange((e) => {
                return this.events.trigger("state-changed", e) && this.onStateChanged(e);
            });
        }

        private initializeStyle() {
            this.style = new styles.StyleManager(this.container);
            this.style.onResize = () => this.events.trigger('resize', undefined);
            this.style.onResized = () => this.events.trigger('resized', undefined);
            this.style.onBreakpointChanged = newBreakpoint => this.events.trigger('breakpoint-changed', newBreakpoint);

            if (!this.container.classList.contains('ridestyler-showcase'))
                this.container.classList.add('ridestyler-showcase');
        }

        private initializeParameters() {
            this.parameters = new parameters.RideStylerShowcaseParameters();

        };


        private initializeFilters() {
            this.filters = new filters.FilterController();

            this.events.on("vehicle-selected", selection => {
                this.filters.setVehicle({
                    vehicleConfigurationID: selection.VehicleConfiguration,
                    vehicleTireOptionID: selection.TireOptionID
                });
            });

            this.events.on("vehicle-description-loaded", selectedVehicle => {
                this.filters.setVehicleDescription({
                    HasSideImage: selectedVehicle.HasSideImage,
                    HasAngledImage: selectedVehicle.HasAngledImage
                });
            });
        }

        private initializeComponents() {
            let container = this.container;

            for (let component of this.otherComponents)
                container.appendChild(component.component);

            for (let component of this.mainComponents) {
                component.setVisible(false);
                container.appendChild(component.component);
            }
        }
        
        private onStateChanged(ev: state.StateChangedEvent):boolean {
            this.updateCurrentComponent(ev);
            return true;
        }

        private activeLoadingSessionKeys: string[] = [];

        private updateCurrentComponent(ev:state.StateChangedEvent) {
            let newComponent:MainComponentBase = this.stateComponentMapping[ev.newState];
            let oldComponent:MainComponentBase = undefined;
            const stateClassPrefix = 'ridestyler-showcase-state-';

            if (typeof ev.oldState === 'number') {
                oldComponent = this.stateComponentMapping[ev.oldState];
                this.container.classList.remove(stateClassPrefix + States[ev.oldState].toLowerCase());
            }
            
            this.container.classList.add(stateClassPrefix + States[ev.newState].toLowerCase());

            if (oldComponent && oldComponent.isVisible()) {
                oldComponent.hide(function () {
                    newComponent.show();
                });
            } else {
                newComponent.show();
            }
        }
    }

    /**
     * Create a RideStyler Showcase instance and do not initialize it
     * @param settings
     */
    export function create(settings?:RideStylerShowcaseSettings);

    /**
     * Create a RideStyler Showcase instance and initialize it inside a container with the specified ID
     * @param containerID Specifies the ID of the container to initialize the showcase in
     * @param settings
     */
    export function create(containerID: string, settings?:RideStylerShowcaseSettings);

    /**
     * Create a RideStyler Showcase instance and initialize it inside the specified container
     * @param container Specifies the element to initialize the showcase in
     * @param settings
     */
    export function create (container: HTMLElement, settings?:RideStylerShowcaseSettings);

    export function create (container?: any, settings?:RideStylerShowcaseSettings) {
        return new RideStylerShowcaseInstance(container, settings);
    }
}