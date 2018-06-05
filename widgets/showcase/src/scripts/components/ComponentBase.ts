namespace RideStylerShowcase {
    export abstract class ComponentBase implements IComponent {
        constructor (showcaseInstance: RideStylerShowcaseInstance) {
            this.showcase = showcaseInstance;
            this.events = showcaseInstance.events;
            this.state = showcaseInstance.state;
            this.parameters = showcaseInstance.parameters;

            this.initializeComponent();
        }
        
        protected readonly showcase:RideStylerShowcaseInstance;
        protected readonly events:events.EventHandler;
        protected readonly state:state.RideStylerShowcaseState;
        protected readonly parameters:parameters.RideStylerShowcaseParameters;
        
        /**
         * The main element for this component
         */
        public component: HTMLElement;

        /**
         * A overridable function called after the base component is initialized
         * @virtual
         */
        protected initializeComponent() {}
    }
}