namespace RideStylerShowcase {
    export interface IComponent {
        /**
         * The main element for this component
         */
        component: HTMLElement;
    }

    export interface IComponentConstructable {
        new (showcaseInterface:RideStylerShowcaseInstance):IComponent;
    }
}