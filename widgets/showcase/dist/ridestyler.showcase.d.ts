declare namespace RideStylerShowcase.api.auth {
    function validate(): ridestyler.RideStylerPromise<ridestyler.RideStylerAPIResponse, ridestyler.RideStylerAPIResponse>;
}

declare namespace RideStylerShowcase.api.settings {
    interface RideStylerShowcaseSettingsFromAPI {
        EnableSharing: boolean;
        SuspensionRanges: {
            [styleTypeDriveType: string]: {
                Min: number;
                Max: number;
            };
        };
        UseRawTireDescription: boolean;
    }
    function getSettings(): RideStylerPromise<RideStylerShowcaseSettingsFromAPI, ridestyler.RideStylerAPIResponse>;
}

declare namespace RideStylerShowcase {
    interface RideStylerShowcaseAPIInitializeSettings {
    }
    interface RideStylerShowcaseAPIInitializeSettingsKeyToken extends RideStylerShowcaseAPIInitializeSettings {
        token?: string;
        key?: string;
    }
    interface RideStylerShowcaseAPIInitializeSettingsUser extends RideStylerShowcaseAPIInitializeSettings {
        username: string;
        password: string;
    }
    namespace api {
        /**
         * Initialize the RideStyler API by passing in a user/password combination, a user token, or a key.
         * @param settings The API initialization settings
         * @returns A promise that is resolved (or rejected) when the API is authenticated (or fails authentication)
         */
        function initialize(settings?: RideStylerShowcaseAPIInitializeSettingsKeyToken | RideStylerShowcaseAPIInitializeSettingsUser): RideStylerPromise;
        let authenticated: ridestyler.RideStylerPromise<{}, {}>;
        function isAuthenticated(): boolean;
        function afterAuthenticated(callback: Function): void;
        function request<Action extends keyof ridestyler.RidestylerAPIActionResponseMapping>(action: Action, data?: ridestyler.RidestylerAPIActionRequestMapping[Action]): RideStylerPromise<ridestyler.RidestylerAPIActionResponseMapping[Action]>;
        function getURL<Action extends ridestyler.RideStylerAPIEndpoint>(action: Action, data?: ridestyler.RidestylerAPIActionRequestMapping[Action]): string;
        enum Environment {
            Alpha = 0,
            Beta = 1,
            Live = 2,
            Other = 3
        }
        let environment: Environment;
    }
}


declare namespace RideStylerShowcase.events {
    /**
     * A mapping of events that can be triggered, mapped to their event parameter type
     */
    interface RideStylerShowcaseEventParameterMapping {
        "state-changed": state.StateChangedEvent;
        "initialized": undefined;
        "vehicle-selected": {
            PaintScheme?: ridestyler.Descriptions.VehiclePaintSchemeDescriptionModel;
            vehicleHasAngledImage?: boolean;
            vehicleHasSideImage?: boolean;
            currentTire?: ridestyler.Descriptions.TireModelDescriptionModel;
            currentWheel?: ridestyler.Descriptions.WheelModelDescriptionModel;
            currentWheelFitment?: ridestyler.Descriptions.WheelFitmentDescriptionModel;
            currentTireOption?: ridestyler.Descriptions.VehicleTireOptionDescriptionModel;
            currentVehicleDescriptionModel?: ridestyler.Descriptions.VehicleDescriptionModel;
            currentSuspension?: number;
            /**
             * A description of the vehicle
             */
            VehicleDescription: string;
            /**
             * A VehicleConfigurationID representing the selected vehicle
             */
            VehicleConfiguration: string;
            /**
             * The VehicleTireOptionID representing the selected OE tire option
             */
            TireOptionID: string;
            /**
             * A description of the currently selected OE tire option
             */
            TireOptionString: string;
        };
        "modal-show": {
            modal: RideStylerShowcaseModal;
        };
        "modal-hide": {
            modal: RideStylerShowcaseModal;
        };
        "resize": undefined;
        "resized": undefined;
        "breakpoint-changed": RideStylerShowcase.styles.Breakpoint;
        "vehicle-description-loaded": ridestyler.Descriptions.VehicleDescriptionModel;
        "popState": undefined;
    }
    interface RideStylerShowcaseEventHandler<DataType = any> {
        /**
         * @param ev The event data
         * @return   false to cancel the event stop processing events
         */
        (ev: DataType): boolean | void;
    }
    interface DebugCallback {
        <K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, eventData: RideStylerShowcaseEventParameterMapping[K], eventHandlers: RideStylerShowcaseEventHandler[]): void;
    }
    class EventHandler {
        private eventHandlers;
        /**
         * Listen for an event
         * @param eventName The name of the event to listen for
         * @param callback  The callback to run when the event is triggered
         */
        on<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, callback: RideStylerShowcaseEventHandler<RideStylerShowcaseEventParameterMapping[K]>): void;
        /**
         * Stop listening for an event
         * @param eventName The name of the event to stop listening to
         * @param callback The callback that was originally registered
         */
        off<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, callback: RideStylerShowcaseEventHandler<RideStylerShowcaseEventParameterMapping[K]>): void;
        /**
         * Trigger an event
         * @param eventName The name of the event to trigger
         * @param ev        The data to send to the event handlers
         * @returns         false, if the event has been cancelled by a handler, otherwise true
         */
        trigger<K extends keyof RideStylerShowcaseEventParameterMapping>(eventName: K, ev: RideStylerShowcaseEventParameterMapping[K]): boolean;
        /**
         * Allows the definition of a function to call for debugging triggered events
         */
        debugCallback: DebugCallback;
    }
}

declare namespace RideStylerShowcase.filters {
    type FilterProviderType = 'tire' | 'wheel' | 'global';
    import WheelFilterModel = ridestyler.Requests.WheelFilterModel;
    import TireFilterModel = ridestyler.Requests.TireFilterModel;
    type GlobalFilterModel = WheelFilterModel & TireFilterModel;
    class FilterController {
        readonly globalFilters: GlobalFilterProvider;
        readonly tireFilters: TireFilterProvider;
        readonly wheelFilters: WheelFilterProvider;
        constructor();
        setVehicle(vehicle: Vehicle): void;
        setVehicleDescription(vehicleDescription: VehicleDescription): void;
        clearFilters(triggerChange?: boolean): void;
    }
    interface Vehicle {
        vehicleConfigurationID: string;
        vehicleTireOptionID: string;
    }
    interface VehicleDescription {
        HasSideImage: boolean;
        HasAngledImage: boolean;
    }
    interface FilterValue {
        key: string;
        value: any;
    }
    interface IFilter<ValueType, FilterType> {
        key: string;
        label?: string;
        unselectedOptionLabel?: string;
        visible?: boolean;
        retrieveOptions?: (globalFilters: GlobalFilterModel) => RideStylerPromise<IFilterOption<ValueType>[], ridestyler.RideStylerAPIResponse>;
        getValueFromFilters?: (filters: FilterType) => any;
        apply: (filters: FilterType, value: ValueType) => void;
    }
    interface IFilterOption<ValueType> {
        label: string;
        value: ValueType;
    }
    abstract class FilterProvider<FilterType extends object> {
        readonly type: FilterProviderType;
        readonly filterOptions: IFilter<any, FilterType>[];
        /**
         * The currently applied filters
         */
        protected currentFilters: FilterType;
        /**
         * Overridable in deriving classes to set base filters for requests
         */
        protected readonly baseFilters: FilterType;
        protected readonly globalFilterProvider: GlobalFilterProvider;
        constructor(type: FilterProviderType, globalFilterProvider: GlobalFilterProvider);
        /**
         * If specified, this function is called each time the filters change
         */
        onFiltersChanged: (filters: FilterType) => void;
        /**
         * Trigger the filter changed callback
         */
        protected triggerFilterChange(): void;
        /**
         * Returns a filter model with the specified filter values set,
         * without actually setting them
         */
        previewFilters(filterValues: FilterValue[]): FilterType;
        /**
         * Returns the currently applied filters
         */
        getFilters(): FilterType;
        /**
         * Retrieve the options for a filter
         * @param filter The filter
         */
        retrieveOptions<ValueType>(filter: IFilter<ValueType, FilterType>): RideStylerPromise<IFilterOption<ValueType>[], ridestyler.RideStylerAPIResponse>;
        /**
         * Set a filter option, on a specific filter model
         * @param key The filter key to apply
         * @param value The value to apply to the filter
         * @param filters The filters to apply them to
         */
        setFilter<ValueType = any>(key: string, value: ValueType, filters?: FilterType): void;
        /**
         * Returns the filter option for the specified key
         * @param key The filter key
         */
        protected findFilterOption(key: string): IFilter<any, FilterType>;
        /**
         * Apply a list of selected filter key-value pairs
         * @param selectedFilters A list of selected filter key-value pairs to apply
         */
        setFilters(selectedFilters: FilterValue[], triggerChange?: boolean): boolean;
        /**
         * Apply a filter
         * @param key The key of the filter to apply
         * @param value The value to apply to the filter
         */
        setFilters(key: string, value: any, triggerChange?: boolean): boolean;
        abstract getCount(filters: FilterType): RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
        clear(triggerChange?: boolean): void;
    }
    class GlobalFilterProvider extends FilterProvider<GlobalFilterModel> {
        readonly filterOptions: IFilter<any, GlobalFilterModel>[];
        protected readonly baseFilters: GlobalFilterModel;
        constructor();
        /**
        * Applies a vehicle selection to all
        * @param vehicle The vehicle to apply to filter queries
        */
        setVehicleDescription(vehicleDescription: VehicleDescription): void;
        setVehicle(vehicle: Vehicle): void;
        getCount(): never;
    }
    class TireFilterProvider extends FilterProvider<TireFilterModel> {
        readonly filterOptions: IFilter<any, TireFilterModel>[];
        protected readonly baseFilters: TireFilterModel;
        constructor(globalFilterProvider: GlobalFilterProvider);
        getCount(filters: TireFilterModel): RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
    }
    class WheelFilterProvider extends FilterProvider<WheelFilterModel> {
        readonly filterOptions: IFilter<any, WheelFilterModel>[];
        constructor(globalFilterProvider: GlobalFilterProvider);
        setVehicleDescription(vehicleDescription: VehicleDescription): void;
        getCount(filters: WheelFilterModel): RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
    }
}

declare namespace RideStylerShowcase.parameters {
    class RideStylerShowcaseParameters {
        get(): any;
        set(stateData: any): void;
        popEventListener(context: any): void;
    }
}

declare namespace RideStylerShowcase {
    enum States {
        ChooseVehicle = 0,
        Visualize = 1
    }
}
declare namespace RideStylerShowcase.state {
    interface StateChangedEvent {
        oldState: States;
        newState: States;
        newData: StateData;
    }
    interface StateChangedCallback {
        /**
         * @param event  The state changed event
         * @return       If returning false, cancel the state change
         */
        (event: StateChangedEvent): boolean;
    }
    interface StateChangedCallback {
        /**
         * @param event  The state changed event
         * @return       If returning false, cancel the state change
         */
        (event: StateChangedEvent): boolean;
    }
    interface DebugStateCallback {
        /**
         * @param event    The state changed event
         * @param finished If false, the state change is beginning, otherwise the state change
         *                 has finished
         */
        (event: StateChangedEvent, finished: boolean): void;
    }
    interface StateExitCallback {
        /**
         * @param currentState  The state being changed from
         * @param newState      The state being changed to
         * @return              If returning false, cancel the state change
         */
        (currentState: States, newState: States, newData: StateData): boolean;
    }
    interface StateEnterCallback {
        /**
         * @param oldState      The state being changed from
         * @param currentState  The state being changed to
         * @return              If returning false, cancel the state change
         */
        (oldState: States, currentState: States, newData: StateData): boolean;
    }
    interface StateDataChangedCallback {
        /**
         * @param newData The new state data
         */
        (newData: StateData): void;
    }
    interface StateData {
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
    type PartialStateData = {
        [P in keyof StateData]?: StateData[P];
    };
    class RideStylerShowcaseState {
        /**
         * The current state
         */
        currentState: States;
        constructor(initialState: States);
        private currentData;
        getData(): StateData;
        setData(newData: StateData): void;
        extendData(dataExtension: PartialStateData): StateData;
        /**
         * A dictionary of States to StateCallbackRegisters
         */
        private callbacks;
        /**
         * State changed callbacks
         */
        private changeCallbacks;
        /**
         * Data changed callbacks
         */
        private dataChangedCallbacks;
        /**
         * Returns an exiting callback register for the specified state or creates
         * a new one
         * @param state The state to return a callback register for
         */
        private callbacksForState;
        /**
         * Register a callback that is triggered when exiting a specific state
         * @param state The state to register a exit callback for
         * @param callback The callback to execute when exiting the state
         */
        onExit(state: States, callback: StateExitCallback): void;
        /**
         * Register a callback that is triggered when entering a specific state
         * @param state The state to register an enter callback for
         * @param callback The callback to execute when entering the state
         */
        onEnter(state: States, callback: StateEnterCallback): void;
        /**
         * Register a function to call when the state has been changed
         * @param callback The callback to run
         */
        onChange(callback: StateChangedCallback): void;
        /**
         * Register a function to be called before the state data has been changed.
         * This allows callback functions to modify the data before it's sent to other callbacks.
         * @param callback The callback to run
         */
        beforeDataChange(callback: StateDataChangedCallback): void;
        /**
         * Register a function to be called after the state data has changed
         * @param callback The callback to run
         */
        afterDataChange(callback: StateDataChangedCallback): void;
        changeState(newState: States, newData?: StateData): void;
        debugCallback: DebugStateCallback;
    }
}

declare namespace RideStylerShowcase {
    /**
     * A list of all of our acceptable string keys
     */
    type StringKeys = "visualizer-custom-intro" | "vehicle-select-visualize-intro" | "vehicle-select-share-intro" | "select-your-vehicle" | "tires" | "wheels" | "suspension" | "paint" | "front" | "rear" | "vehicle-details" | "change-vehicle" | "wheel-details" | "tire-details" | 'select-paint' | 'select-wheels' | 'select-tires' | 'adjust-suspension' | 'change-wheel-size' | 'no-results' | 'no-wheel-results' | 'wheel-features-specs' | 'share-my-vehicle' | 'share-instructions' | 'no-description-wheel' | 'show-specs' | 'call' | 'size' | 'offset' | 'bolt-pattern' | 'centerbore' | 'price' | 'item-number' | 'brands' | 'finishes' | 'sizes' | 'all' | 'all-brands' | 'all-finishes' | 'all-sizes' | 'filter-results' | 'loading-ellipsis' | 'show-count-format-wheels' | 'show-count-format-tires' | 'specifications' | 'speed-rating' | 'any-speed-ratings' | 'features' | 'any-features' | 'finish' | 'summary' | 'check-out-my-vehicle';
    /**
     * Defines what a strings dictionary should look like
     */
    type IStringsLanguageDictionary = {
        [stringKey in StringKeys]: string;
    };
    interface IStringsLanguageFormatProvider {
        currency?: (amount: number, symbol: string) => string;
    }
    interface IStringsLanguage extends IStringsLanguageDictionary {
        format?: IStringsLanguageFormatProvider;
    }
    /**
     * A list of acceptable languages
     */
    enum LanguageKeys {
        En = 0
    }
    namespace strings {
        /**
         * Register a language to be used in the showcase
         * @param languageKey The key of the language you are registering
         * @param language The language provider
         */
        function registerLanguage(languageKey: LanguageKeys, language: IStringsLanguage, setAsDefault?: boolean): void;
        function registerLanguageOverrides(data: object, languageKey?: LanguageKeys): void;
        /**
         * Set a language to be used by default, when no key is passed into getStrings
         * @param languageKey The language key to use by default
         * @returns true, if the language is registered and set as default; otherwise false
         */
        function setDefaultLanguage(languageKey: LanguageKeys): boolean;
        /**
         * Tells you whether or not a language is registered
         * @param languageKey The key for the language
         */
        function languageIsRegistered(languageKey: LanguageKeys): boolean;
        /**
         * Get a string from the registered strings
         * @param key The string key to return a string for
         * @param languageKey The language you want to use
         */
        function getString(key: StringKeys, languageKey?: LanguageKeys): string;
        function format(languageKey?: LanguageKeys): IStringsLanguageFormatProvider;
    }
}

declare namespace RideStylerShowcase.styles {
    type BreakpointKey = 'phone-portrait' | 'phone-landscape' | 'tablet' | 'desktop' | 'desktop-xl' | 'tv';
    type Breakpoint = [BreakpointKey, number];
    class StyleManager {
        element: HTMLElement;
        constructor(element: HTMLElement);
        initialized: RideStylerPromise;
        private resolveOnDOMLoad;
        /**
         * Load the CSS from {@link RideStylerShowcase.css} into the first HEAD element
         * found in the document of the container
         */
        private initializeCSS;
        private initializeStyleClasses;
        private initializeBreakpoints;
        private resize;
        private resized;
        private breakpointChanged;
        /**
         * A callback each time the element is resized
         */
        onResize: () => void;
        /**
         * A callback for after the user is done resizing the element
         */
        onResized: () => void;
        /**
         * A callback for after the breakpoint has changed
         */
        onBreakpointChanged: (newBreakpoint: Breakpoint) => void;
        private watchSize;
        /**
         * The currently applied breakpoint
         */
        private currentBreakpoint;
        getCurrentBreakpoint(): Breakpoint;
        private applyBreakpointClasses;
    }
}

declare namespace RideStylerShowcase {
    interface RideStylerShowcaseOptions {
        debug?: {
            events?: boolean;
            state?: boolean;
        };
    }
    type RideStylerShowcaseSettings = (RideStylerShowcaseOptions & RideStylerShowcaseAPIInitializeSettingsKeyToken) | (RideStylerShowcaseOptions & RideStylerShowcaseAPIInitializeSettingsUser);
    interface RideStylerShowcaseContainer extends HTMLElement {
        ridestylerShowcase: RideStylerShowcaseInstance;
    }
    class RideStylerShowcaseInstance {
        /**
         * The main container for the showcase
         */
        container: RideStylerShowcaseContainer;
        /**
         * The main components (screens for example) to be rendered in the showcase
         */
        private mainComponents;
        /**
         * Other components to be rendered in the showcase
         */
        private otherComponents;
        /**
         * A mapping of states to main components
         */
        private stateComponentMapping;
        /**
         * The currently visible main component
         */
        private currentMainComponent;
        /**
         * The state handler
         */
        state: state.RideStylerShowcaseState;
        /**
         * Theme information used to customize the interface
         */
        theme: object;
        /**
         * The style manager
         */
        style: styles.StyleManager;
        /**
         * The event handler
         */
        events: events.EventHandler;
        /**
         * The url check handler
         */
        parameters: parameters.RideStylerShowcaseParameters;
        /**
         * Settings specified when the showcase was created
         */
        settings: RideStylerShowcaseSettings;
        /**
         * Settings loaded from the API
         */
        settingsFromAPI: api.settings.RideStylerShowcaseSettingsFromAPI;
        /**
         * The filter controller
         */
        filters: filters.FilterController;
        /**
         * Create a RideStyler Showcase instance and do not initialize it
         */
        constructor();
        /**
         * Create a RideStyler Showcase instance and initialize it inside a container with the specified ID
         * @param containerID Specifies the ID of the container to initialize the showcase in
         */
        constructor(containerID: string, settings?: RideStylerShowcaseSettings);
        /**
         * Create a RideStyler Showcase instance and initialize it inside the specified container
         * @param container Specifies the element to initialize the showcase in
         */
        constructor(container: HTMLElement, settings?: RideStylerShowcaseSettings);
        /**
         * Register the main components used by the showcase
         */
        private registerComponents;
        /**
         * Set the container of this showcase instance and initialize (or re-initialize) it
         * @param container The container to initialize this showcase in
         */
        initialize(container: HTMLElement): void;
        private initializeState;
        private initializeStyle;
        private initializeParameters;
        private initializeFilters;
        private initializeComponents;
        private onStateChanged;
        private activeLoadingSessionKeys;
        private updateCurrentComponent;
    }
    /**
     * Create a RideStyler Showcase instance and do not initialize it
     * @param settings
     */
    function create(settings?: RideStylerShowcaseSettings): any;
    /**
     * Create a RideStyler Showcase instance and initialize it inside a container with the specified ID
     * @param containerID Specifies the ID of the container to initialize the showcase in
     * @param settings
     */
    function create(containerID: string, settings?: RideStylerShowcaseSettings): any;
    /**
     * Create a RideStyler Showcase instance and initialize it inside the specified container
     * @param container Specifies the element to initialize the showcase in
     * @param settings
     */
    function create(container: HTMLElement, settings?: RideStylerShowcaseSettings): any;
}

declare namespace RideStylerShowcase {
    abstract class ComponentBase implements IComponent {
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        protected readonly showcase: RideStylerShowcaseInstance;
        protected readonly events: events.EventHandler;
        protected readonly state: state.RideStylerShowcaseState;
        protected readonly parameters: parameters.RideStylerShowcaseParameters;
        /**
         * The main element for this component
         */
        component: HTMLElement;
        /**
         * A overridable function called after the base component is initialized
         * @virtual
         */
        protected initializeComponent(): void;
    }
}

declare namespace RideStylerShowcase {
    interface IComponent {
        /**
         * The main element for this component
         */
        component: HTMLElement;
    }
    interface IComponentConstructable {
        new (showcaseInterface: RideStylerShowcaseInstance): IComponent;
    }
}

declare namespace RideStylerShowcase {
    abstract class MainComponentBase extends ComponentBase {
        component: HTMLElement;
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        /**
         * A overridable function called after the base component is constructed
         * @virtual
         */
        protected initializeComponent(): void;
        /**
         * A overridable function called after the main component is constructed
         * @virtual
         */
        protected initializeMainComponent(): void;
        private _visible;
        private _animating;
        /**
         * @param container The container to build the component in
         */
        protected abstract buildComponent(container: HTMLElement): any;
        /**
         * Whether or not this component is visible
         * @return true, if this component is visible, otherwise false
         */
        isVisible(): boolean;
        /**
         * Hide/show the component without animation
         * @param visible If true, show the component, otherwise hide the component
         */
        setVisible(visible: boolean): void;
        private setVisibleStyling;
        private callWhenDoneAnimating;
        /**
         * Called before this component is shown
         * @virtual
         */
        protected onShow(): void;
        /**
         * Called before this component is shown but after it has received dimensions
         */
        protected onDisplay(): void;
        /**
         * Called after the component is shown
         * @virtual
         */
        protected onShown(): void;
        /**
         * Called before the component is hidden
         * @virtual
         */
        protected onHide(): void;
        /**
         * Called after the component is hidden
         * @virtual
         */
        protected onHidden(): void;
        /**
         * Animate the component into the view
         */
        show(callback?: (this: this) => void): void;
        /**
         * Animate the component out of the view
         */
        hide(callback?: (this: this) => void): void;
        /**
         * Hide components after transition out
         */
        onTransitionEnd(): void;
    }
}

declare namespace RideStylerShowcase {
    class ResizeableResourceImage<Endpoint extends ridestyler.RideStylerAPIEndpoint, ImageRenderingInstructions extends ridestyler.RidestylerAPIActionRequestMapping[Endpoint] | ridestyler.Requests.ImageRenderRequest = ridestyler.RidestylerAPIActionRequestMapping[Endpoint]> {
        /**
         * The bounding container for the image
         */
        private readonly container;
        /**
         * The image
         */
        readonly image: HTMLImageElement;
        /**
         * The currently detected size of the container
         */
        private currentSize;
        /**
         * The RideStyler API action to call to render the image
         */
        private readonly action;
        /**
         * A set of base instructions to render the vehicle with
         */
        private baseInstructions;
        /**
         * The current instructions/parameters to render the image with
         */
        private instructions;
        /**
         * If true the image is visible (or transitioning to be visible)
         */
        private visible;
        /**
         * If true, transitions should be used
         */
        private readonly useTransitions;
        /**
         * The class to attach to the element to show it with a transition
         */
        private readonly transitionInClass;
        /**
         * A callback to attach to the image load event
         */
        private readonly imageLoadCallback;
        /**
         * A callback to attach to the image error event
         */
        private readonly imageErrorCallback;
        /**
         * A callback to call when the image is displayed
         */
        private readonly imageDisplayCallback;
        /**
         * The padding of the container or padding calculator
         */
        private readonly padding;
        private readonly events;
        /**
         * @param container The container to render the image in
         * @param options
         */
        constructor(container: HTMLElement, options: {
            /**
             * The image endpoint
             */
            action: Endpoint;
            /**
             * Instructions for rendering the image
             */
            instructions?: ImageRenderingInstructions;
            /**
             * Base instructions for rendering the image
             */
            baseInstructions?: ImageRenderingInstructions;
            /**
             * If true, load the image when first created
             * @default false
             */
            loadInitially?: boolean;
            /**
             * If true, listen to the window resize event
             * @default true
             */
            listenToWindowResize?: boolean;
            /**
             * A function to call each time the image is loaded
             */
            onLoad?: ResizeableResourceImage.ImageLoadCallback;
            /**
             * A function to call when the image has an error loading
             */
            onError?: ResizeableResourceImage.ImageErrorCallback;
            /**
             * A function to call when the image is fully visible (after any transitions)
             */
            onDisplayed?: ResizeableResourceImage.ImageEventCallback;
            /**
             * The padding for the container to display the image in. If not specified
             * it will be calculated. If false padding will not be calculated.
             */
            padding?: false | ResizeableResourceImage.Box | ResizeableResourceImage.PaddingCalculator;
            /**
             * If specified use the following transition class to display the image.
             * If unspecified don't use transitions
             * @default undefined
             */
            transitionClass?: string;
            /**
             * The class to apply to the image to transition it "in"
             * @default "in"
             */
            transitionInClass?: string;
            /**
             * The default size at which to render the image if one cannot
             * be calculated from the container
             * @default {"width": 200, "height": 200}
             */
            defaultSize?: {
                width: number;
                height: number;
            };
        });
        /**
         * Call this function after the component will no longer be used
         * to remove any internally attached event handlers
         */
        destroy(): void;
        private resizeCallback;
        /**
         * Attached to the image error event
         * @param errorEvent The error event
         */
        private onImageError;
        /**
         * Attached to the image load event
         * @param event The image load event
         */
        private onImageLoad;
        /**
         * Show the image
         */
        private show;
        /**
         * Calculate the size of the image from the container
         */
        private calculateRenderSize;
        private sizeIsDifferent;
        /**
         * Update or create the image
         * @param instructions New instructions to render the image with
         */
        update(instructions?: ImageRenderingInstructions): void;
    }
    namespace ResizeableResourceImage {
        interface Box {
            width: number;
            height: number;
        }
        interface ImageEventCallback {
            (image: HTMLImageElement): void;
        }
        interface ImageLoadCallback extends ImageEventCallback {
            (image: HTMLImageElement, event: Event): void;
        }
        interface ImageErrorCallback extends ImageEventCallback {
            (image: HTMLImageElement, event: ErrorEvent): void;
        }
        interface PaddingCalculator {
            (container: Element): Box;
        }
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseBackground extends ComponentBase {
        component: HTMLElement;
        protected initializeComponent(): void;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseButtonPicker<T> extends ComponentBase {
        optionClicked: boolean;
        private optionContainer;
        constructor(showcaseInstance: RideStylerShowcaseInstance, options: RideStylerShowcaseButtonPicker.Settings);
        setOptions(options: RideStylerShowcaseButtonPicker.Option<T>[]): void;
        private onOptionClick;
        protected onOptionSelected(value: T): void;
        optionSelectedCallback: (value: T) => void;
    }
    namespace RideStylerShowcaseButtonPicker {
        interface Settings {
            title: string;
        }
        interface OptionElement<T> extends HTMLElement {
            value: T;
        }
        interface Option<T> {
            label: string;
            value: T;
            active?: boolean;
        }
    }
}

declare namespace RideStylerShowcase {
    import WheelFitmentDescriptionModel = ridestyler.Descriptions.WheelFitmentDescriptionModel;
    class RideStylerShowcaseChangeWheelSize extends RideStylerShowcaseButtonPicker<WheelFitmentDescriptionModel> {
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        setFitmentOptions(fitments: WheelFitmentDescriptionModel[], activeFitment?: WheelFitmentDescriptionModel): void;
    }
}

declare namespace RideStylerShowcase {
    import Options = RideStylerShowcaseModal.Options;
    class RideStylerShowcaseModal extends ComponentBase {
        /**
         * The main modal element
         */
        component: HTMLElement;
        /**
         * The currently displayed backdrop
         */
        backdrop: HTMLElement;
        /**
         * The parent element of the modal
         */
        private parent;
        /**
         * The options that the modal was created with
         */
        protected readonly options: Options;
        constructor(showcaseInstance: RideStylerShowcaseInstance, options: Options);
        /**
         * Build the modal DOM structure
         */
        protected buildModal(): void;
        private buildActions;
        /**
         * Called when this modal is layed-out and about to transition in
         * @virtual
         */
        protected onShow(): void;
        /**
         * Called when this modal is visible
         * @virtual
         */
        protected onShown(): void;
        /**
         * Called when this modal is about to transition out
         * @virtual
         */
        protected onHide(): void;
        /**
         * Called when this modal is hidden
         * @virtual
         */
        protected onHidden(): void;
        show(): RideStylerPromise;
        hide(): RideStylerPromise;
        setVisibility(visible: boolean): void;
        /**
         * Creates the backdrop if needed
         */
        private createBackdropIfNeeded;
    }
    class RideStylerShowcaseModalBackdrop extends ComponentBase {
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        private buildBackdrop;
        protected initializeComponent(): void;
        /**
         * Hide or show the backdrop based off the number of visible modals
         */
        private update;
        show(): RideStylerPromise;
        hide(): RideStylerPromise;
        setVisibility(visible: boolean): void;
    }
    namespace RideStylerShowcaseModal {
        interface ModalElement extends HTMLElement {
            modal: RideStylerShowcaseModal;
        }
        interface Action extends HTMLHelper.createButtonOptions {
            /**
             * The action to preform when this button is clicked
             */
            action: 'hide-modal' | Function;
        }
        interface Options {
            removeOnHidden?: boolean;
            full?: boolean;
            actions?: Action[];
        }
    }
}

declare namespace RideStylerShowcase {
    import Option = RideStylerShowcaseOptionMenu.Option;
    class RideStylerShowcaseOptionMenu implements IComponent {
        component: HTMLElement;
        readonly name: string;
        value: any;
        constructor(name: string, options?: Option[]);
        setLoading(loading: boolean): void;
        private generateOptionElement;
        private clearOptions;
        private appendOptions;
        setOptions(options: Option[]): void;
        setValue(value: any): void;
        onChange: (newValue: any) => void;
        private onClicked;
    }
    namespace RideStylerShowcaseOptionMenu {
        interface Option {
            label: string;
            value: any;
        }
        interface OptionElement extends HTMLElement {
            value?: any;
        }
    }
}

declare namespace RideStylerShowcase {
    abstract class RideStylerShowcasePaginationComponent extends ComponentBase {
        protected optionContainer: HTMLElement;
        protected selectedOption: HTMLElement;
        protected prevButton: HTMLButtonElement;
        protected nextButton: HTMLButtonElement;
        protected touchScrollHandler: Impetus;
        /**
         * If true, this has more results that it can load
         */
        protected hasMoreResults: boolean;
        /**
         * If true, this is loading
         */
        protected isLoading: boolean;
        /**
         * If true, the first load is being preformed or hasn't been preformed yet.
         */
        protected isFirstLoad: boolean;
        /**
         * Set this to false to not show the no results message
         */
        protected enableShowNoResults: boolean;
        protected initializeComponent(): void;
        /**
         * Implement this to load additional results
         */
        protected abstract _loadMore(): RideStylerPromise;
        loadMore(): RideStylerPromise;
        updateBounds(): void;
        private onScroll;
        protected onEndVisible(): void;
        private onComponentClick;
        private updatePaginationButtons;
        /**
         * Adds a spinner to the end of the list indicating something is loading
         */
        protected addOptionLoader(): void;
        protected clearOptionLoader(): void;
        protected addOptionElements(elements: Node[] | Node): void;
        protected noResultsElement: HTMLElement;
        protected showNoResults(): void;
        clearOptions(): void;
        update(): void;
        scrollTo(newLeft: number): void;
        previousPage(): void;
        nextPage(): void;
        selectOption(optionElement: HTMLElement): void;
        /**
         * Set or remove the loading class from the currently selected option
         * @param isLoading If true, add the loading class, otherwise remove it
         */
        setOptionIsLoading(isLoading: boolean): void;
        /**
         * Called when an option element is clicked on.
         * @param optionElement The option element that was clicked on
         */
        protected onOptionClick(optionElement: HTMLElement): void;
    }
}

declare namespace RideStylerShowcase {
    import VehiclePaintSchemeDescriptionModel = ridestyler.Descriptions.VehiclePaintSchemeDescriptionModel;
    class RideStylerShowcasePaintSelector extends RideStylerShowcasePaginationComponent {
        private readonly vehicleConfigurationID;
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        protected _loadMore(): ridestyler.RideStylerPromise<ridestyler.Responses.VehiclePaintSchemeDescriptionResultModel, ridestyler.Responses.VehiclePaintSchemeDescriptionResultModel>;
        private createOptions;
        onPaintSchemeSelected: (paintScheme: VehiclePaintSchemeDescriptionModel) => void;
        protected onOptionClick(optionElement: HTMLElement): void;
        private static createAttributeLabel;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcasePopover {
        component: HTMLElement;
        constructor();
        show(): void;
        hide(): void;
        setVisible(visible: boolean): void;
        isVisible(): boolean;
        toggle(): void;
    }
}

declare namespace RideStylerShowcase {
    import Page = RideStylerShowcaseProductModal.Page;
    abstract class RideStylerShowcaseProductModal extends RideStylerShowcaseModal {
        protected titleElement: HTMLElement;
        protected brandTitleElement: HTMLElement;
        protected subtitleElement: HTMLElement;
        protected summaryElement: HTMLElement;
        protected summaryContainer: HTMLElement;
        protected toggleButton: RideStylerShowcaseToggleButton;
        protected imageContainer: HTMLElement;
        protected image: ResizeableResourceImage<any>;
        protected pages: Page[];
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        protected buildModal(): void;
        /**
         * Create the ResizeableResourceImage element for this product
         */
        protected abstract createImage(): ResizeableResourceImage<any>;
        /**
         * Add a new page to the product modal and toggle button
         * @param page The new page
         * @param setVisible If true, show the page after adding it
         */
        protected addPage(page: Page, setVisible?: boolean): void;
        /**
         * Set the page as visible and hide the other pages, update the state of the toggle button
         * @param newPage The page to show
         */
        protected showPage(newPage: Page): void;
        protected onHidden(): void;
    }
    namespace RideStylerShowcaseProductModal {
        interface Page {
            /**
             * The container to show when the page is activated
             */
            container: HTMLElement;
            /**
             * The label to show for the container in the toggle button
             */
            label: string;
        }
    }
}

declare namespace RideStylerShowcase {
    interface ProductElement<T> extends Node {
        product?: T;
    }
    abstract class RideStylerShowcaseProductSelector<DataType, FilterType extends ridestyler.Requests.ActionRequestPagedModel> extends RideStylerShowcasePaginationComponent {
        protected currentFilters: FilterType;
        protected readonly defaultFilters: FilterType;
        protected readonly resultsPerLoad: number;
        protected count: number;
        protected index: number;
        protected _loadMore(): ridestyler.RideStylerPromise<DataType[], ridestyler.RideStylerAPIResponse>;
        protected abstract countResults(filters: FilterType): RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
        protected abstract getResults(filters: FilterType): RideStylerPromise<DataType[], ridestyler.RideStylerAPIResponse>;
        /**
         * Set filters and reload
         * @param newFilters The new filters
         * @param loadResults   If true (by default), reload the product selector with the first page of results
         */
        setFilters(newFilters: FilterType, loadResults?: boolean): void;
        /**
         * Update filters and reload
         * @param filterUpdates The filter properties to update
         * @param loadResults   If true (by default), reload the product selector with the first page of results
         */
        updateFilters(filterUpdates: FilterType, loadResults?: boolean): void;
        /**
         * Returns false if the product should not be displayed in the list
         * @param product The product
         */
        protected abstract productFilter(product: DataType): boolean;
        /**
         * Returns a URL for the product or false-ish if there is not one
         * @param product The product
         */
        protected abstract productImageSource(product: DataType): string;
        protected abstract productImageLabels(product: DataType): {
            primary: string;
            secondary?: string;
            tertiary?: string;
        };
        private createOptions;
        onOptionClick(optionElement: HTMLElement): void;
        productSelectedCallback: (product: DataType) => void;
        protected onProductClick(product: DataType): void;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseQRCodeComponent implements IComponent {
        private qrCodeElement;
        private qrCode;
        component: HTMLElement;
        constructor(link?: string);
        displayURL(url: string): void;
    }
}

declare namespace RideStylerShowcase.share {
    abstract class ShareButton implements IComponent {
        readonly component: HTMLButtonElement;
        /**
         * The current URL to share
         */
        protected currentURL: string;
        /**
         * The currently rendered vehicle instructions
         */
        protected currentInstructions: ridestyler.Requests.VehicleRenderInstructions;
        /**
         * The tags to attach to the message
         */
        protected tags: string[];
        /**
         * The text to share with the URL
         */
        protected message: string;
        constructor(settings: ShareButton.Settings);
        /**
         * Update the URL for this share button to share
         * @param url The URL to share
         */
        setURL(url: string): void;
        /**
         * Attach tags to the message being shared
         * @param tags The tags to attach to the message
         */
        setTags(tags: string[]): void;
        /**
         * Set a message to share with the URL
         * @param message The message to share along with the URL
         */
        setMessage(message: string): void;
        /**
         * Set the current instructions to share
         * @param instructions The instructions to set
         */
        setInstructions(instructions: ridestyler.Requests.VehicleRenderInstructions): void;
        /**
         * Called every time the share button is clicked
         * @virtual
         */
        protected onClick(): void;
        /**
         * Share the current URL
         * @virtual
         */
        share(): void;
        protected openNewWindow(url: string, settings?: {
            width?: number;
            height?: number;
            enableScrollbars?: boolean;
            enableResizeable?: boolean;
            enableToolbar?: boolean;
            enableLocation?: boolean;
            target?: string;
        }): void;
        protected getShareRedirectURL(): string;
    }
    namespace ShareButton {
        interface Settings {
            className?: string;
            title?: string;
        }
    }
    class TwitterShareButton extends ShareButton {
        constructor();
        /**
         * Share the current URL via Twitter
         */
        share(): void;
    }
    class FacebookShareButton extends ShareButton {
        constructor();
        /**
         * Share the current URL via Facebook
         */
        share(): void;
    }
    class EmailShareButton extends ShareButton {
        private popover;
        constructor();
        private buildPopover;
        onClick(): void;
    }
    class NewWindowShareButton extends ShareButton {
        constructor();
        /**
         * Share the current URL by opening it in a new window
         */
        share(): void;
    }
    class QRShareButton extends ShareButton {
        private popover;
        private qrCode;
        constructor();
        setURL(url: string): void;
        onClick(): void;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseShareModal extends RideStylerShowcaseModal {
        private readonly vehicleRenderInstructions;
        private shareButtons;
        constructor(showcaseInstance: RideStylerShowcaseInstance, vehicleRenderInstructions: ridestyler.Requests.VehicleRenderInstructions);
        private vehicleViewport;
        private rotateElement;
        private imageType;
        /**
         * Build the DOM structure
         */
        protected buildModal(): void;
        private createShareButtons;
        protected onShow(): void;
        protected onHidden(): void;
        private resizedCallback;
        private updateViewport;
        private getShareURL;
        private setupViewport;
        private canSwitchAngle;
        private onInstructionsChanged;
        private setEnabled;
        private updateURL;
        private switchAngle;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseSuspensionSelector extends ComponentBase {
        private frontAndRear;
        protected initializeComponent(): void;
        suspensionChangeCallback: (renderRequestChange: ridestyler.Requests.VehicleRenderInstructions) => void;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseTabBar extends ComponentBase {
        protected initializeComponent(): void;
        private mode;
        tabSwitchedCallback: RideStylerShowcaseTabBar.TabSwitchedCallback;
        tabs: RideStylerShowcaseTabBar.Tab[];
        currentTab: RideStylerShowcaseTabBar.Tab;
        setMode(mode: RideStylerShowcaseTabBar.Mode): void;
        private updateTabDisplay;
        setTabs(tabs: RideStylerShowcaseTabBar.TabCreateOptions[]): any;
        setTabs(tabs: RideStylerShowcaseTabBar.Tab[]): any;
        clearActiveTab(): void;
        setActiveTab(newTab: RideStylerShowcaseTabBar.Tab): void;
        private onClick;
        private onTabClick;
        tabForLabel(label: string): RideStylerShowcaseTabBar.Tab;
        tabForElement(element: HTMLElement): RideStylerShowcaseTabBar.Tab;
    }
    namespace RideStylerShowcaseTabBar {
        type Mode = 'horizontal' | 'vertical';
        interface TabSwitchedEvent {
            newTab: Tab;
            oldTab: Tab;
        }
        interface TabSwitchedCallback {
            (this: RideStylerShowcaseTabBar, event: TabSwitchedEvent): void;
        }
        interface TabCreateOptions {
            icon: string;
            label: string;
            key: string;
        }
        class Tab {
            readonly iconClass: string;
            readonly label: string;
            readonly element: HTMLElement;
            readonly key: string;
            private backgroundMode;
            private readonly backgroundPolygon;
            constructor(createOptions: TabCreateOptions);
            updateBackgroundPolygon(mode: RideStylerShowcaseTabBar.Mode): void;
        }
    }
}

declare namespace RideStylerShowcase {
    import Column = RideStylerShowcaseTable.Column;
    import Options = RideStylerShowcaseTable.Options;
    class RideStylerShowcaseTable<RowType> extends ComponentBase {
        protected readonly options: Options<RowType>;
        protected readonly columns: Column<RowType>[];
        protected tbody: HTMLTableSectionElement;
        static emptyCellString: string;
        constructor(showcaseInstance: RideStylerShowcaseInstance, options: Options<RowType>);
        protected generateHeaderCell(column: Column<RowType>): HTMLTableHeaderCellElement;
        protected generateHeaders(thead: HTMLTableSectionElement): void;
        protected generateRowCell(row: RowType, column: Column<RowType>): HTMLTableCellElement;
        protected generateRow(row: RowType): HTMLTableRowElement;
        appendRows(rows: RowType[]): void;
        protected setLoading(loading: boolean): void;
        static formatCell<T>(object: T, key: keyof T, postfix?: string): HTMLTableCellElement;
    }
    namespace RideStylerShowcaseTable {
        interface HeaderGenerator<RowType> {
            (column: Column<RowType>): HTMLTableHeaderCellElement | string;
        }
        interface CellGenerator<RowType> {
            (row: RowType, column: Column<RowType>): HTMLTableCellElement | string;
        }
        interface Column<RowType> {
            header: string | HeaderGenerator<RowType>;
            cell: keyof RowType | CellGenerator<RowType>;
        }
        interface Options<RowType> {
            /**
             * Column settings
             */
            columns: Column<RowType>[];
            /**
             * Rows to initialize the table with
             */
            rows?: RowType[];
            /**
             * If true, start the table in the loading state
             */
            startLoading?: boolean;
        }
    }
}

declare namespace RideStylerShowcase {
    import TireFilterModel = ridestyler.Requests.TireFilterModel;
    import TireModelDescriptionModel = ridestyler.Descriptions.TireModelDescriptionModel;
    class RideStylerShowcaseTireSelector extends RideStylerShowcaseProductSelector<TireModelDescriptionModel, TireFilterModel> {
        private readonly vehicleTireOptionID;
        private readonly supportedVehicleImagery;
        protected readonly defaultFilters: TireFilterModel;
        protected currentFilters: TireFilterModel;
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        protected countResults(filters: TireFilterModel): ridestyler.RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
        protected getResults(filters: TireFilterModel): ridestyler.RideStylerPromise<TireModelDescriptionModel[], ridestyler.RideStylerAPIResponse>;
        protected productFilter(product: TireModelDescriptionModel): boolean;
        protected productImageSource(product: TireModelDescriptionModel): string;
        protected productImageLabels(product: TireModelDescriptionModel): {
            primary: string;
            secondary?: string;
            tertiary?: string;
        };
    }
}

declare namespace RideStylerShowcase {
    import Option = RideStylerShowcaseToggleButton.Option;
    import OptionChangedCallback = RideStylerShowcaseToggleButton.OptionChangedCallback;
    class RideStylerShowcaseToggleButton extends ComponentBase {
        /**
         * The current value of the toggle button
         */
        value: string;
        /**
         * Attach a change function to call when the value is changed
         */
        onChanged: OptionChangedCallback;
        /**
         * Create the DOM for the toggle button
         *
         * @override
         */
        protected initializeComponent(): void;
        /**
         * Called when the toggle button is clicked on
         */
        private onClicked;
        private selectOptionElement;
        setValue(value: string): void;
        setOptions(options: Option[]): void;
        addOption(option: Option): void;
    }
    namespace RideStylerShowcaseToggleButton {
        interface OptionElement extends HTMLElement {
            value: string;
        }
        interface OptionChangedCallback {
            (value: string): void;
        }
        interface Option {
            label: string;
            value: string;
        }
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseVehicleSelection extends MainComponentBase {
        private chooseVehicleButton;
        private contentContainer;
        private wheelContainer;
        private modal;
        protected initializeMainComponent(): void;
        protected buildComponent(container: HTMLElement): void;
        private buildCopy;
        private onAuthenticated;
        private onVehicleSelected;
        /**
         * Show the passed in wheel models in the wheel showcase section of the vehicle selection screen
         * @param models The wheel models to show
         */
        private showWheels;
        private generateVehiclePreviewSettings;
    }
}

declare namespace RideStylerShowcase {
    class RideStylerShowcaseVehicleVisualization extends MainComponentBase {
        private productSelector;
        private viewport;
        private tabBar;
        private changeWheelSize;
        private titleElement;
        private rotateElement;
        private filterButton;
        private shareButton;
        private vehicleDetails;
        private tabs;
        private customizationComponentOrder;
        private customizationComponentContainer;
        private customizationComponents;
        private customizationComponentSettings;
        private resultsArr;
        private components;
        /**
         * The ID of the currently displayed vehicle
         */
        private vehicleConfigurationID;
        /**
         * The description of the currently displayed vehicle
         */
        private vehicleDescription;
        private targetDiameter;
        /**
         * The Image Type for displaying what angle the car is being viewed
         */
        private imageType;
        /**
         * The ID of the currently displayed OE tire option for the vehicle
         */
        private vehicleTireOptionID;
        /**
         * A description of the currently selected OE tire option
         */
        private vehicleTireOptionDescription;
        /**
         * The currently selected OE tire option
         */
        private vehicleTireOption;
        /**
         * The description model of the currently displayed vehicle,
         * loaded from the API
         */
        private vehicleDescriptionModel;
        /**
         * The render instructions for the currently displayed vehicle
         */
        private currentRenderInstructions;
        protected buildComponent(container: HTMLElement): void;
        private setupViewport;
        private resumeSessionState;
        /**
         * Removes the active class from the diameter options and adds it to the correct element
         */
        activeWheelDiameterSelect(results: any): void;
        private updateTabs;
        private updateTabLayout;
        private setupTabs;
        private vehicleDifferentFromState;
        protected onDisplay(): void;
        private onVehicleChanged;
        private initializeForNewVehicle;
        private activeCustomizationComponent;
        private setActiveCustomizationComponent;
        private getComponentKey;
        private updateViewport;
        private canSwitchAngle;
        /**
         * Loads the results from a Wheel/GetFitmentDescriptions request and returns the best fitment option
         * for the returned WheelFitmentDescriptions.
         * @param model The wheel model used for querying the fitment descriptions
         * @param fitmentDescriptionResult The response from a Wheel/GetFitmentDescriptions request for the specified model
         */
        private loadWheelFitmentDescriptions;
        private showFilters;
        private switchAngle;
    }
}


declare namespace RideStylerShowcase {
    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel;
    class RideStylerShowcaseWheelModal extends RideStylerShowcaseProductModal {
        protected image: ResizeableResourceImage<"wheel/image">;
        private specsTable;
        private summaryTable;
        constructor(showcaseInstance: RideStylerShowcaseInstance, wheelModel: WheelModelDescriptionModel);
        private buildSummaryTable;
        private buildSpecsPage;
        protected createImage(): ResizeableResourceImage<"wheel/image">;
        private static getFitmentRetailPriceDataObject;
        private static getFitmentSizeDescription;
        private static getFitmentPrice;
        private static getFitmentItemNumber;
    }
}

declare namespace RideStylerShowcase {
    import WheelFilterModel = ridestyler.Requests.WheelFilterModel;
    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel;
    class RideStylerShowcaseWheelSelector extends RideStylerShowcaseProductSelector<WheelModelDescriptionModel, WheelFilterModel> {
        private readonly vehicleConfigurationID;
        private readonly supportedVehicleImagery;
        protected readonly defaultFilters: WheelFilterModel;
        protected currentFilters: WheelFilterModel;
        constructor(showcaseInstance: RideStylerShowcaseInstance);
        protected showNoResults(): void;
        protected countResults(filters: WheelFilterModel): ridestyler.RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;
        protected getResults(filters: WheelFilterModel): ridestyler.RideStylerPromise<WheelModelDescriptionModel[], ridestyler.RideStylerAPIResponse>;
        protected productFilter(product: WheelModelDescriptionModel): boolean;
        protected productImageSource(product: WheelModelDescriptionModel): string;
        protected productImageLabels(product: WheelModelDescriptionModel): {
            primary: string;
            secondary?: string;
            tertiary?: string;
        };
    }
}

declare namespace RideStylerShowcase {
    class TireDetails extends ComponentBase {
        private tireNameElement;
        private tireDescriptionElement;
        protected initializeComponent(): void;
        private onDataChange;
    }
}

declare namespace RideStylerShowcase {
    class VehicleDetails extends ComponentBase {
        /**
         * The vehicle description
         */
        private vehicleDescriptionElement;
        /**
         * The paint swatch next to the vehicle description
         */
        private vehiclePaintSwatchElement;
        /**
         * The tire size
         */
        private tireSizeElement;
        protected initializeComponent(): void;
        /**
         * A call back for when the paint swatch was clicked on
         */
        paintSwatchClickCallback: () => void;
        private onDataChange;
    }
}

declare namespace RideStylerShowcase {
    class WheelDetails extends ComponentBase {
        private wheelNameElement;
        private wheelDescriptionElement;
        protected initializeComponent(): void;
        protected showWheelModal(): void;
        protected onDataChange(data: state.StateData): void;
    }
}

declare namespace RideStylerShowcase {
    import FilterProvider = filters.FilterProvider;
    class RideStylerShowcaseFilterModal<FilterType extends object, FilterProviderType extends FilterProvider<FilterType>> extends RideStylerShowcaseModal {
        private readonly filterProvider;
        private menus;
        private readonly showCountTextFormat;
        private showButton;
        constructor(showcaseInstance: RideStylerShowcaseInstance, options: RideStylerShowcaseFilterModal.Options<FilterProviderType>);
        private buildFilterMenus;
        private buildShowButton;
        private getValues;
        private getFilters;
        private updateCount;
        /**
         * Set the count text to a loading state
         * @param count
         */
        private setCountText;
    }
    namespace RideStylerShowcaseFilterModal {
        interface Options<FilterProviderType> {
            filterProvider: FilterProviderType;
            showCountTextFormat: string;
        }
    }
}

declare namespace RideStylerShowcase.ArrayHelper {
    function copy<ArrayType extends Array<any>>(array: ArrayType): ArrayType;
    function remove<T>(array: T[], itemMatch: T): T[];
    function remove<T>(array: T[], itemMatch: (T: any) => boolean): T[];
    function filter<T>(array: T[], itemMatch: (T: any) => boolean): T[];
    function map<T, U>(array: T[], mapFunction: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    function reduce<T>(array: T[], reducer: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
    function reduce<T, U = T>(array: T[], reducer: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
}

declare namespace RideStylerShowcase.BoxHelper {
    /**
     * Bound a box to a minimum and/or maximum bounding box
     * @param box The box to bound
     * @param boundsMin The minimum bounding box
     * @param boundsMax The maximum bounding box
     */
    function bound(box: Box, boundsMin?: Box | number, boundsMax?: Box | number): Box;
    /**
     * Scale a box by a scalar
     * @param box The box
     * @param scalar The number to scale the box by
     */
    function scale(box: Box, scalar: number | Box): Box;
    /**
     * Returns the box, without decimals
     * @param box The box
     */
    function floor(box: Box): {
        width: number;
        height: number;
    };
    interface Box {
        width: number;
        height: number;
    }
}

declare namespace RideStylerShowcase {
    type Guid = number[];
    namespace GUIDHelper {
        /**
         * Parse a Guid into a common format
         * @param id The ID to parse
         * @param buffer An existing Guid/array to write to
         * @param offset The offset to begin writing at
         */
        function parse(id: string, buffer?: Guid, offset?: number): Guid;
        /**
         * Convert a parsed Guid back into a string
         * @param id A parsed Guid to unparse
         * @param offset Starting index in the id to begin reading from
         */
        function unparse(id: Guid, offset?: number): string;
        /**
         * Compare two Guids to determine if they are equal
         * @param idA The first ID to parse (if needed) and then compare
         * @param idB The second ID to parse (if needed) and then compare
         */
        function areEqual(idA: string | Guid, idB: string | Guid): boolean;
    }
}

declare namespace RideStylerShowcase.HTMLHelper {
    interface ElementList<T extends Element = HTMLElement> {
        length: number;
        [index: number]: T;
    }
    /**
     * Returns a new set of elements matched from the original set
     * @param elements The elements to match
     * @param match The matching function
     */
    function elementsMatching<T extends Element>(elements: ElementList<T>, match: (element: Element) => boolean): T[];
    /**
     * Returns the first element in the set to match the function
     * @param elements The set of elements to search in
     * @param match The matching function
     */
    function firstElementMatching<T extends Element>(elements: ElementList<T>, match: (element: Element) => boolean): T;
    /**
     * Returns the last element in the set to match the function
     * @param elements The set of elements to search in
     * @param match The matching function
     */
    function lastElementMatching<T extends Element>(elements: ElementList<T>, match: (element: Element) => boolean): T;
    function childrenMatching<T extends Element>(element: Element, match: (element: Element) => boolean): T[];
    /**
     * Search an element for the first child matching the match function
     * @param element The element to search children of
     * @param match The match function
     */
    function firstChildMatching<T extends Element>(element: Element, match: (element: Element) => boolean): T;
    /**
     * Returns an array of element's children matching the passed in set of
     * @param element The element to search the children of
     * @param classes The set of classes to match children with
     */
    function childrenWithClasses<T extends Element>(element: Element, ...classes: string[]): T[];
    /**
     * Removes children from the element matching a class or set of classes
     * @param element The element to search the children
     * @param classes The classes to match children to remove
     */
    function removeChildrenWithClasses(element: HTMLElement, ...classes: string[]): void;
    /**
     * Search an element for the first child with the specified tag
     * @param element The element to search children of
     * @param tagName The tag to look for
     */
    function firstChildWithTag<T extends HTMLElement>(element: HTMLElement, tagName: string): T;
    /**
     * Search an element for the first child with the specified class(es) in its class list
     * @param element The element to search children of
     * @param classes The classes to look for
     */
    function firstChildWithClass<T extends Element>(element: Element, ...classes: string[]): T;
    /**
     * Detects if an element has a child with the specified class(es)
     * @param element The element to search the children of
     * @param classes The class(es) to look for
     */
    function hasChildWithClass(element: HTMLElement, ...classes: string[]): boolean;
    /**
     * Detects if an element has a sibling with the specified class(es)
     * @param element The element to search the siblings of
     * @param classes The class(es) to look for
     */
    function hasSiblingWithClass(element: Element, ...classes: string[]): boolean;
    /**
     * Returns the last sibling of an element matching a specified class (or specified classes)
     * @param element The element to search siblings
     * @param classes The classes to look for
     */
    function lastSiblingWithClass<T extends Element>(element: Element, ...classes: string[]): T;
    interface createElementOptions<ElementType extends Element> {
        /**
         * Specifies a class to add to the element
         */
        className?: string;
        /**
         * Specifies an ID to add to the element
         */
        id?: string;
        /**
         * Specifies an element to append the created element to
         */
        appendTo?: Node;
        /**
         * Specifies text to add to the element
         */
        text?: string;
        /**
         * Specifies an element or elements to append to the created element
         */
        append?: Node | Node[];
        /**
         * Specifies attributes to add to the created element
         */
        attributes?: {
            [key: string]: string;
        };
        /**
         * Specifies styles to set on the created element
         */
        style?: {
            [p in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[p];
        };
        /**
         * Specifies properties to set on the created element
         */
        properties?: {
            [key in keyof ElementType]?: ElementType[key];
        };
        /**
         * Specifies a HTML element to wrap the created element in. When used in combination with
         * appendTo, the wrapper will be appended to the element.
         */
        wrap?: HTMLElement;
    }
    /**
     * Create a DIV
     * @param options Additional operations to perform on the element
     */
    function createElement(options?: createElementOptions<HTMLDivElement>): HTMLDivElement;
    /**
     * Create an element
     * @param tagName The tag of the element to create
     * @param options Additional operations to perform on the element
     */
    function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: createElementOptions<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
    /**
     * Create an element
     * @param tagName The tag of the element to create
     * @param options Additional operations to perform on the element
     */
    function createElement(tagName: string, options?: createElementOptions<HTMLElement>): HTMLElement;
    function createElementWithText<K extends keyof HTMLElementTagNameMap>(tagName: K, text: string): HTMLElementTagNameMap[K];
    function createElementWithText(tagName: string, text: string): HTMLElement;
    /**
     * Creates an element with the specified class
     * @param tagName The tag of the element to create
     * @param className The class to add to the element
     */
    function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string): HTMLElementTagNameMap[K];
    /**
     * Creates an element with the specified class
     * @param tagName The tag of the element to create
     * @param className The class to add to the element
     */
    function createElementWithClass(tagName: string, className: string): HTMLElement;
    /**
     * Creates a DIV element with the specified class
     * @param className The class to add to the element
     */
    function createElementWithClass(className: string): HTMLDivElement;
    function createElementWithID<K extends keyof HTMLElementTagNameMap>(tagName: K, id: string): HTMLElementTagNameMap[K];
    function createElementWithID(tagName: string, id: string): HTMLElement;
    /**
     * Create a new text element
     * @param text The text to create the text element with
     */
    function createTextElement(text: string): Text;
    interface createButtonOptions extends createElementOptions<HTMLButtonElement> {
        /**
         * If true, disable the created button
         */
        disabled?: boolean;
        /**
         * If true, create a large button
         */
        large?: boolean;
        /**
         * If true, create a link button
         */
        link?: boolean;
        /**
         * If true, create a skinny button
         */
        skinny?: boolean;
    }
    function createButton(options: createButtonOptions): HTMLButtonElement;
    interface createIconOptions extends createElementOptions<HTMLElement> {
        /**
         * The class of the icon to create
         */
        icon: string;
    }
    /**
     * Create an icon
     * @param icon The class of the icon to create
     */
    function createIcon(icon: string): HTMLElement;
    /**
     * Create an icon
     * @param options Options to create the icon with
     */
    function createIcon(options: createIconOptions): HTMLElement;
    function createSVGElement<K extends keyof ElementTagNameMap>(tagName: K, options: createElementOptions<ElementTagNameMap[K]>): ElementTagNameMap[K];
    function createSVGElement(tagName: string, options: createElementOptions<SVGElement>): SVGElement;
    function createDescriptionList(values?: {
        label: string;
        description: string;
    }[]): HTMLDListElement;
    function appendDescriptionListValues(descriptionList: HTMLDListElement, values?: {
        label: string;
        description: string;
    }[]): void;
    /**
     * Removes all children from an element
     * @param element The element to empty
     */
    function empty(element: HTMLElement): void;
    /**
     * Binds an event listener that is executed once and then removed from the element
     * @param element The element to bind a listener to
     * @param type The type of event to listen to
     * @param listener The event listener to call when the event is triggered
     * @param useCapture If true, run the listener in the capture phase of the event
     */
    function once<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, useCapture?: boolean): void;
    /**
     * Binds an event listener that is executed once and then removed from the element
     * @param element The element to bind a listener to
     * @param type The type of event to listen to
     * @param listener The event listener to call when the event is triggered
     * @param useCapture If true, run the listener in the capture phase of the event
     */
    function once(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    /**
     * Returns the document that the element is a part of (if there is one)
     * @param element The element
     */
    function getDocument(element: HTMLElement): Document;
    /**
     * Returns the window that the element is a part of (if there is one)
     * @param element The element
     */
    function getWindow(element: HTMLElement): Window;
    /**
     * Sets the content of an element to a string
     * @param element The element
     * @param text The text
     * @returns The element that was passed in
     */
    function setText(element: HTMLElement, text: string): HTMLElement;
}

declare namespace RideStylerShowcase.NumberHelper {
    /**
     * Returns the number bounded to a range
     * @param number The number to bound
     * @param min The minimum allowable number
     * @param max The maximum allowable number
     */
    function bound(number: number, min: number, max: number): number;
    /**
     * Extend a number range with a number
     * @param number The number to extend the range with
     * @param range The range to extend
     *
     * @returns The range object that was passed in extended by the number
     */
    function extendRange(number: number, range: Range): Range;
    interface Range {
        min: number;
        max: number;
    }
}

declare namespace RideStylerShowcase {
    namespace ObjectHelper {
        /**
         * Copy all enumerable own properties from one or more source objects to a target object
         * @param target The target object
         * @param assignObjects The source object(s)
         */
        function assign<T1, T2>(target: T1, ...assignObjects: T2[]): T1 & T2;
        function assign<T>(target: T, ...assignObjects: T[]): T;
        function assign(target: object, ...assignObjects: object[]): object;
        /**
         * Creates a shallow copy of an object
         * @param target The object to copy
         */
        function copy<T>(target: T): T;
        /**
         * Removes any keys in the target object that are undefined
         * @param target The object to remove keys from
         */
        function removeUndefinedKeys<T>(target: T): T;
        /**
         * Returns all of the keys for own properties on an object
         * @param target The object
         */
        function getKeys(target: object): string[];
        /**
         * Returns all of the values for own properties on an object
         * @param target The object
         */
        function getValues<T>(target: {
            [k: string]: T;
        }): T[];
    }
}

declare namespace RideStylerShowcase.PromiseHelper {
    function all<T>(promises: (T | RideStylerPromise<T>)[]): RideStylerPromise<T[]>;
    function all<T1, T2>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>]): RideStylerPromise<[T1, T2]>;
    function all<T1, T2, T3>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>]): RideStylerPromise<[T1, T2, T3]>;
    function all<T1, T2, T3, T4>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>, T4 | RideStylerPromise<T4>]): RideStylerPromise<[T1, T2, T3, T4]>;
    function all<T1, T2, T3, T4, T5>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>, T4 | RideStylerPromise<T4>, T5 | RideStylerPromise<T5>]): RideStylerPromise<[T1, T2, T3, T4, T5]>;
    function all<T1, T2, T3, T4, T5, T6>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>, T4 | RideStylerPromise<T4>, T5 | RideStylerPromise<T5>, T6 | RideStylerPromise<T6>]): RideStylerPromise<[T1, T2, T3, T4, T5, T6]>;
    function all<T1, T2, T3, T4, T5, T6, T7>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>, T4 | RideStylerPromise<T4>, T5 | RideStylerPromise<T5>, T6 | RideStylerPromise<T6>, T7 | RideStylerPromise<T7>]): RideStylerPromise<[T1, T2, T3, T4, T5, T6, T7]>;
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    function then<T_In, E_In = T_In, T_Out = T_In, E_Out = E_In>(promise: RideStylerPromise<T_In, E_In>, onfulfilled?: ((value: T_In) => T_Out | RideStylerPromise<T_Out, E_Out>) | undefined | null, onrejected?: ((reason: E_In) => T_Out | PromiseLike<T_Out>) | undefined | null): RideStylerPromise<T_Out, E_Out>;
    /**
     * Returns a new resolved promise with an optional value
     * @param value Optionally, a value to resolve the promise with
     */
    function resolved<T>(value?: T): RideStylerPromise<T, never>;
    /**
     * Tests an object for a RidestylerPromise-like interface, testing for
     * done, fail and always functions.
     * @param o The object to test
     */
    function isPromise(o: any): o is RideStylerPromise;
}

declare namespace RideStylerShowcase.ScrollHelper {
    function attachWheelListener(element: HTMLElement, listener: (event: NormalizedWheelEvent) => any): void;
    interface NormalizedWheelEvent {
        originalEvent: WheelEvent;
        target: EventTarget;
        type: string;
        deltaMode: number;
        deltaX: number;
        deltaY: number;
        deltaZ: number;
        preventDefault(): void;
    }
}

declare namespace RideStylerShowcase.StringHelper {
    /**
     * Returns the first word of the specified string
     * @param string The string to get the first word of
     */
    function getFirstWord(string: string): string;
    /**
     * Returns true if the sequence of elements of searchString converted to a String is the
     * same as the corresponding elements of this object (converted to a String) starting at
     * endPosition – length(this). Otherwise returns false.
     */
    function endsWith(string: string, ending: string, index?: number): boolean;
    function escapeRegExp(string: string): string;
}

declare namespace RideStylerShowcase.StyleHelper {
    /**
     * The name of the transition end event for this browser
     */
    let transitionEndEvent: string;
    /**
     * If false, transitions are not supported by the browser
     */
    let transitionsSupported: boolean;
    /**
     * If false, this is not a touch device
     */
    let isTouchDevice: boolean;
    /**
     * If false, SVGs are not supported by the browser
     */
    let svgSupported: boolean;
    /**
     * Get the current computed style of an element
     * @param element The element
     */
    function getComputedStyle(element: HTMLElement): CSSStyleDeclaration;
    /**
     * Detects whether or not absolute/relative/fixed positioning is enabled on an element
     * @param element The element
     */
    function isOffsetPositioned(element: HTMLElement): boolean;
    function flattenClassList(...classes: (string | string[])[]): string[];
    /**
     * Causes the browser to recalculate the styles of the specified element
     * @param element The element
     */
    function triggerReflow(element: HTMLElement): void;
    /**
     * Skip a transition on an element preformed by a callback function
     * @param element The element
     * @param callback A function to run causing a transition to be fired on the element
     */
    function skipTransition(element: HTMLElement, callback: Function): void;
    function onNextTransitionEnd(element: HTMLElement, listener: EventListenerOrEventListenerObject): void;
    /**
     * Check if an element has all of the supplied classes
     * @param element The element
     * @param classes The classes to check
     */
    function hasClasses(element: HTMLElement, classes: string[]): boolean;
    /**
     * Check if an element has all of the supplied classes
     * @param element The element
     * @param classes The classes to check
     */
    function hasClasses(element: HTMLElement, ...classes: string[]): boolean;
    function parsePixels(pixels: string): number;
    function calculatePadding(element: HTMLElement): {
        width: number;
        height: number;
    };
}

declare namespace RideStylerShowcase.VisibilityHelper {
    function show(element: HTMLElement, transitionClass?: string): RideStylerPromise;
    function hide(element: HTMLElement, transitionClass?: string): RideStylerPromise;
    function setVisibility(element: HTMLElement, visible: boolean): void;
}

declare namespace RideStylerShowcase.strings {
}
