namespace RideStylerShowcase {
    import WheelFitmentDescriptionModel = ridestyler.Descriptions.WheelFitmentDescriptionModel;
    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel;
    import WheelPricingDataObject = ridestyler.DataObjects.WheelPricingDataObject;
    
    const emptyCellString = '-';

    export class RideStylerShowcaseWheelSpecsModal extends RideStylerShowcaseTableModal<WheelFitmentDescriptionModel> {
        constructor(showcaseInstance:RideStylerShowcaseInstance, model:WheelModelDescriptionModel) {
            super(showcaseInstance, {
                columns: [
                    {
                        header: strings.getString('size'),
                        cell: fitment => {
                            let {DiameterMin, WidthMin} = fitment;

                            if (!DiameterMin || !WidthMin) return emptyCellString;

                            return `${DiameterMin}″ x ${WidthMin}″`;
                        }
                    }, 
                    {
                        header: strings.getString('offset'),
                        cell: fitment => formatCell(fitment, 'OffsetMin', 'mm')
                    },
                    {
                        header: strings.getString('bolt-pattern'),
                        cell: 'BoltPatternDescription'
                    },
                    {
                        header: strings.getString('centerbore'),
                        cell: fitment => formatCell(fitment, 'CenterboreMM', 'mm')
                    },
                    {
                        header: 'Price',
                        cell: getFitmentPrice
                    },
                    {
                        header: strings.getString('item-number'),
                        cell: getFitmentItemNumber
                    }
                ],
                title: [
                    model.WheelBrandName,
                    model.WheelModelName,
                    strings.getString('specifications')
                ].join(' ')
            });

            api.request('wheel/getfitmentdescriptions', ObjectHelper.assign({
                WheelModel: model.WheelModelID
            }, this.showcase.filters.wheelFilters.getFilters())).done(response => {
                this.appendRows(response.Fitments);
            });
        }
    }

    function getFitmentRetailPriceDataObject(fitment: WheelFitmentDescriptionModel):WheelPricingDataObject {
        return fitment.Pricing && fitment.Pricing['Retail'] || undefined;
    }

    function getFitmentItemNumber(fitment: WheelFitmentDescriptionModel):string {
        let retailPriceDataObject:WheelPricingDataObject = getFitmentRetailPriceDataObject(fitment);

        let itemNumber:string;

        // Item number is the retail pricing item number by default
        if (retailPriceDataObject) itemNumber = retailPriceDataObject.WheelPricingItemNumber;
        // If there's no retail pricing, or the retail price doesn't have a item number use the fitment's part number
        if (!itemNumber) itemNumber = fitment.PartNumber;
        
        return itemNumber || emptyCellString;
    }

    function getFitmentPrice(fitment: WheelFitmentDescriptionModel):string {
        const noPriceString = strings.getString('call');
        let retailPriceDataObject:WheelPricingDataObject = getFitmentRetailPriceDataObject(fitment);

        if (!retailPriceDataObject) return noPriceString;

        let price:number = retailPriceDataObject.WheelPricingAmount;

        return price ? strings.format().currency(price, '$') : noPriceString;
    }

    function formatCell(fitment: WheelFitmentDescriptionModel, key:keyof WheelFitmentDescriptionModel, postfix:string):HTMLTableCellElement {
        let string:string = fitment[key].toString();
        
        return HTMLHelper.createElement('td', {
            text: string ? string + postfix : emptyCellString
        });
    }
}