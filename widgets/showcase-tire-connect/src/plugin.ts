namespace TireConnectPlugin {
    /**
     * The URL of the TireConnect plugin
     */
    export var BaseURL:string = undefined;
    
    /**
     * If true, open the TireConnect plugin in a new tab
     */
    export var OpenInNewTab:boolean = false;

    const HTMLHelper = RideStylerShowcase.HTMLHelper;
    const StringHelper = RideStylerShowcase.StringHelper;
    const VisibilityHelper = RideStylerShowcase.VisibilityHelper;

    const strings = RideStylerShowcase.strings;

    const RideStylerShowcaseTable = RideStylerShowcase.RideStylerShowcaseTable;

    type WheelFitmentDescriptionModel = ridestyler.Descriptions.WheelFitmentDescriptionModel;
    type WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel;

    export class CustomWheelDetails extends RideStylerShowcase.WheelDetails {
        createTirePackageButton: HTMLButtonElement;
        
        currentACESID: string;
        isVehicleID: boolean;

        constructor(showcase: RideStylerShowcase.RideStylerShowcaseInstance) {
            super(showcase);

            if (!BaseURL) console.warn("Please set TireConnectPlugin.BaseURL to the URL of the TireConnect widget");
        }

        protected initializeComponent() {
            super.initializeComponent();

            this.createTirePackageButton = HTMLHelper.createButton({
                className: 'ridestyler-showcase-wheel-details-create-tire-package tire-connect-plugin-wheel-details-create-tire-package',
                appendTo: this.component,
                text: "Build Wheel and Tire Package",
                link: true
            });

            this.setTirePackageButtonVisibility(false);

            this.createTirePackageButton.addEventListener('click', () => {
                const {
                    currentWheel,
                    currentTireOption
                } = this.state.getData();

                let modal:RideStylerShowcase.RideStylerShowcaseModal;

                const wheelFitments = currentWheel.WheelFitments;
                
                let tireConnectURLBase = BaseURL;
                const tireConnectParams = {};

                if (!tireConnectURLBase) console.error("Please set TireConnectPlugin.BaseURL to the URL of the TireConnect widget");
                
                // Remove any hash and add in wheel_service
                {
                    const hashIndex = tireConnectURLBase.lastIndexOf('#');
                    if (hashIndex >= 0) tireConnectURLBase = tireConnectURLBase.substr(0, hashIndex);

                    tireConnectURLBase += '#!wheel_service?';
                }

                tireConnectParams[this.isVehicleID ? 'aces_id' : 'base_aces_id'] = this.currentACESID;
                
                const selectTire = (size:ridestyler.Descriptions.TireSizeDescriptionModel) => {
                    tireConnectParams['tire_width[b]'] = size.Width;
                    tireConnectParams['tire_height[b]'] = size.AspectRatio;
                    tireConnectParams['tire_rim[b]'] = size.InsideDiameter;
                    tireConnectParams['tire_size[b]'] = size.Description;
                };
                
                const selectFitment = (fitment:WheelFitmentDescriptionModel, qty:string) => {
                    tireConnectParams['wheel_brand[b]'] = currentWheel.WheelBrandName;
                    tireConnectParams['wheel_product_name[b]'] = currentWheel.WheelModelName + ' (' + currentWheel.WheelModelFinishDescription + ')';
                    tireConnectParams['wheel_image[b]'] = RideStylerShowcase.api.getURL("wheel/image", {
                        WheelFitment: fitment.WheelFitmentID,
                        WheelFitmentResourceType: ridestyler.DataObjects.WheelFitmentResourceType.Catalog,
                        IncludeShadow: true,
                        Width: 300,
                        Height: 300,
                        PositionX: ridestyler.Requests.ImagePosition.Center,
                        PositionY: ridestyler.Requests.ImagePosition.Center
                    });
                    tireConnectParams['wheel_quantity[b]'] = qty;
                    tireConnectParams['wheel_part_number[b]'] = fitment.PartNumber;
                    
                    tireConnectParams['wheel_desc[b]'] = getFitmentDescription(fitment);
                 
                    // Pricing
                    {
                        const retailPriceDataObject = getRetailPrice(fitment);
                        const retailPrice = retailPriceDataObject && retailPriceDataObject.WheelPricingAmount;

                        if (retailPrice > 1) {
                            tireConnectParams['wheel_price[b]'] = retailPriceDataObject.WheelPricingAmount.toString();
                        }
                    }

                    // Wheel link
                    tireConnectParams['wheel_link[b]'] = location.href;
                    tireConnectParams['wheel_link_label[b]'] = 'Edit Wheel';

                    const url = tireConnectURLBase + ridestyler.utils.toParamString(tireConnectParams);

                    if (OpenInNewTab) window.open(url, '_blank');
                    else location.href = url;
                }

                selectTire(currentTireOption.Front);

                if (wheelFitments.length === 0) return;

                modal = new SelectWheelFitmentModal(this.showcase, currentWheel, (fitment, qty) => {
                    selectFitment(fitment, qty);
                    modal.hide();
                });

                modal.show();
            });

            this.events.on("vehicle-selected", () => {
                setTimeout(() => this.updateTirePackageButton(), 0);
            });
        }

        private setTirePackageButtonVisibility(visible:boolean) {
            VisibilityHelper.setVisibility(this.createTirePackageButton, visible);
        }

        private updateTirePackageButton() {
            const {
                currentVehicleConfigurationID
            } = this.state.getData();

            if (!currentVehicleConfigurationID) return this.setTirePackageButtonVisibility(false);

            RideStylerShowcase.api.request("vehicle/getreferences", {
                VehicleConfiguration: currentVehicleConfigurationID,
                VehicleReferenceType: ridestyler.DataObjects.VehicleReferenceType.ACES,
                VehicleReferenceFields: [
                    ridestyler.DataObjects.VcDbReferenceFields.VehicleID,
                    ridestyler.DataObjects.VcDbReferenceFields.BaseVehicleID
                ]
            }).done(response => {
                const references = response.References;

                if (!references.length) return this.setTirePackageButtonVisibility(false);

                let acesID:string;
                let isVehicleID:boolean = false;
                
                // Loop through references until we find a VehicleID
                // Optionally defaults to the last BaseVehicleID in the list if needed
                for (let i = 0; i < references.length; i++) {
                    const reference = references[i];

                    acesID = reference.VehicleReferenceValue;
                    
                    if (reference.VehicleReferenceField === ridestyler.DataObjects.VcDbReferenceFields.VehicleID) {
                        isVehicleID = true;
                        break;
                    }
                }

                this.currentACESID = acesID;
                this.isVehicleID = isVehicleID;

                this.setTirePackageButtonVisibility(true);
            });
        }
    }

    type FitmentSelectedCallback = (fitment: WheelFitmentDescriptionModel, qty:string) => void;

    export class SelectWheelFitmentModal extends RideStylerShowcase.RideStylerShowcaseModal {
        titleElement:HTMLElement;
        brandTitleElement:HTMLElement;
        subtitleElement:HTMLElement;

        onFitmentSelected: FitmentSelectedCallback;
        
        table: RideStylerShowcase.RideStylerShowcaseTable<WheelFitmentDescriptionModel>;

        constructor(showcaseInstance:RideStylerShowcase.RideStylerShowcaseInstance, wheelModel:WheelModelDescriptionModel, onFitmentSelected?: FitmentSelectedCallback) {
            super(showcaseInstance, {
                removeOnHidden: true
            });

            HTMLHelper.setText(this.brandTitleElement, wheelModel.WheelBrandName);
            HTMLHelper.setText(this.titleElement, wheelModel.WheelModelName);
            HTMLHelper.setText(this.subtitleElement, wheelModel.WheelModelFinishDescription);

            this.table.appendRows(wheelModel.WheelFitments);

            this.onFitmentSelected = onFitmentSelected;
        }

        protected buildModal() {
            super.buildModal();
            
            HTMLHelper.createElement('h1', {
                className: 'ridestyler-showcase-product-modal-title',
                appendTo: this.component,
                append: [
                    this.brandTitleElement = HTMLHelper.createElementWithClass('span', 'ridestyler-showcase-product-modal-title-brand'),
                    this.titleElement = HTMLHelper.createElement('span'),
                    this.subtitleElement = HTMLHelper.createElementWithClass('span', 'ridestyler-showcase-product-modal-title-subtitle')
                ]
            });

            HTMLHelper.createElement('p', {
                text: 'Please select a fitment:',
                appendTo: this.component,
                style: {
                    fontWeight: 'bold'
                }
            });

            this.table = new RideStylerShowcaseTable<WheelFitmentDescriptionModel>(this.showcase, {
                columns: [
                    {
                        header: strings.getString('size'),
                        cell: fitment => {
                            let {DiameterMin, WidthMin} = fitment;
                
                            if (!DiameterMin || !WidthMin) return RideStylerShowcaseTable.emptyCellString;
                
                            return `${DiameterMin}″ x ${WidthMin}`;
                        }
                    },
                    {
                        header: strings.getString('offset'),
                        cell: fitment => RideStylerShowcaseTable.formatCell(fitment, 'OffsetMin', 'mm')
                    },
                    {
                        header: strings.getString('bolt-pattern'),
                        cell: 'BoltPatternDescription'
                    },
                    {
                        header: 'Price',
                        cell: fitment => {
                            const noPriceString = strings.getString('call');
                            const retailPriceDataObject = getRetailPrice(fitment);
                    
                            if (!retailPriceDataObject) return noPriceString;
                    
                            let price:number = retailPriceDataObject.WheelPricingAmount;

                            if (price < 1) price = undefined;
                    
                            return price ? strings.format().currency(price, '$') : noPriceString;
                        }
                    },
                    {
                        header: 'Item #',
                        cell: fitment => {
                            const retailPriceDataObject = getRetailPrice(fitment);

                            let itemNumber:string;

                            // Item number is the retail pricing item number by default
                            if (retailPriceDataObject) itemNumber = retailPriceDataObject.WheelPricingItemNumber;
                            // If there's no retail pricing, or the retail price doesn't have a item number use the fitment's part number
                            if (!itemNumber) itemNumber = fitment.PartNumber;

                            return itemNumber || RideStylerShowcaseTable.emptyCellString;
                        }
                    },
                    {
                        header: 'Qty',
                        cell: fitment => HTMLHelper.createElement('td', {
                            append: HTMLHelper.createElement('input', {
                                className: 'tire-connect-plugin-quantity-input',
                                properties: {
                                    type: 'number',
                                    value: '4',
                                    min: '1'
                                }
                            })
                        })
                    },
                    {
                        header: '',
                        cell: fitment => {
                            const orderButton = HTMLHelper.createButton({
                                text: 'Add to Package'
                            });
                            const td = HTMLHelper.createElement('td', {
                                append: orderButton
                            });

                            orderButton.addEventListener('click', e => {
                                if (typeof this.onFitmentSelected !== 'function') return;

                                const qtyInput = td.previousSibling.firstChild as HTMLInputElement;

                                this.onFitmentSelected(fitment, qtyInput.value);
                            });

                            return td;
                        }
                    }
                ]
            })

            this.component.appendChild(this.table.component);
        }
    }

    function getFitmentDescription(fitment: ridestyler.Descriptions.WheelFitmentDescriptionModel):string {
        const {
            DiameterMin: diameter,
            WidthMin: width,
            OffsetMin: offset,
            BoltPatternDescription: boltPattern,
            WheelModelFinishDescription: finish
        } = fitment;


        return `${diameter}x${width} (${offset}mm) — ${boltPattern} — ${finish}`;
    }

    function getRetailPrice(fitment: ridestyler.Descriptions.WheelFitmentDescriptionModel):ridestyler.DataObjects.WheelPricingDataObject {
        return fitment.Pricing && fitment.Pricing['Retail'] || undefined;
    }

    // Setup setup 
    {
        const css = `
        .tire-connect-plugin-quantity-input {
            width: 50px;
            border: 1px solid #aaa;
            border-radius: 6px;
            padding: 3px 0 3px 13px;
            text-align: center;
        }`;

        const head = document.head || document.getElementsByTagName('head')[0];
        const style = HTMLHelper.createElement('style', {
            properties: {
                type: 'text/css'
            },
            text: css
        });

        head.appendChild(style);
    }
}

RideStylerShowcase.WheelDetails = TireConnectPlugin.CustomWheelDetails;