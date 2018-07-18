namespace RideStylerShowcase {
    import Tab = RideStylerShowcaseTabBar.Tab;
    

    const customizationsClass = 'ridestyler-showcase-customizations';
    const loadingClass = customizationsClass + '-loading';

    type customizationComponentKeys = 'paint' | 'wheels' | 'tires' | 'suspension';

    export class RideStylerShowcaseVehicleVisualization extends MainComponentBase {
        private productSelector = RideStylerShowcaseProductSelector;
        private viewport:RideStylerViewport;
        private tabBar:RideStylerShowcaseTabBar;
        private changeWheelSize:RideStylerShowcaseChangeWheelSize;

        private titleElement:HTMLElement;
        private rotateElement:HTMLElement;
        private filterButton:HTMLButtonElement;
        private shareButton:HTMLButtonElement;

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

        private resultsArr:Array<any> = [];

        private components:IComponent[];
        /**
         * The ID of the currently displayed vehicle
         */
        private vehicleConfigurationID:string;

        /**
         * The description of the currently displayed vehicle
         */
        private vehicleDescription:string;

        private targetDiameter:number;

        /**
         * The Image Type for displaying what angle the car is being viewed
         */
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

            this.state.afterDataChange(newData => {
                this.parameters.set(newData);
            })

            this.events.on('initialized', () => {
                this.setupViewport(container);
                 
                // Setup initial tab layout
                this.updateTabLayout();

                // Attempt to resume our state from the URL
                this.resumeSessionState(this.parameters.get());

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

                //Sets the diameter to state, updates the viewport, and pushes the description to the url
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
                appendTo: this.component,
                style: {
                    opacity: '1'
                },
                disabled: true
            });
            
            shareButton.addEventListener('click', () => {
                new RideStylerShowcaseShareModal(this.showcase, this.currentRenderInstructions).show();
            });

            this.state.afterDataChange(stateData => {
                shareButton.disabled = stateData.currentWheel ? false : true;
            })

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
            this.parameters.popEventListener(this);
        }

        //takes in the URL data and returns proxied functions
        private resumeSessionState(urlObject) {
            let context = this;
            let loadRoutines = {
                vc: function(vehicleSelectArgs) { 
                    var promise = api.request("vehicle/getdescriptions", { VehicleConfiguration: urlObject.vc }); 

                    promise.done(r => {
                        if (r.Success && r.Descriptions.length > 0) {
                            vehicleSelectArgs.VehicleConfiguration = r.Descriptions[0].ConfigurationID;
                            vehicleSelectArgs.VehicleDescription = r.Descriptions[0].FullDescription;
                        }
                    });

                    return promise;
                },
                to:  function(vehicleSelectArgs) { 
                    var promise = api.request('vehicle/gettireoptiondetails', { VehicleConfiguration: urlObject.vc }); 

                    promise.done(r => {
                        if (r.Success && r.Details.length > 0) {
                            for(var i = 0; i < r.Details.length; i++) {
                                if (r.Details[i].TireOptionID == urlObject.to || i == r.Details.length - 1) {
                                    vehicleSelectArgs.TireOptionID = r.Details[0].TireOptionID;
                                    vehicleSelectArgs.TireOptionString = r.Details[0].Front.Description;
                                    context.targetDiameter = r.Details[0].Front.InsideDiameter;
                                }
                            }
                        }
                    });

                    return promise;
                },
                tm:  function(vehicleSelectArgs) { 
                    let promise = api.request("tire/getmodeldescriptions", { TireModel: urlObject.tm });

                    promise.done(r => {
                        if (r.Success && r.Models.length > 0) {
                            vehicleSelectArgs.currentTire = r.Models[0];
                        }
                    });
                    
                    return promise; 
                },
                p:  function(vehicleSelectArgs) { 

                    var tokens = urlObject.p.split('|');

                    let promise = api.request("vehicle/getpaintschemedescriptions", { VehiclePaintScheme: tokens[0] }); 

                    promise.done(r => {
                        if (r.Success && r.Schemes.length > 0) {
                            for(let scheme of r.Schemes) {
                                if (scheme.SchemeName == tokens[1]) {
                                    vehicleSelectArgs.PaintScheme = scheme;
                                    break;
                                }
                            }
                        }
                    });
                    return promise;
                },
                wm:  function(vehicleSelectArgs) { 
                    var promise = ridestyler.promise<boolean>();

                    // Make our request for our selected model
                    api.request("wheel/getmodeldescriptions", { WheelModel: urlObject.wm }).done(mr => {
                        if (mr.Success && mr.Models.length > 0) {

                            var model = mr.Models[0];
                            vehicleSelectArgs.currentWheel = model;
                            
                            // Load our fitments for this model
                            api.request("wheel/getfitmentdescriptions", { VehicleConfiguration: urlObject.vc, WheelModel: urlObject.wm, IncludePricing: true })
                                .done(fr => {
                                    if (fr.Success && fr.Fitments.length > 0) {
                                        context.loadWheelFitmentDescriptions(model, fr);
                                        promise.resolve(true);
                                    } else {
                                        promise.resolve(false);
                                    }
                                });

                        } else {
                            promise.resolve(false);
                        }
                    });

                    return promise;
                },
                wf:  function(vehicleSelectArgs) { 
                    let promise = api.request("wheel/getfitmentdescriptions", { WheelFitments: urlObject.wf, IncludePricing: true }); 
                    promise.done(r => {
                       if (r.Success && r.Fitments.length > 0) {
                           vehicleSelectArgs.currentWheelFitment = r.Fitments[0];
                           context.activeWheelDiameterSelect(r);
                       } 
                    });

                    return promise;
                }
            }
            
            let promArr = [];

            // Vehicle selection arguments are built as promArr promises are resolved
            let vehicleSelectArgs:any = {
                currentSuspension: Number(urlObject.s)
            };

            for (let key in loadRoutines) {            
                if (urlObject[key]) {
                    promArr.push(loadRoutines[key](vehicleSelectArgs));
                }
            }

            if (promArr.length > 0) {
                PromiseHelper.all(promArr).done(function() {
                    context.events.trigger("vehicle-selected", vehicleSelectArgs);
                });
            }
        }    

       

        /**
         * Removes the active class from the diameter options and adds it to the correct element
         */
        public activeWheelDiameterSelect(results){
            let currentWheelDiameter = !results ? this.state.getData().currentWheelFitment.DiameterMin + '″' : results.Fitments[0].DiameterMin + '″';

            // See if we have a selected size already and remove the active class
            let wheelSizeActive = document.getElementsByClassName('ridestyler-showcase-button-picker-option-active')[0];
            if (wheelSizeActive) wheelSizeActive.classList.remove('ridestyler-showcase-button-picker-option-active');                    
            
            let wheelSizeList = document.getElementsByClassName('ridestyler-showcase-button-picker-option')
            let currentSize; 
            
            for (var i = 0; i < wheelSizeList.length; i++) {
              if (wheelSizeList[i].innerHTML === currentWheelDiameter) {
                currentSize = wheelSizeList[i];
              }
            }

            this.state.extendData({
                currentWheelFitment: !results ? this.state.getData().currentWheelFitment : results.Fitments[0]
            })

            // Make sure we found our new size so we can select it
            if (currentSize)
                currentSize.classList.add('ridestyler-showcase-button-picker-option-active');
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
            this.events.trigger("vehicle-description-loaded", this.vehicleDescriptionModel);
            this.currentRenderInstructions = {};

            let firstCustomizationComponent:string;

            if (this.customizationComponentSettings.wheels.enabled) firstCustomizationComponent = 'wheels';
            else if (this.customizationComponentSettings.tires.enabled) firstCustomizationComponent = 'tires';
            else firstCustomizationComponent = 'paint';

            this.tabBar.setActiveTab(this.tabs[firstCustomizationComponent]);

            // Create the components that will be switched with the tabs
            this.customizationComponents = {
                paint: new RideStylerShowcasePaintSelector(this.showcase),
                wheels: new RideStylerShowcaseWheelSelector(this.showcase),
                tires: new RideStylerShowcaseTireSelector(this.showcase),
                suspension: new RideStylerShowcaseSuspensionSelector(this.showcase)
            };

            //Component
            this.customizationComponents.wheels.setFilters(this.showcase.filters.wheelFilters.getFilters(), false);

            this.showcase.filters.wheelFilters.onFiltersChanged = filters => {
                this.customizationComponents.wheels.setFilters(filters);
            };
            
            this.showcase.filters.tireFilters.onFiltersChanged = filters => {
                this.customizationComponents.tires.setFilters(filters);
            };

            this.customizationComponents.paint.onPaintSchemeSelected = paintScheme => {
                this.state.extendData({currentPaintScheme: paintScheme})
                this.customizationComponents.paint.setOptionIsLoading(true);
                this.updateViewport({PaintColor: paintScheme.Colors[0].Hex}).always(() => {
                    this.customizationComponents.paint.setOptionIsLoading(false);
                })
            };

            this.customizationComponents.wheels.productSelectedCallback = model => {
                this.customizationComponents.wheels.setOptionIsLoading(true);

                const canRenderOnCurrentAngle =
                    this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle && model.HasAngleImage ||
                    this.imageType === ridestyler.DataObjects.VehicleResourceType.Side && model.HasSideImage;
                if (!canRenderOnCurrentAngle) this.switchAngle();

                api.request('wheel/getfitmentdescriptions', {
                    VehicleConfiguration: this.vehicleConfigurationID,
                    WheelModel: model.WheelModelID,
                    IncludePricing: true
                })
                .done(response => {

                    var bestFitment = this.loadWheelFitmentDescriptions(model, response);

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
                this.state.extendData({currentSuspension: renderUpdate.Suspension })
                this.updateViewport(renderUpdate)
            };

            this.setActiveCustomizationComponent(this.customizationComponents[firstCustomizationComponent]);

            for (let customizationComponent of ObjectHelper.getValues<IComponent>(this.customizationComponents)) {
                customizationComponent.component.classList.add('ridestyler-showcase-customization-component');
                this.customizationComponentContainer.appendChild(customizationComponent.component);
            }

            this.imageType = ridestyler.DataObjects.VehicleResourceType.Angle;
            
            if (!this.vehicleDescriptionModel.HasAngledImage) this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;

            this.rotateElement.style.display = this.canSwitchAngle() ? '' : 'none';
            let stateData = this.state.getData();
            this.updateViewport({ 
                VehicleConfiguration: this.vehicleConfigurationID,
                WheelFitment: !stateData.currentWheelFitment ? undefined : stateData.currentWheelFitment.WheelFitmentID,
                PaintColor: !stateData.currentPaintScheme ? undefined : stateData.currentPaintScheme.Colors[0].Hex,
                VehicleTireOption: this.vehicleTireOptionID,
                PositionX: ridestyler.Requests.ImagePosition.Center,
                PositionY: ridestyler.Requests.ImagePosition.Far,
                Suspension: !stateData.currentSuspension ? undefined : stateData.currentSuspension,
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
            return this.vehicleDescriptionModel.HasAngledImage && this.vehicleDescriptionModel.HasSideImage ;
        }

        /**
         * Loads the results from a Wheel/GetFitmentDescriptions request and returns the best fitment option
         * for the returned WheelFitmentDescriptions.
         * @param model The wheel model used for querying the fitment descriptions
         * @param fitmentDescriptionResult The response from a Wheel/GetFitmentDescriptions request for the specified model
         */
        private loadWheelFitmentDescriptions(model, fitmentDescriptionResult) {
            let fitments:ridestyler.Descriptions.WheelFitmentDescriptionModel[] = fitmentDescriptionResult.Fitments;
            let bestFitment:ridestyler.Descriptions.WheelFitmentDescriptionModel = undefined;

            // Load our resulting fitments into our wheel model
            model.WheelFitments = fitments;
            
            // Sort our fitments so we are ordered by best fitments first
            fitments.sort(function (a,b) {
                const aDiff = Math.abs(a.DiameterMin - this.targetDiameter);
                const bDiff = Math.abs(b.DiameterMin - this.targetDiameter);
                
                return aDiff - bDiff;
            });

            bestFitment = fitments[0];

            this.state.extendData({
                currentWheel: model,
                currentWheelFitment: bestFitment
            });

            this.changeWheelSize.setFitmentOptions(fitments, bestFitment);
            this.changeWheelSize.component.style.display = '';

            return bestFitment;
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

        //Chnages angled view of vehicle
        private switchAngle() {
            if (!this.canSwitchAngle() || this.state.getData().currentWheel.HasSideImage === false) return;

            if (this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle) {

                this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;            
            }
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