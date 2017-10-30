namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-wheel-details'

    export class WheelDetails extends ComponentBase {
        private wheelNameElement:HTMLElement;
        private wheelDescriptionElement:HTMLElement;

        protected initializeComponent() {
            this.component = HTMLHelper.createElementWithClass('div', className + " ridestyler-showcase-details");

            HTMLHelper.createElement('div', {
                className: className + '-title' + " ridestyler-showcase-details-title",
                text: strings.getString('wheel-details'),
                appendTo: this.component
            });

            this.wheelNameElement = HTMLHelper.createElement('div', {
                className: className + '-name',
                appendTo: this.component
            });

            this.wheelDescriptionElement = HTMLHelper.createElement('div', {
                className: className + '-description ridestyler-showcase-details-secondary',
                appendTo: this.component
            });

            this.state.afterDataChange(data => this.onDataChange(data));
        }

        private onDataChange(data:state.StateData) {
            const currentWheel = data.currentWheel;
            const currentWheelFitment = data.currentWheelFitment;

            this.component.style.display = currentWheel ? '' : 'none';

            if (currentWheel) {
                HTMLHelper.setText(this.wheelNameElement, currentWheel.WheelBrandName + ' ' + currentWheel.WheelModelName);
                
                if (currentWheelFitment) {
                    let diameter:string = currentWheelFitment.DiameterMin.toString() + '″';

                    if (currentWheelFitment.DiameterMin !== currentWheelFitment.DiameterMax)
                        diameter = '(' + currentWheelFitment.DiameterMin + '-' + currentWheelFitment.DiameterMax + ')″';

                    HTMLHelper.setText(this.wheelDescriptionElement, diameter + ' ' + currentWheel.WheelModelFinishDescription);
                } else {
                    HTMLHelper.setText(this.wheelDescriptionElement, currentWheel.WheelModelFinishDescription);
                }
            }
        }
    }
}