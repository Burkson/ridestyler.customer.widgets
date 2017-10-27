namespace RideStylerShowcase {
    export class RideStylerShowcaseBackground extends ComponentBase {
        component:HTMLElement;

        protected initializeComponent() {
            var backgroundElement = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-background'
            });

            var backgroundTexture = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-background-texture',
                appendTo: backgroundElement
            });

            this.component = backgroundElement;
        }
    }
}