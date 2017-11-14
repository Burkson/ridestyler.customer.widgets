namespace RideStylerShowcase {
    const customizationsClass = 'ridestyler-showcase-customizations';
    const loadingClass = customizationsClass + '-loading';

    export class RideStylerShowcaseVehicleVisualization extends MainComponentBase {
        private viewport:RideStylerViewport;
        private tabBar:RideStylerShowcaseVerticalTabBar;
        private changeWheelSize:RideStylerShowcaseChangeWheelSize;

        private titleElement:HTMLElement;
        private rotateElement:HTMLElement;
        private filterButton:HTMLButtonElement;

        private vehicleDetails:VehicleDetails;

        private tabs: {
            paint: RideStylerShowcaseVerticalTabBar.Tab,
            wheels: RideStylerShowcaseVerticalTabBar.Tab,
            // tires: RideStylerShowcaseVerticalTabBar.Tab,
            suspension: RideStylerShowcaseVerticalTabBar.Tab
        };

        private customizationComponentContainer:HTMLElement;
        private customizationComponents:{
            paint: RideStylerShowcasePaintSelector,
            wheels: RideStylerShowcaseWheelSelector,
            tires: RideStylerShowcaseTireSelector,
            suspension: RideStylerShowcaseSuspensionSelector
        };

        private customizationComponentSettings: {
            paint: CustomizationComponentSettings,
            wheels: CustomizationComponentSettings,
            tires: CustomizationComponentSettings,
            suspension: CustomizationComponentSettings
        } = {
            paint: {
                title: strings.getString('select-paint'),
                showFilterButton: false
            },
            wheels: {
                title: strings.getString('select-wheels'),
                showFilterButton: true
            },
            tires: {
                title: strings.getString('select-tires'),
                showFilterButton: false
            },
            suspension: {
                title: strings.getString('adjust-suspension'),
                showFilterButton: false
            }
        }

        private components:IComponent[];

        /**
         * The ID of the currently displayed vehicle
         */
        private vehicleConfigurationID:string;

        /**
         * The description of the currently displayed vehicle
         */
        private vehicleDescription:string;

        private imageType:ridestyler.DataObjects.VehicleResourceType;

        /**
         * The ID of the currently displayed OE tire option for the vehicle
         */
        private vehicleTireOptionID:string;

        /**
         * A description of the currently selected OE tire option
         */
        private vehicleTireOptionDescription:string;

        /**
         * The currently selected OE tire option
         */
        private vehicleTireOption:ridestyler.Descriptions.VehicleTireOptionDescriptionModel;

        /**
         * The description model of the currently displayed vehicle,
         * loaded from the API
         */
        private vehicleDescriptionModel: ridestyler.Descriptions.VehicleDescriptionModel;

        /**
         * The render instructions for the currently displayed vehicle
         */
        private currentRenderInstructions: ridestyler.Requests.VehicleRenderInstructions;

        protected buildComponent(container: HTMLElement) {
            // Wait for initialization before creating the viewport because it detects
            // the offset positioning of the viewport element when created and our CSS
            // isn't guaranteed to be loaded until the initialized event
            this.events.on('initialized', () => {
                let viewportElement = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-viewport',
                    appendTo: container
                });

                viewportElement.addEventListener('click', () => {
                    this.switchAngle();
                });

                this.viewport = new RideStylerViewport(viewportElement);
            });

            this.setupTabs();

            this.changeWheelSize = new RideStylerShowcaseChangeWheelSize(this.showcase);
            this.changeWheelSize.optionSelectedCallback = newOption => {
                this.state.extendData({
                    currentWheelFitment: newOption
                });
                this.updateViewport({
                    WheelFitment: newOption.WheelFitmentID
                });
            }

            this.components = [
                this.vehicleDetails = new VehicleDetails(this.showcase),
                new WheelDetails(this.showcase),
                new TireDetails(this.showcase),
                this.tabBar,
                this.changeWheelSize
            ];

            this.customizationComponentContainer = HTMLHelper.createElement('div', {
                className: customizationsClass,
                appendTo: this.component
            });

            // Append any sub components
            for (let component of this.components) {
                this.component.appendChild(component.component);
            }

            this.rotateElement = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-rotate-vehicle',
                appendTo: this.component
            });

            this.rotateElement.addEventListener('click', () => {
                this.switchAngle();
            });

            HTMLHelper.createElement({
                className: 'ridestyler-showcase-customization-component-title-container',
                appendTo: this.component,
                append: [
                    this.titleElement = HTMLHelper.createElement({
                        className: 'ridestyler-showcase-customization-component-title',
                        appendTo: this.component
                    }),
                    this.filterButton = HTMLHelper.createButton({
                        text: strings.getString('filter-results'),
                        skinny: true
                    })
                ]
            });
            
            this.filterButton.addEventListener('click', () => {
                this.showFilters();
            })

            let shareButton = HTMLHelper.createButton({
                primary: true,
                className: 'ridestyler-share-my-vehicle-button',
                text: strings.getString('share-my-vehicle'),
                appendTo: this.component
            });
            
            shareButton.addEventListener('click', () => {
                new RideStylerShowcaseShareModal(this.showcase, this.currentRenderInstructions).show();
            });

            // Start listening for resize events
            this.events.on('resized', () => {
                if (this.isVisible()) {
                    this.updateViewport();
                }
            });

            this.vehicleDetails.paintSwatchClickCallback = () => {
                this.setActiveCustomizationComponent(this.customizationComponents.paint);
            }

            this.events.on('initialized', () =>  {
                // Hide the share button if sharing is disabled
                if (!this.showcase.settingsFromAPI.EnableSharing)
                    shareButton.style.display = 'none';
            })
        }

        private setupTabs() {
            this.tabBar  = new RideStylerShowcaseVerticalTabBar(this.showcase);

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
                // tires: new RideStylerShowcaseVerticalTabBar.Tab({
                //     icon: 'tire',
                //     key: 'tires',
                //     label: strings.getString('tires')
                // }),
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

                if (this.customizationComponents && key in this.customizationComponents) {
                    this.setActiveCustomizationComponent(this.customizationComponents[key]);
                }
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

            this.rotateElement.classList.remove('in');

            // Load the vehicle's description model
            let getVehicleDescription = api.request("vehicle/getdescriptions", {
                Count: 1,
                VehicleConfiguration: this.vehicleConfigurationID
            });

            let getVehicleTireOption = api.request('vehicle/gettireoptiondetails', {
                VehicleConfiguration: this.vehicleConfigurationID
            });

            PromiseHelper.all([getVehicleDescription, getVehicleTireOption]).done(responses => {
                let vehicleDescription = this.vehicleDescriptionModel = responses[0].Descriptions[0];
                let vehicleTireOption:ridestyler.Descriptions.VehicleTireOptionDescriptionModel;
                let selectedTireOptionID:Guid = GUIDHelper.parse(this.vehicleTireOptionID);

                for (let tireOption of responses[1].Details) {
                    if (GUIDHelper.areEqual(tireOption.TireOptionID, selectedTireOptionID)){
                        vehicleTireOption = tireOption;
                        break;
                    }
                }

                this.vehicleTireOption = vehicleTireOption;

                this.state.extendData({
                    vehicleHasAngledImage: vehicleDescription.HasAngledImage,
                    vehicleHasSideImage: vehicleDescription.HasSideImage,
                    currentTireOption: vehicleTireOption,
                    currentVehicleDescriptionModel: vehicleDescription
                });

                this.initializeForNewVehicle();
            });
        }

        private initializeForNewVehicle() {
            this.currentRenderInstructions = {};
            this.tabBar.setActiveTab(this.tabs.paint);
            
            // Create the components that will be switched with the tabs
            this.customizationComponents = {
                paint: new RideStylerShowcasePaintSelector(this.showcase),
                wheels: new RideStylerShowcaseWheelSelector(this.showcase),
                tires: new RideStylerShowcaseTireSelector(this.showcase),
                suspension: new RideStylerShowcaseSuspensionSelector(this.showcase)
            };

            this.showcase.filters.wheelFilters.onFiltersChanged = filters => {
                this.customizationComponents.wheels.setFilters(filters);
            };
            
            this.showcase.filters.tireFilters.onFiltersChanged = filters => {
                this.customizationComponents.tires.setFilters(filters);
            };

            this.customizationComponents.paint.onPaintSchemeSelected = paintScheme => {
                this.customizationComponents.paint.setOptionIsLoading(true);

                this.updateViewport({
                    PaintColor: paintScheme.Colors[0].Hex
                }).always(() => {
                    this.customizationComponents.paint.setOptionIsLoading(false);
                });
            };

            this.customizationComponents.wheels.productSelectedCallback = model => {
                this.customizationComponents.wheels.setOptionIsLoading(true);

                const canRenderOnCurrentAngle =
                    this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle && model.HasAngleImage ||
                    this.imageType === ridestyler.DataObjects.VehicleResourceType.Side && model.HasSideImage;

                if (!canRenderOnCurrentAngle) this.switchAngle();

                api.request('wheel/getfitmentdescriptions', {
                    VehicleConfiguration: this.vehicleConfigurationID,
                    WheelModel: model.WheelModelID
                })
                    .done(response => {
                        let fitments:ridestyler.Descriptions.WheelFitmentDescriptionModel[] = response.Fitments;
                        let bestFitment:ridestyler.Descriptions.WheelFitmentDescriptionModel = undefined;
                        let targetDiameter = this.vehicleTireOption.Front.InsideDiameter;

                        fitments.sort(function (a,b) {
                            const aDiff = Math.abs(a.DiameterMin - targetDiameter);
                            const bDiff = Math.abs(b.DiameterMin - targetDiameter);
                            
                            return aDiff - bDiff;
                        });

                        bestFitment = fitments[0];

                        this.state.extendData({
                            currentWheel: model,
                            currentWheelFitment: bestFitment
                        });

                        this.changeWheelSize.setFitmentOptions(fitments, bestFitment);
                        this.changeWheelSize.component.style.display = '';
        
                        this.updateViewport({
                            WheelFitment: bestFitment.WheelFitmentID
                        }).always(() => {
                            this.customizationComponents.wheels.setOptionIsLoading(false);
                        });
                    })
                    .fail(() => this.customizationComponents.wheels.setOptionIsLoading(false));
            };

            this.customizationComponents.tires.productSelectedCallback = model => {
                this.state.extendData({
                    currentTire: model
                });
            };

            this.customizationComponents.suspension.suspensionChangeCallback = renderUpdate => {
                this.updateViewport(renderUpdate);
            };

            this.setActiveCustomizationComponent(this.customizationComponents.paint);

            for (let customizationComponent of ObjectHelper.getValues<IComponent>(this.customizationComponents)) {
                customizationComponent.component.classList.add('ridestyler-showcase-customization-component');

                this.customizationComponentContainer.appendChild(customizationComponent.component);
            }

            this.imageType = ridestyler.DataObjects.VehicleResourceType.Angle;
            
            if (!this.vehicleDescriptionModel.HasAngledImage) this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;

            this.rotateElement.style.display = this.canSwitchAngle() ? '' : 'none';

            this.updateViewport({
                VehicleConfiguration: this.vehicleConfigurationID,
                VehicleTireOption: this.vehicleTireOptionID,
                PositionX: ridestyler.Requests.ImagePosition.Center,
                PositionY: ridestyler.Requests.ImagePosition.Far,
                Type: this.imageType
            }).done(() => {
                this.rotateElement.classList.add('in');
            })


            this.customizationComponentContainer.classList.remove(loadingClass);
        }

        private activeCustomizationComponent:IComponent;
        private setActiveCustomizationComponent(customizationComponent:IComponent) {
            let stateData = this.state.getData();
            let componentKey:string = this.getComponentKey(customizationComponent);
            
            let settings:CustomizationComponentSettings = this.customizationComponentSettings[componentKey];
            let tab:RideStylerShowcaseVerticalTabBar.Tab = this.tabs[componentKey];

            if (tab) {
                this.tabBar.setActiveTab(tab);
            }

            if (this.activeCustomizationComponent) {
                this.activeCustomizationComponent.component.classList.remove('in');
            }

            customizationComponent.component.classList.add('in');
            this.activeCustomizationComponent = customizationComponent;

            if (typeof (customizationComponent as RideStylerShowcasePaginationComponent).update === 'function')
                (customizationComponent as RideStylerShowcasePaginationComponent).update();

            this.changeWheelSize.component.style.display = 
                customizationComponent instanceof RideStylerShowcaseWheelSelector && stateData.currentWheel ? 
                '' : 'none';

            this.filterButton.style.display = settings.showFilterButton ? '' : 'none';

            HTMLHelper.setText(this.titleElement, settings.title);
        }

        private getComponentKey(customizationComponent:IComponent):string {
            for (let key in this.customizationComponents) {
                let component = this.customizationComponents[key];

                if (component === customizationComponent) {
                    return key;
                }
            }
        }

        private updateViewport(instructions?:ridestyler.Requests.VehicleRenderInstructions) {
            Object.assign(this.currentRenderInstructions, instructions);
            
            return this.viewport.Update(instructions);
        }
        
        private canSwitchAngle():boolean {
            return this.vehicleDescriptionModel.HasAngledImage && this.vehicleDescriptionModel.HasSideImage;
        }

        private showFilters() {
            const activeCustomizationComponent = this.activeCustomizationComponent;
            let filterModal:RideStylerShowcaseFilterModal<any, any>;

            if (activeCustomizationComponent === this.customizationComponents.tires) {
                filterModal = new RideStylerShowcaseFilterModal(this.showcase, {
                    filterProvider: this.showcase.filters.tireFilters,
                    showCountTextFormat: strings.getString('show-count-format-tires')
                });
            } else if (activeCustomizationComponent === this.customizationComponents.wheels) {
                filterModal = new RideStylerShowcaseFilterModal(this.showcase, {
                    filterProvider: this.showcase.filters.wheelFilters,
                    showCountTextFormat: strings.getString('show-count-format-wheels')
                });
            }
            
            if (filterModal) {
                filterModal.show();
            }
        }

        private switchAngle() {
            if (!this.canSwitchAngle()) return;

            if (this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle)
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;
            else
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Angle;
            
            this.updateViewport({
                Type: this.imageType
            });
        }
    }



    interface CustomizationComponentSettings {
        title:string;
        showFilterButton: boolean;
    }
}