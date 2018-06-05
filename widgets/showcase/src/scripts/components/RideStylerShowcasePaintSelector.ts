namespace RideStylerShowcase {
    import VehiclePaintAttributes = ridestyler.DataObjects.VehiclePaintAttributes;
    import VehiclePaintSchemeDescriptionModel = ridestyler.Descriptions.VehiclePaintSchemeDescriptionModel;

    const resultsPerRequest = 20;

    interface RideStylerShowcasePaintSchemeOptionElement extends HTMLElement {
        paintScheme?: VehiclePaintSchemeDescriptionModel;
    }

    export class RideStylerShowcasePaintSelector extends RideStylerShowcasePaginationComponent {
        private readonly vehicleConfigurationID:string;

        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance);

            const {currentVehicleConfigurationID} = showcaseInstance.state.getData();

            this.vehicleConfigurationID = currentVehicleConfigurationID;
        }

        protected _loadMore() {
            this.hasMoreResults = false;
            this.isLoading = true;

            // Load paint schemes for the vehicle
            return api.request("vehicle/getpaintschemedescriptions", {
                VehicleConfiguration: this.vehicleConfigurationID
            })
                .done(response => this.createOptions(response.Schemes))
                .always(() => this.isLoading = false);
        }

        private createOptions(schemes:VehiclePaintSchemeDescriptionModel[]) {
            // Create a fragment so we add all options to the element at once
            let fragment = document.createDocumentFragment();

            // Create each option and add it to the fragment
            for (let scheme of schemes) {
                let option = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option ridestyler-showcase-paint-option',
                    appendTo: fragment
                }) as RideStylerShowcasePaintSchemeOptionElement;

                option.paintScheme = scheme;

                // The main color to be represented in the swatch
                // TODO: multi-color paint schemes
                let color = scheme.Colors[0];

                // "swatch": The display of the paint color
                let swatch = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option-display ridestyler-showcase-paint-swatch',
                    style: {
                        backgroundColor: color.Hex
                    },
                    appendTo: option
                });

                // The name of the paint scheme as the label
                let name = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option-label',
                    text: scheme.SchemeName,
                    appendTo: option
                });

                // Attributes of the color for the secondary label
                let attributes = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option-label-secondary',
                    text: RideStylerShowcasePaintSelector.createAttributeLabel(color.Attributes),
                    appendTo: option
                });
            }
            
            // Clear out our slideWrapper of all elements
            HTMLHelper.empty(this.optionContainer);
            // Add all options to the slideWrapper at once
            this.optionContainer.appendChild(fragment);

            this.update();
        }

        public onPaintSchemeSelected: (paintScheme:VehiclePaintSchemeDescriptionModel)=>void;
        protected onOptionClick(optionElement:HTMLElement) {
            let paintScheme = (optionElement as RideStylerShowcasePaintSchemeOptionElement).paintScheme;

            if (paintScheme) {
                super.onOptionClick(optionElement);

                this.state.extendData({
                    currentPaintScheme: paintScheme
                });

                if (typeof this.onPaintSchemeSelected === 'function') {
<<<<<<< HEAD
                    // this.urlEncode(paintScheme)
=======
>>>>>>> 5b045d3d62785f4dbf68503cc969e8272a0fa46c
                    this.onPaintSchemeSelected(paintScheme)
                }
            }
        }

        private static createAttributeLabel(attributes:ridestyler.DataObjects.VehiclePaintAttributes):string {
            const defaultAttributeString = 'Glossy';

            if (attributes === VehiclePaintAttributes.None) return defaultAttributeString;

            let stringAttributes:string[] = [];
            
            // Add each selected paint attribute flag for the color to the list
            if (attributes && VehiclePaintAttributes.Matte === VehiclePaintAttributes.Matte) stringAttributes.push('Matte');
            if (attributes && VehiclePaintAttributes.Metallic === VehiclePaintAttributes.Metallic) stringAttributes.push('Metallic');
            if (attributes && VehiclePaintAttributes.Pearlescent === VehiclePaintAttributes.Pearlescent) stringAttributes.push('Pearlescent');

            if (stringAttributes.length === 0) return defaultAttributeString;

            return stringAttributes.join(', ');
        }
    }
}