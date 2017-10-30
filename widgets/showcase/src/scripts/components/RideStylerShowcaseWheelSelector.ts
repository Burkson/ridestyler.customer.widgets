namespace RideStylerShowcase {
    import WheelFilterModel = ridestyler.Requests.WheelFilterModel;
    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel;

    export class RideStylerShowcaseWheelSelector extends RideStylerShowcaseProductSelector<WheelModelDescriptionModel, WheelFilterModel> {
        private readonly vehicleConfigurationID:string;
        private readonly supportedVehicleImagery: {
            angled: boolean;
            side: boolean;
        };

        protected readonly defaultFilters: WheelFilterModel;
        protected currentFilters: WheelFilterModel;

        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance);

            let stateData = showcaseInstance.stateHandler.getData();

            this.supportedVehicleImagery = {
                angled: stateData.vehicleHasAngledImage,
                side: stateData.vehicleHasSideImage
            };

            this.vehicleConfigurationID = stateData.currentVehicleConfigurationID;
            this.defaultFilters = {
                VehicleConfiguration: stateData.currentVehicleConfigurationID,
                HasCatalogImage: true
            };
            this.currentFilters = ObjectHelper.assign({}, this.defaultFilters);
        }

        protected countResults(filters: WheelFilterModel): ridestyler.RideStylerPromise<number, ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("wheel/countmodels", filters), response => response.Count);
        }
        protected getResults(filters: WheelFilterModel): ridestyler.RideStylerPromise<WheelModelDescriptionModel[], ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("wheel/getmodeldescriptions", ObjectHelper.assign({
                IncludeResources: true
            }, filters)), response => response.Models);
        }
        protected productFilter(product: WheelModelDescriptionModel): boolean {
            return product.HasAngleImage && this.supportedVehicleImagery.angled ||
                   product.HasSideImage  && this.supportedVehicleImagery.side;
        }
        protected productImageSource(product: WheelModelDescriptionModel): string {
            return ridestyler.wheel.image({
                WheelFitmentResourceType: ridestyler.DataObjects.WheelFitmentResourceType.Catalog,
                WheelModel: product.WheelModelID,
                Width: 100,
                Height: 100,
                PositionX: ridestyler.Requests.ImagePosition.Center,
                PositionY: ridestyler.Requests.ImagePosition.Center,
                IncludeShadow: true
            });
        }
        protected productImageLabels(product: WheelModelDescriptionModel): { primary: string; secondary?: string; tertiary?: string; } {
            return {
                primary: product.WheelBrandName,
                secondary: product.WheelModelName,
                tertiary: product.WheelModelFinishDescription
            };
        }
    }
}