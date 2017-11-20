namespace RideStylerShowcase {
    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel
    import WheelFitmentDescriptionModel = ridestyler.Descriptions.WheelFitmentDescriptionModel;
    import WheelPricingDataObject = ridestyler.DataObjects.WheelPricingDataObject;
    export class RideStylerShowcaseWheelModal extends RideStylerShowcaseProductModal {
        protected image:ResizeableResourceImage<"wheel/image">;

        private specsTable: RideStylerShowcaseTable<WheelFitmentDescriptionModel>;
        private summaryTable:RideStylerShowcaseTable<WheelFitmentDescriptionModel>;

        constructor(showcaseInstance:RideStylerShowcaseInstance, wheelModel:WheelModelDescriptionModel) {
            super(showcaseInstance);

            // Image
            this.image.update({
                WheelFitmentResourceType: ridestyler.DataObjects.WheelFitmentResourceType.Catalog,
                WheelModel: wheelModel.WheelModelID
            });

            // Brand
            HTMLHelper.setText(this.brandTitleElement, wheelModel.WheelBrandName);

            // Model Name
            HTMLHelper.setText(this.titleElement, wheelModel.WheelModelName);

            // Finish
            this.titleElement.appendChild(HTMLHelper.createElement('br'));
            this.titleElement.appendChild(HTMLHelper.createElement('span', {
                text: wheelModel.WheelModelFinishDescription
            }));

            // Summary Table
            this.summaryTable = new RideStylerShowcaseTable<WheelFitmentDescriptionModel>(this.showcase, {
                columns: [
                    {
                        header: strings.getString('size'),
                        cell: RideStylerShowcaseWheelModal.getFitmentSizeDescription
                    },
                    {
                        header: strings.getString('price'),
                        cell: RideStylerShowcaseWheelModal.getFitmentPrice
                    }
                ],
                startLoading: true
            });
            
            this.summaryElement.appendChild(this.summaryTable.component);

            this.buildSpecsPage();

            api.request('wheel/getfitmentdescriptions', {
                WheelModel: wheelModel.WheelModelID,
                IncludePromotions: true,
                IncludePricing: true
            }).done(response => {
                this.summaryTable.appendRows(response.Fitments);
                this.specsTable.appendRows(response.Fitments);
            });
        }

        private buildSpecsPage() {
            this.specsTable = new RideStylerShowcaseTable<WheelFitmentDescriptionModel>(this.showcase, {
                columns: [
                    {
                        header: strings.getString('size'),
                        cell: RideStylerShowcaseWheelModal.getFitmentSizeDescription
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
                        header: strings.getString('centerbore'),
                        cell: fitment => RideStylerShowcaseTable.formatCell(fitment, 'CenterboreMM', 'mm')
                    },
                    {
                        header: 'Price',
                        cell: RideStylerShowcaseWheelModal.getFitmentPrice
                    },
                    {
                        header: strings.getString('item-number'),
                        cell: RideStylerShowcaseWheelModal.getFitmentItemNumber
                    }
                ]
            });

            const specsContainer = HTMLHelper.createElement({
                className: 'scrollable',
                append: this.specsTable.component
            });

            this.addPage({
                container: specsContainer,
                label: strings.getString('specifications')
            });
        }

        protected createImage():ResizeableResourceImage<"wheel/image"> {
            return new ResizeableResourceImage<"wheel/image">(this.imageContainer, {
                action: "wheel/image",
                baseInstructions: {
                    PositionX: ridestyler.Requests.ImagePosition.Center,
                    PositionY: ridestyler.Requests.ImagePosition.Far,
                    IncludeShadow: true
                }
            });
        }

        private static getFitmentRetailPriceDataObject(fitment: WheelFitmentDescriptionModel):WheelPricingDataObject {
            return fitment.Pricing && fitment.Pricing['Retail'] || undefined;
        }

        private static getFitmentSizeDescription(fitment:WheelFitmentDescriptionModel):string {
            let {DiameterMin, WidthMin} = fitment;

            if (!DiameterMin || !WidthMin) return RideStylerShowcaseTable.emptyCellString;

            return `${DiameterMin}″ x ${WidthMin}″`;
        }

        private static getFitmentPrice(fitment: WheelFitmentDescriptionModel):string {
            const noPriceString = strings.getString('call');
            let retailPriceDataObject:WheelPricingDataObject = RideStylerShowcaseWheelModal.getFitmentRetailPriceDataObject(fitment);
    
            if (!retailPriceDataObject) return noPriceString;
    
            let price:number = retailPriceDataObject.WheelPricingAmount;
    
            return price ? strings.format().currency(price, '$') : noPriceString;
        }

        private static getFitmentItemNumber(fitment: WheelFitmentDescriptionModel):string {
            let retailPriceDataObject:WheelPricingDataObject = RideStylerShowcaseWheelModal.getFitmentRetailPriceDataObject(fitment);

            let itemNumber:string;

            // Item number is the retail pricing item number by default
            if (retailPriceDataObject) itemNumber = retailPriceDataObject.WheelPricingItemNumber;
            // If there's no retail pricing, or the retail price doesn't have a item number use the fitment's part number
            if (!itemNumber) itemNumber = fitment.PartNumber;

            return itemNumber || RideStylerShowcaseTable.emptyCellString;
        }
    }
}