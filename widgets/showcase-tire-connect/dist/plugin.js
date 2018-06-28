var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TireConnectPlugin;
(function (TireConnectPlugin) {
    /**
     * The URL of the TireConnect plugin
     */
    TireConnectPlugin.BaseURL = undefined;
    /**
     * If true, open the TireConnect plugin in a new tab
     */
    TireConnectPlugin.OpenInNewTab = false;
    var HTMLHelper = RideStylerShowcase.HTMLHelper;
    var StringHelper = RideStylerShowcase.StringHelper;
    var VisibilityHelper = RideStylerShowcase.VisibilityHelper;
    var strings = RideStylerShowcase.strings;
    var RideStylerShowcaseTable = RideStylerShowcase.RideStylerShowcaseTable;
    var CustomWheelDetails = /** @class */ (function (_super) {
        __extends(CustomWheelDetails, _super);
        function CustomWheelDetails(showcase) {
            var _this = _super.call(this, showcase) || this;
            if (!TireConnectPlugin.BaseURL)
                console.warn("Please set TireConnectPlugin.BaseURL to the URL of the TireConnect widget");
            return _this;
        }
        CustomWheelDetails.prototype.initializeComponent = function () {
            var _this = this;
            _super.prototype.initializeComponent.call(this);
            this.createTirePackageButton = HTMLHelper.createButton({
                className: 'ridestyler-showcase-wheel-details-create-tire-package tire-connect-plugin-wheel-details-create-tire-package',
                appendTo: this.component,
                text: "Build Wheel and Tire Package",
                link: true
            });
            this.setTirePackageButtonVisibility(false);
            this.createTirePackageButton.addEventListener('click', function () {
                var _a = _this.state.getData(), currentWheel = _a.currentWheel, currentTireOption = _a.currentTireOption;
                var modal;
                var wheelFitments = currentWheel.WheelFitments;
                var tireConnectURLBase = TireConnectPlugin.BaseURL;
                var tireConnectParams = {};
                if (!tireConnectURLBase)
                    console.error("Please set TireConnectPlugin.BaseURL to the URL of the TireConnect widget");
                // Remove any hash and add in wheel_service
                {
                    var hashIndex = tireConnectURLBase.lastIndexOf('#');
                    if (hashIndex >= 0)
                        tireConnectURLBase = tireConnectURLBase.substr(0, hashIndex);
                    tireConnectURLBase += '#!wheel_service?';
                }
                tireConnectParams[_this.isVehicleID ? 'aces_id' : 'base_aces_id'] = _this.currentACESID;
                var selectTire = function (size) {
                    tireConnectParams['tire_width[b]'] = size.Width;
                    tireConnectParams['tire_height[b]'] = size.AspectRatio;
                    tireConnectParams['tire_rim[b]'] = size.InsideDiameter;
                    tireConnectParams['tire_size[b]'] = size.Description;
                };
                var selectFitment = function (fitment, qty) {
                    tireConnectParams['wheel_brand[b]'] = currentWheel.WheelBrandName;
                    tireConnectParams['wheel_product_name[b]'] = currentWheel.WheelModelName + ' (' + currentWheel.WheelModelFinishDescription + ')';
                    tireConnectParams['wheel_image[b]'] = RideStylerShowcase.api.getURL("wheel/image", {
                        WheelFitment: fitment.WheelFitmentID,
                        WheelFitmentResourceType: 3 /* Catalog */,
                        IncludeShadow: true,
                        Width: 300,
                        Height: 300,
                        PositionX: 1 /* Center */,
                        PositionY: 1 /* Center */
                    });
                    tireConnectParams['wheel_quantity[b]'] = qty;
                    tireConnectParams['wheel_part_number[b]'] = fitment.PartNumber;
                    tireConnectParams['wheel_desc[b]'] = getFitmentDescription(fitment);
                    // Pricing
                    {
                        var retailPriceDataObject = getRetailPrice(fitment);
                        var retailPrice = retailPriceDataObject && retailPriceDataObject.WheelPricingAmount;
                        if (retailPrice > 1) {
                            tireConnectParams['wheel_price[b]'] = retailPriceDataObject.WheelPricingAmount.toString();
                        }
                    }
                    // Wheel link
                    tireConnectParams['wheel_link[b]'] = location.href;
                    tireConnectParams['wheel_link_label[b]'] = 'Edit Wheel';
                    var url = tireConnectURLBase + ridestyler.utils.toParamString(tireConnectParams);
                    if (TireConnectPlugin.OpenInNewTab)
                        window.open(url, '_blank');
                    else
                        location.href = url;
                };
                selectTire(currentTireOption.Front);
                if (wheelFitments.length === 0)
                    return;
                modal = new SelectWheelFitmentModal(_this.showcase, currentWheel, function (fitment, qty) {
                    selectFitment(fitment, qty);
                    modal.hide();
                });
                modal.show();
            });
            this.events.on("vehicle-selected", function () {
                setTimeout(function () { return _this.updateTirePackageButton(); }, 0);
            });
        };
        CustomWheelDetails.prototype.setTirePackageButtonVisibility = function (visible) {
            VisibilityHelper.setVisibility(this.createTirePackageButton, visible);
        };
        CustomWheelDetails.prototype.updateTirePackageButton = function () {
            var _this = this;
            var currentVehicleConfigurationID = this.state.getData().currentVehicleConfigurationID;
            if (!currentVehicleConfigurationID)
                return this.setTirePackageButtonVisibility(false);
            RideStylerShowcase.api.request("vehicle/getreferences", {
                VehicleConfiguration: currentVehicleConfigurationID,
                VehicleReferenceType: 1 /* ACES */,
                VehicleReferenceFields: [
                    16 /* VehicleID */,
                    1 /* BaseVehicleID */
                ]
            }).done(function (response) {
                var references = response.References;
                if (!references.length)
                    return _this.setTirePackageButtonVisibility(false);
                var acesID;
                var isVehicleID = false;
                // Loop through references until we find a VehicleID
                // Optionally defaults to the last BaseVehicleID in the list if needed
                for (var i = 0; i < references.length; i++) {
                    var reference = references[i];
                    acesID = reference.VehicleReferenceValue;
                    if (reference.VehicleReferenceField === 16 /* VehicleID */) {
                        isVehicleID = true;
                        break;
                    }
                }
                _this.currentACESID = acesID;
                _this.isVehicleID = isVehicleID;
                _this.setTirePackageButtonVisibility(true);
            });
        };
        return CustomWheelDetails;
    }(RideStylerShowcase.WheelDetails));
    TireConnectPlugin.CustomWheelDetails = CustomWheelDetails;
    var SelectWheelFitmentModal = /** @class */ (function (_super) {
        __extends(SelectWheelFitmentModal, _super);
        function SelectWheelFitmentModal(showcaseInstance, wheelModel, onFitmentSelected) {
            var _this = _super.call(this, showcaseInstance, {
                removeOnHidden: true
            }) || this;
            HTMLHelper.setText(_this.brandTitleElement, wheelModel.WheelBrandName);
            HTMLHelper.setText(_this.titleElement, wheelModel.WheelModelName);
            HTMLHelper.setText(_this.subtitleElement, wheelModel.WheelModelFinishDescription);
            _this.table.appendRows(wheelModel.WheelFitments);
            _this.onFitmentSelected = onFitmentSelected;
            return _this;
        }
        SelectWheelFitmentModal.prototype.buildModal = function () {
            var _this = this;
            _super.prototype.buildModal.call(this);
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
            this.table = new RideStylerShowcaseTable(this.showcase, {
                columns: [
                    {
                        header: strings.getString('size'),
                        cell: function (fitment) {
                            var DiameterMin = fitment.DiameterMin, WidthMin = fitment.WidthMin;
                            if (!DiameterMin || !WidthMin)
                                return RideStylerShowcaseTable.emptyCellString;
                            return DiameterMin + "\u2033 x " + WidthMin;
                        }
                    },
                    {
                        header: strings.getString('offset'),
                        cell: function (fitment) { return RideStylerShowcaseTable.formatCell(fitment, 'OffsetMin', 'mm'); }
                    },
                    {
                        header: strings.getString('bolt-pattern'),
                        cell: 'BoltPatternDescription'
                    },
                    {
                        header: 'Price',
                        cell: function (fitment) {
                            var noPriceString = strings.getString('call');
                            var retailPriceDataObject = getRetailPrice(fitment);
                            if (!retailPriceDataObject)
                                return noPriceString;
                            var price = retailPriceDataObject.WheelPricingAmount;
                            if (price < 1)
                                price = undefined;
                            return price ? strings.format().currency(price, '$') : noPriceString;
                        }
                    },
                    {
                        header: 'Item #',
                        cell: function (fitment) {
                            var retailPriceDataObject = getRetailPrice(fitment);
                            var itemNumber;
                            // Item number is the retail pricing item number by default
                            if (retailPriceDataObject)
                                itemNumber = retailPriceDataObject.WheelPricingItemNumber;
                            // If there's no retail pricing, or the retail price doesn't have a item number use the fitment's part number
                            if (!itemNumber)
                                itemNumber = fitment.PartNumber;
                            return itemNumber || RideStylerShowcaseTable.emptyCellString;
                        }
                    },
                    {
                        header: 'Qty',
                        cell: function (fitment) { return HTMLHelper.createElement('td', {
                            append: HTMLHelper.createElement('input', {
                                className: 'tire-connect-plugin-quantity-input',
                                properties: {
                                    type: 'number',
                                    value: '4',
                                    min: '1'
                                }
                            })
                        }); }
                    },
                    {
                        header: '',
                        cell: function (fitment) {
                            var orderButton = HTMLHelper.createButton({
                                text: 'Add to Package'
                            });
                            var td = HTMLHelper.createElement('td', {
                                append: orderButton
                            });
                            orderButton.addEventListener('click', function (e) {
                                if (typeof _this.onFitmentSelected !== 'function')
                                    return;
                                var qtyInput = td.previousSibling.firstChild;
                                _this.onFitmentSelected(fitment, qtyInput.value);
                            });
                            return td;
                        }
                    }
                ]
            });
            this.component.appendChild(this.table.component);
        };
        return SelectWheelFitmentModal;
    }(RideStylerShowcase.RideStylerShowcaseModal));
    TireConnectPlugin.SelectWheelFitmentModal = SelectWheelFitmentModal;
    function getFitmentDescription(fitment) {
        var diameter = fitment.DiameterMin, width = fitment.WidthMin, offset = fitment.OffsetMin, boltPattern = fitment.BoltPatternDescription, finish = fitment.WheelModelFinishDescription;
        return diameter + "x" + width + " (" + offset + "mm) \u2014 " + boltPattern + " \u2014 " + finish;
    }
    function getRetailPrice(fitment) {
        return fitment.Pricing && fitment.Pricing['Retail'] || undefined;
    }
    // Setup setup 
    {
        var css = "\n        .tire-connect-plugin-quantity-input {\n            width: 50px;\n            border: 1px solid #aaa;\n            border-radius: 6px;\n            padding: 3px 0 3px 13px;\n            text-align: center;\n        }";
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = HTMLHelper.createElement('style', {
            properties: {
                type: 'text/css'
            },
            text: css
        });
        head.appendChild(style);
    }
})(TireConnectPlugin || (TireConnectPlugin = {}));
RideStylerShowcase.WheelDetails = TireConnectPlugin.CustomWheelDetails;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBVSxpQkFBaUIsQ0FrVzFCO0FBbFdELFdBQVUsaUJBQWlCO0lBQ3ZCOztPQUVHO0lBQ1EseUJBQU8sR0FBVSxTQUFTLENBQUM7SUFFdEM7O09BRUc7SUFDUSw4QkFBWSxHQUFXLEtBQUssQ0FBQztJQUV4QyxJQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7SUFDakQsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDO0lBQ3JELElBQU0sZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7SUFFN0QsSUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDO0lBRTNDLElBQU0sdUJBQXVCLEdBQUcsa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7SUFLM0U7UUFBd0Msc0NBQStCO1FBTW5FLDRCQUFZLFFBQXVEO1lBQW5FLFlBQ0ksa0JBQU0sUUFBUSxDQUFDLFNBR2xCO1lBREcsSUFBSSxDQUFDLGtCQUFBLE9BQU87Z0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQywyRUFBMkUsQ0FBQyxDQUFDOztRQUM1RyxDQUFDO1FBRVMsZ0RBQW1CLEdBQTdCO1lBQUEsaUJBZ0dDO1lBL0ZHLGlCQUFNLG1CQUFtQixXQUFFLENBQUM7WUFFNUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7Z0JBQ25ELFNBQVMsRUFBRSw2R0FBNkc7Z0JBQ3hILFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDeEIsSUFBSSxFQUFFLDhCQUE4QjtnQkFDcEMsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdC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