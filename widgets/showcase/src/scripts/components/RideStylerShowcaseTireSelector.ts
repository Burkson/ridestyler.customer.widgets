namespace RideStylerShowcase {
    import TireFilterModel = ridestyler.Requests.TireFilterModel;
    import TireModelDescriptionModel = ridestyler.Descriptions.TireModelDescriptionModel;

    export class RideStylerShowcaseTireSelector extends RideStylerShowcaseProductSelector<TireModelDescriptionModel, TireFilterModel> {
        private readonly vehicleTireOptionID:string;
        private readonly supportedVehicleImagery: {
            angled: boolean;
            side: boolean;
        };

        protected readonly defaultFilters: TireFilterModel;
        protected currentFilters: TireFilterModel;

        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance);

            let stateData = showcaseInstance.stateHandler.getData();

            this.supportedVehicleImagery = {
                angled: stateData.vehicleHasAngledImage,
                side: stateData.vehicleHasSideImage
            };

            this.vehicleTireOptionID = stateData.currentVehicleTireOptionID;
            this.defaultFilters = {
                VehicleTireOption: this.vehicleTireOptionID,
                HasCatalogImage: true
            };
            this.currentFilters = ObjectHelper.assign({}, this.defaultFilters);
        }

        protected countResults(filters: TireFilterModel): ridestyler.RideStylerPromise<number, ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("tire/countmodels", filters), response => response.Count);
        }
        protected getResults(filters: TireFilterModel): ridestyler.RideStylerPromise<TireModelDescriptionModel[], ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("tire/getmodeldescriptions", filters), response => response.Models);
        }
        protected productFilter(product: TireModelDescriptionModel): boolean {
            return true;
        }
        protected productImageSource(product: TireModelDescriptionModel): string {
            return ridestyler.tire.image({
                TireFitmentResourceType: ridestyler.DataObjects.TireFitmentResourceType.Catalog,
                TireModel: product.TireModelID,
                Width: 100,
                Height: 100,
                PositionX: ridestyler.Requests.ImagePosition.Center,
                PositionY: ridestyler.Requests.ImagePosition.Center,
                IncludeShadow: true
            });
        }
        protected productImageLabels(product: TireModelDescriptionModel): { primary: string; secondary?: string; tertiary?: string; } {
            return {
                primary: product.TireBrandName,
                secondary: product.TireModelName,
                tertiary: product.Attributes && product.Attributes.length ?
                    product.Attributes.join(', ') : ''
            };
        }

    }
}