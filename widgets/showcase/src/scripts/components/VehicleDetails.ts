namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-vehicle-details'
    const firstPaintColor = '#999';

    export class VehicleDetails extends ComponentBase {

        /**
         * The vehicle description
         */
        private vehicleDescriptionElement:HTMLElement;
        /**
         * The paint swatch next to the vehicle description
         */
        private vehiclePaintSwatchElement:HTMLElement;
        /**
         * The tire size
         */
        private tireSizeElement:HTMLElement;

        private currentDescriptionText:string;

        private newVehicleDescription:string;

        private initialVehicleDescription:string;

        protected initializeComponent() {
            this.component = HTMLHelper.createElementWithClass('div', className + " ridestyler-showcase-details");
            
            // Title
            HTMLHelper.createElement('div', {
                className: className + '-title' + " ridestyler-showcase-details-title",
                text: strings.getString('vehicle-details'),
                appendTo: this.component
            });

            // Vehicle Description/Paint Swatch Container
            HTMLHelper.createElement('div', {
                className: className + '-vehicle',
                append: [
                    
                    // Paint Swatch
                    this.vehiclePaintSwatchElement = HTMLHelper.createElement('div', {
                        className: className + '-vehicle-swatch ridestyler-showcase-paint-swatch',
                        style: {
                            backgroundColor: firstPaintColor
                        }
                    }),

                    // Vehicle Description
                    this.vehicleDescriptionElement = HTMLHelper.createElement('div', {
                        className: className + '-vehicle-details'
                    })

                ],
                appendTo: this.component
            }).addEventListener('click', () => {
                this.currentDescriptionText = this.currentDescriptionText == this.newVehicleDescription  ? this.initialVehicleDescription : this.newVehicleDescription
                console.log(this.currentDescriptionText)
                HTMLHelper.setText(this.vehicleDescriptionElement, this.currentDescriptionText);
            })

            // Tire Size
            this.tireSizeElement = HTMLHelper.createElement('div', {
                className: className + '-tire-size ridestyler-showcase-details-secondary',
                appendTo: this.component
            });

            // Change Vehicle Button
            HTMLHelper.createButton({
                className: className + '-change-vehicle',
                appendTo: this.component,
                text: strings.getString('change-vehicle'),
                link: true
            }).addEventListener('click', () => {
                this.state.changeState(States.ChooseVehicle);
            });

            // Listen for data changes
            this.state.afterDataChange(data => this.onDataChange(data));

            // Switch to paint when clicking on the paint swatch
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
            this.initialVehicleDescription = data.currentVehicleDescription;
            this.newVehicleDescription  = this.initialVehicleDescription.length > 60 ? this.initialVehicleDescription.substring(0, 62) + '...' : this.initialVehicleDescription;
            
            HTMLHelper.setText(this.vehicleDescriptionElement, this.newVehicleDescription);
            this.vehiclePaintSwatchElement.style.backgroundColor = data.currentPaintScheme ? data.currentPaintScheme.Colors[0].Hex : firstPaintColor;
            HTMLHelper.setText(this.tireSizeElement, data.currentVehicleTireOptionDescription);
        }
    }
}