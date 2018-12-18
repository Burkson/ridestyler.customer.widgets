namespace RideStylerShowcase {
    export class RideStylerShowcaseVehicleSelection extends MainComponentBase {
        private chooseVehicleButton:HTMLButtonElement;
        private contentContainer:HTMLElement;
        private wheelContainer:HTMLElement;
        private modal:RideStylerVehicleSelectionModal;

        protected initializeMainComponent() {
            this.modal = new RideStylerVehicleSelectionModal({
                container: () => this.component.parentElement,
                callback: (selection) => {
                    if (selection.FinalSelectionMade) {
                        this.onVehicleSelected(selection.Vehicle);
                    }
                },
                ImageSettings: options => this.generateVehiclePreviewSettings(),
                IncludeOETireOption: true
            });

            api.afterAuthenticated(() => this.onAuthenticated());
        }

        protected buildComponent(container: HTMLElement): void {

            //URL CHECK LOGIC

            container.classList.add('ridestyler-showcase-vehicle-selection');

            this.contentContainer = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-content ridestyler-showcase-vehicle-selection-content',
                appendTo: container
            });
            
            this.buildCopy();

            this.chooseVehicleButton = HTMLHelper.createButton({
                text: strings.getString('select-your-vehicle'),
                appendTo: this.contentContainer,
                disabled: true,
                large: true,
                id: 'ridestyler-showcase-select-your-vehicle',
                wrap: HTMLHelper.createElementWithID('div', 'ridestyler-showcase-select-your-vehicle-wrapper')
            });

            this.chooseVehicleButton.addEventListener('click', () => {
                this.modal.Show();
            });
        }

        private buildCopy() {
            function emboldenFirstWord (string:string) : [HTMLElement, Text] {
                var firstWord = StringHelper.getFirstWord(string);
                var remainingString = string.substr(firstWord.length);

                return [
                    HTMLHelper.createElementWithText('strong', firstWord),
                    HTMLHelper.createTextElement(remainingString)
                ];
            }

            let customIntro = strings.getString("visualizer-custom-intro");
            if (customIntro == "visualizer-custom-intro") {
                let visualizeString = HTMLHelper.createElement('h1', {
                    append: emboldenFirstWord(strings.getString("vehicle-select-visualize-intro")),
                    appendTo: this.contentContainer
                });
                let shareString = HTMLHelper.createElement('h1', {
                    append: emboldenFirstWord(strings.getString("vehicle-select-share-intro")),
                    appendTo: this.contentContainer
                });
            } else {
                let customIntroEle = document.createElement('div');
                customIntroEle.innerHTML = customIntro;

                this.contentContainer.appendChild(customIntroEle);
            }
        }

        private onAuthenticated() {
            this.chooseVehicleButton.disabled = false;

            api.request("wheel/getmodels", {
                Count: 3,
                HasCatalogImage: true
            }).done(response => this.showWheels(response.Models));
        }

        private onVehicleSelected(selection:RideStylerVehicleSelectionModal.SelectedVehicleData) {
            // The user has selected a vehicle using the vehicle selection modal.
            // Now we need to obtain a OE tire option for them.
            this.events.trigger("vehicle-selected", selection);
            history.pushState(selection, null, null)
        }

        /**
         * Show the passed in wheel models in the wheel showcase section of the vehicle selection screen
         * @param models The wheel models to show
         */
        private showWheels(models:ridestyler.DataObjects.WheelModelDataObject[]) {
            let wheelContainer:HTMLElement;

            if (!this.wheelContainer) {
                wheelContainer = this.wheelContainer = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-vehicle-selection-wheel-showcase',
                    appendTo: this.component
                });
            } else {
                wheelContainer = this.wheelContainer;

                HTMLHelper.empty(wheelContainer);
            }

            let modelImages:HTMLImageElement[] = [];
            let onModelImageLoad = function (this:HTMLImageElement) {
                for (let modelImage of modelImages)
                    if (!modelImage.complete)
                        return;
                
                wheelContainer.style.opacity = '1';
            };

            for (let model of models) {
                let modelImageSource = ridestyler.wheel.image({
                    WheelModel: model.WheelModelID,
                    Width: 400,
                    Height: 400,
                    PositionX: ridestyler.Requests.ImagePosition.Center,
                    PositionY: ridestyler.Requests.ImagePosition.Center,
                    WheelFitmentResourceType: ridestyler.DataObjects.WheelFitmentResourceType.Catalog,
                    IncludeShadow: true
                });
                
                let modelImage = HTMLHelper.createElement('img');
                
                modelImage.className = 'ridestyler-showcase-vehicle-selection-wheel-showcase-image';
                
                modelImage.addEventListener('load', onModelImageLoad);
                modelImages.push( );

                modelImage.src = modelImageSource;
                wheelContainer.appendChild(modelImage);
            }
        }

        private generateVehiclePreviewSettings():ridestyler.Requests.ImageRenderRequest {
            let scale = Math.max(window.devicePixelRatio || 0, 1);
            let container = this.component;
            
            const widthToHeight = .5;
            const maxRequestResolution = 1920;

            // Width is 80% of the container width
            let width = container.clientWidth * .80;
            
            // Width is 500 if not found
            if (!width) width = 500;

            // Apply our scale
            width *= scale;

            // Limit width to max request resolution
            if (width > maxRequestResolution) width = maxRequestResolution;

            // Determine height
            let height = width * widthToHeight;

            return {
                Width: ~~width,
                Height: ~~height
            };
        }
    }
}