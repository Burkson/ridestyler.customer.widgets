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
                var recommendations = null;
                var batch = ridestyler.ajax.batch();
                for (var i = 0; i < wheelFitments.length; i++) {
                    var wf = wheelFitments[i];
                    batch.send(wf.PartNumber, {
                        action: 'tire/recommendsize',
                        data: {
                            BaseTireSizeDesc: currentTireOption.Front.Description,
                            NewWheelDiameter: wf.DiameterMin,
                            NewWheelWidth: wf.WidthMin
                        }
                    });
                }
                batch.done(function (r) { return recommendations = r; });
                batch.execute();
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
                    tireConnectParams['tire_width[b]'] = size.DisplayWidth;
                    tireConnectParams['tire_height[b]'] = size.DisplayAspectRatio;
                    tireConnectParams['tire_rim[b]'] = size.DisplayInsideDiameter;
                    tireConnectParams['tire_size[b]'] = size.Description;
                };
                var selectFitment = function (fitment, qty) {
                    var r = recommendations[fitment.PartNumber];
                    if (r.Recommendations.length == 0) {
                        alert('We could not recommend a new tire for this wheel/vehicle combination. Please contact us directly for this application.');
                        return;
                    }
                    selectTire(r.Recommendations[0].Size);
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
                if (wheelFitments.length === 0)
                    return;
                modal = new SelectWheelFitmentModal(_this.showcase, currentWheel, function (fitment, qty) {
                    if (recommendations == null)
                        return;
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
                    marginBottom: '0',
                    fontWeight: 'bold'
                }
            });
            HTMLHelper.createElement('small', {
                text: 'Wheel and tire recommendations are for informational purposes only. You should consult with a professional to confirm fit before ordering or installing anything on your vehicle.',
                style: {
                    color: '#777',
                    fontStyle: 'italic'
                },
                appendTo: this.component
            });
            var tableWrapper = HTMLHelper.createElement('div', {
                className: 'scrollable ridestyler-showcase-product-modal-page',
                style: {
                    top: '17em'
                },
                appendTo: this.component
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
            tableWrapper.appendChild(this.table.component);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBVSxpQkFBaUIsQ0E4WTFCO0FBOVlELFdBQVUsaUJBQWlCO0lBQ3ZCOztPQUVHO0lBQ1EseUJBQU8sR0FBVSxTQUFTLENBQUM7SUFFdEM7O09BRUc7SUFDUSw4QkFBWSxHQUFXLEtBQUssQ0FBQztJQUV4QyxJQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7SUFDakQsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDO0lBQ3JELElBQU0sZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7SUFFN0QsSUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDO0lBRTNDLElBQU0sdUJBQXVCLEdBQUcsa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7SUFLM0U7UUFBd0Msc0NBQStCO1FBTW5FLDRCQUFZLFFBQXVEO1lBQW5FLFlBQ0ksa0JBQU0sUUFBUSxDQUFDLFNBR2xCO1lBREcsSUFBSSxDQUFDLGtCQUFBLE9BQU87Z0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQywyRUFBMkUsQ0FBQyxDQUFDOztRQUM1RyxDQUFDO1FBRVMsZ0RBQW1CLEdBQTdCO1lBQUEsaUJBMEhDO1lBekhHLGlCQUFNLG1CQUFtQixXQUFFLENBQUM7WUFFNUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7Z0JBQ25ELFNBQVMsRUFBRSw2R0FBNkc7Z0JBQ3hILFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDeEIsSUFBSSxFQUFFLDhCQUE4QjtnQkFDcEMsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdC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