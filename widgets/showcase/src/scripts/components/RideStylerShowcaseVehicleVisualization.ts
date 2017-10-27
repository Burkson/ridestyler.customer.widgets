namespace RideStylerShowcase {
    const customizationsClass = 'ridestyler-showcase-customizations';
    const loadingClass = customizationsClass + '-loading';

    export class RideStylerShowcaseVehicleVisualization extends MainComponentBase {
        private viewport:RideStylerViewport;
        private tabBar:RideStylerShowcaseVerticalTabBar;
        private tabs: {
            paint: RideStylerShowcaseVerticalTabBar.Tab,
            wheels: RideStylerShowcaseVerticalTabBar.Tab,
            tires: RideStylerShowcaseVerticalTabBar.Tab,
            suspension: RideStylerShowcaseVerticalTabBar.Tab
        };

        private customizationComponentContainer:HTMLElement;
        private customizationComponents:{
            paint: RideStylerShowcasePaintSelector,
            wheels: RideStylerShowcaseWheelSelector,
            tires: RideStylerShowcaseTireSelector
        };

        /**
         * The ID of the currently displayed vehicle
         */
        private vehicleConfigurationID:string;

        /**
         * The description of the currently displayed vehicle
         */
        private vehicleDescription:string;

        /**
         * The ID of the currently displayed OE tire option for the vehicle
         */
        private vehicleTireOptionID:string;

        /**
         * A description of the currently selected OE tire option
         */
        private vehicleTireOptionDescription:string;

        /**
         * The description model of the currently displayed vehicle,
         * loaded from the API
         */
        private vehicleDescriptionModel: ridestyler.Descriptions.VehicleDescriptionModel;

        protected buildComponent(container: HTMLElement) {
            // Wait for initialization before creating the viewport because it detects
            // the offset positioning of the viewport element when created and our CSS
            // isn't guaranteed to be loaded until the initialized event
            this.events.on('initialized', () => {
                this.viewport = new RideStylerViewport(HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-viewport',
                    appendTo: container
                }));
            });

            this.setupTabs();

            this.component.appendChild(this.tabBar.component);
            this.customizationComponentContainer = HTMLHelper.createElement('div', {
                className: customizationsClass,
                appendTo: this.component
            });

            // Start listening for resize events
            this.events.on('resized', () => {
                if (this.isVisible()) {
                    this.updateViewport();
                }
            });
        }

        private setupTabs() {
            this.tabBar = new RideStylerShowcaseVerticalTabBar(this.showcase);

            // Define our tabs
            this.tabs = {
                paint: new RideStylerShowcaseVerticalTabBar.Tab({
                    icon: 'paint',
                    key: 'paint',
                    label: strings.getString('paint')
                }),
                wheels: new RideStylerShowcaseVerticalTabBar.Tab({
                    icon: 'wheel',
                    key: 'wheels',
                    label: strings.getString('wheels')
                }),
                tires: new RideStylerShowcaseVerticalTabBar.Tab({
                    icon: 'tire',
                    key: 'tires',
                    label: strings.getString('tires')
                }),
                suspension: new RideStylerShowcaseVerticalTabBar.Tab({
                    icon: 'suspension',
                    key: 'suspension',
                    label: strings.getString('suspension')
                })
            };

            this.tabBar.setTabs(ObjectHelper.getValues(this.tabs));

            // Switch the bottom view, the customization component when a tab is clicked on
            this.tabBar.tabSwitchedCallback = e => {
                const newTab = e.newTab;
                const key = newTab.key;

                if (this.customizationComponents && key in this.customizationComponents)
                    this.setActiveCustomizationComponent(this.customizationComponents[key]);
            };
        }

        protected onDisplay() {
            let stateData = this.state.getData();

            if (!stateData.currentVehicleConfigurationID || !stateData.currentVehicleTireOptionID) {
                console.error('Trying to show the visualize screen without a vehicle configuration or tire option.');
            }

            let vehicleChanged = !GUIDHelper.areEqual(stateData.currentVehicleConfigurationID, this.vehicleConfigurationID);
            let tireOptionChanged = !GUIDHelper.areEqual(stateData.currentVehicleTireOptionID, this.vehicleTireOptionID);

            if (vehicleChanged || tireOptionChanged) {
                this.vehicleConfigurationID = stateData.currentVehicleConfigurationID
                this.vehicleDescription = stateData.currentVehicleDescription;
                
                this.vehicleTireOptionID = stateData.currentVehicleTireOptionID;
                this.vehicleTireOptionDescription = stateData.currentVehicleTireOptionDescription;
                
                this.onVehicleChanged();
            }
        }

        private onVehicleChanged() {
            HTMLHelper.empty(this.customizationComponentContainer);

            // Set the customization container as loading while we're loading additional information
            // about the vehicle
            this.customizationComponentContainer.classList.add(loadingClass);

            // Deselect any active tab
            this.tabBar.clearActiveTab();

            // Load the vehicle's description model
            api.request("vehicle/getdescriptions", {
                Count: 1,
                VehicleConfiguration: this.vehicleConfigurationID
            }).done(response => {
                let vehicleDescription = this.vehicleDescriptionModel = response.Descriptions[0];

                this.state.extendData({
                    vehicleHasAngledImage: vehicleDescription.HasAngledImage,
                    vehicleHasSideImage: vehicleDescription.HasSideImage
                });

                this.initializeForNewVehicle();
            });
        }

        private initializeForNewVehicle() {
            this.tabBar.setActiveTab(this.tabs.paint);
            
            // Create the components that will be switched with the tabs
            this.customizationComponents = {
                paint: new RideStylerShowcasePaintSelector(this.showcase),
                wheels: new RideStylerShowcaseWheelSelector(this.showcase),
                tires: new RideStylerShowcaseTireSelector(this.showcase)
            };

            this.customizationComponents.paint.onPaintSchemeSelected = paintScheme => {
                this.customizationComponents.paint.setOptionIsLoading(true);

                this.viewport.Update({
                    PaintColor: paintScheme.Colors[0].Hex
                }).always(() => {
                    this.customizationComponents.paint.setOptionIsLoading(false);
                });
            };

            this.customizationComponents.wheels.productSelectedCallback = model => {
                this.customizationComponents.wheels.setOptionIsLoading(true);
                
                // Get the resources for any fitments within the model, so we can choose
                // the best fitment to be displayed on the vehicle.
                api.request("wheel/getfitmentresources", {
                    WheelModel: model.WheelModelID,
                    VehicleConfiguration: this.vehicleConfigurationID
                })
                    .done(response => {
                        let fitmentIDScores:{
                            [fitmentID: string]: number;
                        } = {};

                        const vehicleHasAngledImage = this.vehicleDescriptionModel.HasAngledImage;
                        const vehicleHasSideImage   = this.vehicleDescriptionModel.HasSideImage;

                        let highestScore:number = -Infinity;
                        let highestScoringFitmentID:string;

                        for (let resource of response.Resources) {
                            const fitmentID = resource.WheelFitmentResource_WheelFitmentID;
                            const type = resource.WheelFitmentResourceType;

                            let score = fitmentID in fitmentIDScores ? fitmentIDScores[fitmentID] : 0;
                            
                            if (type === ridestyler.DataObjects.WheelFitmentResourceType.Angled && vehicleHasAngledImage) score++;
                            else if (type === ridestyler.DataObjects.WheelFitmentResourceType.Side && vehicleHasSideImage) score++;

                            fitmentIDScores[fitmentID] = score;

                            if (score > highestScore) {
                                highestScore = score;
                                highestScoringFitmentID = fitmentID;
                            }
                        }

                        this.viewport.Update({
                            WheelFitment: highestScoringFitmentID
                        }).always(() => {
                            this.customizationComponents.wheels.setOptionIsLoading(false);
                        });
                    })
                    .fail(() => this.customizationComponents.wheels.setOptionIsLoading(false));
            };

            this.customizationComponents.tires.productSelectedCallback = model => {
            };

            this.setActiveCustomizationComponent(this.customizationComponents.paint);

            for (let customizationComponent of ObjectHelper.getValues<IComponent>(this.customizationComponents)) {
                customizationComponent.component.classList.add('ridestyler-showcase-customization-component');

                this.customizationComponentContainer.appendChild(customizationComponent.component);
            }

            this.viewport.Update({
                VehicleConfiguration: this.vehicleConfigurationID,
                VehicleTireOption: this.vehicleTireOptionID,
                PositionX: ridestyler.Requests.ImagePosition.Center,
                PositionY: ridestyler.Requests.ImagePosition.Far
            });
        }

        private activeCustomizationComponent:IComponent;
        private setActiveCustomizationComponent(customizationComponent:IComponent|RideStylerShowcasePaginationComponent) {
            if (this.activeCustomizationComponent) {
                this.activeCustomizationComponent.component.classList.remove('in');
            }

            customizationComponent.component.classList.add('in');
            this.activeCustomizationComponent = customizationComponent;

            if (typeof (customizationComponent as RideStylerShowcasePaginationComponent).update === 'function')
                (customizationComponent as RideStylerShowcasePaginationComponent).update();
        }

        private updateViewport(instructions?:ridestyler.Requests.VehicleRenderInstructions) {
            this.viewport.Update(instructions);
        }
        
        /**
         * A callback to bind event listeners to that updates the viewport when called
         */
        private updateViewportListenerCallback:()=>void = () => this.updateViewport();
    }
}