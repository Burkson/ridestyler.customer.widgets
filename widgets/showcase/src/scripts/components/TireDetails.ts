namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-tire-details'

    export class TireDetails extends ComponentBase {
        private tireNameElement:HTMLElement;
        private tireDescriptionElement:HTMLElement;

        protected initializeComponent() {
            this.component = HTMLHelper.createElementWithClass('div', className + " ridestyler-showcase-details");

            HTMLHelper.createElement('div', {
                className: className + '-title' + " ridestyler-showcase-details-title",
                text: strings.getString('tire-details'),
                appendTo: this.component
            });

            this.tireNameElement = HTMLHelper.createElement('div', {
                className: className + '-name',
                appendTo: this.component
            });

            this.tireDescriptionElement = HTMLHelper.createElement('div', {
                className: className + '-description ridestyler-showcase-details-secondary',
                appendTo: this.component
            });

            this.state.afterDataChange(data => this.onDataChange(data));
        }

        private onDataChange(data:state.StateData) {
            const currentTire = data.currentTire;

            this.component.style.display = currentTire ? '' : 'none';

            if (currentTire) {
                HTMLHelper.setText(this.tireNameElement, currentTire.TireBrandName + ' ' + currentTire.TireModelName);
                HTMLHelper.setText(this.tireDescriptionElement, currentTire.Attributes && currentTire.Attributes.length ?
                    currentTire.Attributes.join(', ') : '')
            }
        }
    }
}