namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-vehicle-details'

    export class VehicleDetails extends ComponentBase {
        private vehicleDescriptionElement:HTMLElement;
        private vehiclePaintSwatchElement:HTMLElement;
        private tireSizeElement:HTMLElement;

        protected initializeComponent() {
            this.component = HTMLHelper.createElementWithClass('div', className + " ridestyler-showcase-details");
            
            HTMLHelper.createElement('div', {
                className: className + '-title' + " ridestyler-showcase-details-title",
                text: strings.getString('vehicle-details'),
                appendTo: this.component
            });

            HTMLHelper.createElement('div', {
                className: className + '-vehicle',
                append: [
                    this.vehiclePaintSwatchElement = HTMLHelper.createElement('div', {
                        className: className + '-vehicle-swatch ridestyler-showcase-paint-swatch'
                    }),
                    this.vehicleDescriptionElement = HTMLHelper.createElement('div', {
                        className: className + '-vehicle-details'
                    })
                ],
                appendTo: this.component
            });

            this.tireSizeElement = HTMLHelper.createElement('div', {
                className: className + '-tire-size ridestyler-showcase-details-secondary',
                appendTo: this.component
            });

            HTMLHelper.createButton({
                className: className + '-change-vehicle',
                appendTo: this.component,
                text: strings.getString('change-vehicle'),
                link: true
            }).addEventListener('click', () => {
                this.state.changeState(States.ChooseVehicle);
            });

            this.state.afterDataChange(data => this.onDataChange(data));
            this.vehiclePaintSwatchElement.addEventListener('click', () => {
                if (typeof this.paintSwatchClickCallback === 'function') 
                    this.paintSwatchClickCallback();
            });
        }

        /**
         * A call back for when the paint swatch was clicked on
         */
        public paintSwatchClickCallback:() => void;

        private onDataChange(data:state.StateData) {
            HTMLHelper.setText(this.vehicleDescriptionElement, data.currentVehicleDescription);
            this.vehiclePaintSwatchElement.style.backgroundColor = data.currentPaintScheme ? data.currentPaintScheme.Colors[0].Hex : 'white';
            HTMLHelper.setText(this.tireSizeElement, data.currentVehicleTireOptionDescription);
        }
    }
}