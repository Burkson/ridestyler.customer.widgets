namespace RideStylerShowcase {
    import Tab = RideStylerShowcaseTabBar.Tab;

    const customizationsClass = 'ridestyler-showcase-customizations';
    const loadingClass = customizationsClass + '-loading';

    type customizationComponentKeys = 'paint' | 'wheels' | 'tires' | 'suspension';

    export class RideStylerShowcaseVehicleVisualization extends MainComponentBase {
        private viewport:RideStylerViewport;
        private tabBar:RideStylerShowcaseTabBar;
        private changeWheelSize:RideStylerShowcaseChangeWheelSize;

        private titleElement:HTMLElement;
        private rotateElement:HTMLElement;
        private filterButton:HTMLButtonElement;

        private vehicleDetails:VehicleDetails;

        private tabs: {
            [key in customizationComponentKeys]: Tab;
        };
        
        private customizationComponentOrder:customizationComponentKeys[] = ['paint', 'wheels', 'tires', 'suspension'];
        
        private customizationComponentContainer:HTMLElement;
        private customizationComponents:{
            paint: RideStylerShowcasePaintSelector;
            wheels: RideStylerShowcaseWheelSelector;
            tires: RideStylerShowcaseTireSelector;
            suspension: RideStylerShowcaseSuspensionSelector;
        };

        private customizationComponentSettings: {
            [key in customizationComponentKeys]: CustomizationComponentSettings;
        } = {
            paint: {
                title: strings.getString('select-paint'),
                showFilterButton: false,
                enabled: true
            },
            wheels: {
                title: strings.getString('select-wheels'),
                showFilterButton: true,
                enabled: true
            },
            tires: {
                title: strings.getString('select-tires'),
                showFilterButton: true,
                enabled: true
            },
            suspension: {
                title: strings.getString('adjust-suspension'),
                showFilterButton: false,
                enabled: true
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

        private vehicleSuspension: string;

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
                this.setupViewport(container);
                // Setup initial tab layout
                this.updateTabLayout();

                this.events.on('vehicle-selected', () => {
                    if (this.vehicleDifferentFromState())
                        this.viewport.Reset();
                })

                // Hide the share button if sharing is disabled
                if (!this.showcase.settingsFromAPI.EnableSharing)
                    shareButton.style.display = 'none';
                
                let countTireBrands = api.request("tire/countbrands", this.showcase.filters.tireFilters.getFilters());
                let countWheelBrands = api.request("wheel/countbrands", this.showcase.filters.wheelFilters.getFilters());

                PromiseHelper.all([countTireBrands, countWheelBrands]).done(results => {
                    let tireBrandCount = results[0].Count;
                    let wheelBrandCount = results[1].Count;

                    if (!tireBrandCount) this.customizationComponentSettings.tires.enabled = false;
                    if (!wheelBrandCount) this.customizationComponentSettings.wheels.enabled = false;

                    this.updateTabs();
                });
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

            // Start listening for breakpoint changes
            this.events.on('breakpoint-changed', newBreakpoint => {
                this.updateTabLayout();
            });

            this.vehicleDetails.paintSwatchClickCallback = () => {
                this.setActiveCustomizationComponent(this.customizationComponents.paint);
            }
        }

        private setupViewport(container: HTMLElement) {
            let viewportElement = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-viewport',
                appendTo: container
            });

            viewportElement.addEventListener('click', () => {
                this.switchAngle();
            });

            this.viewport = new RideStylerViewport(viewportElement);

            //Listens for new car selection and hides vehicle between updates
        }

        private updateTabs() {
            let tabs:Tab[] = [];

            for (const key of this.customizationComponentOrder) {
                // Skip disabled components
                if (!this.customizationComponentSettings[key].enabled) continue;

                tabs.push(this.tabs[key]);
            }

            this.tabBar.setTabs(tabs);
            this.updateTabLayout();
        }

        private updateTabLayout() {
            const currentBreakpoint = this.showcase.style.getCurrentBreakpoint();

            const horizontal:boolean = currentBreakpoint && currentBreakpoint[0] === 'phone-portrait';
            
            this.tabBar.setMode(horizontal ? 'horizontal' : 'vertical');
        }

        private setupTabs() {
            this.tabBar  = new RideStylerShowcaseTabBar(this.showcase);

            // Define our tabs
            this.tabs = {
                paint: new RideStylerShowcaseTabBar.Tab({
                    icon: 'paint',
                    key: 'paint',
                    label: strings.getString('paint')
                }),
                wheels: new RideStylerShowcaseTabBar.Tab({
                    icon: 'wheel',
                    key: 'wheels',
                    label: strings.getString('wheels')
                }),
                tires: new RideStylerShowcaseTabBar.Tab({
                    icon: 'tire',
                    key: 'tires',
                    label: strings.getString('tires')
                }),
                suspension: new RideStylerShowcaseTabBar.Tab({
                    icon: 'suspension',
                    key: 'suspension',
                    label: strings.getString('suspension')
                })
            };

            // Switch the bottom view, the customization component when a tab is clicked on
            this.tabBar.tabSwitchedCallback = e => {
                const newTab = e.newTab;
                const key = newTab.key;
                
                if (this.customizationComponents && key in this.customizationComponents) {
                    this.setActiveCustomizationComponent(this.customizationComponents[key]);
                }
            };
        }

        private vehicleDifferentFromState(): boolean {
            let stateData = this.state.getData();
            if (!stateData.currentVehicleConfigurationID || !stateData.currentVehicleTireOptionID) {
                console.error('Trying to show the visualize screen without a vehicle configuration or tire option.');
            }

            let vehicleChanged = !GUIDHelper.areEqual(stateData.currentVehicleConfigurationID, this.vehicleConfigurationID);
            let tireOptionChanged = !GUIDHelper.areEqual(stateData.currentVehicleTireOptionID, this.vehicleTireOptionID);

            return vehicleChanged || tireOptionChanged;
        }

        protected onDisplay() {
            if (this.vehicleDifferentFromState()) {
                let stateData = this.state.getData();

                this.vehicleConfigurationID = stateData.currentVehicleConfigurationID
                this.vehicleDescription = stateData.currentVehicleDescription;
                
                this.vehicleTireOptionID = stateData.currentVehicleTireOptionID;
                this.vehicleTireOptionDescription = stateData.currentVehicleTireOptionDescription;
                
                this.tabBar.clearActiveTab();
                this.onVehicleChanged();
            }
        }

        private onVehicleChanged() {
            HTMLHelper.empty(this.customizationComponentContainer);

            // Set the customization container as loading while we're loading additional information
            // about the vehicle
            this.customizationComponentContainer.classList.add(loadingClass);
            
            this.updateTabs();

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
                    currentVehicleDescriptionModel: vehicleDescription,

                });
                this.initializeForNewVehicle();
            });
        }

        private initializeForNewVehicle() {
            this.currentRenderInstructions = {};
            this.tabBar.setActiveTab(this.tabs.paint);
            this.viewport.Reset();

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

            this.setActiveCustomizationComponent(this.customizationComponents.wheels);

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
            let tab:RideStylerShowcaseTabBar.Tab = this.tabs[componentKey];

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
        enabled: boolean;
    }
}