namespace RideStylerShowcase.filters {
    export type FilterProviderType = 'tire'|'wheel'|'global';

    import WheelFilterModel = ridestyler.Requests.WheelFilterModel;
    import TireFilterModel = ridestyler.Requests.TireFilterModel;
    export type GlobalFilterModel = WheelFilterModel & TireFilterModel;

    import FitmentFilterModel = ridestyler.Requests.FitmentFilterModel;

    export class FilterController {
        public readonly globalFilters:GlobalFilterProvider;
        public readonly tireFilters:TireFilterProvider;
        public readonly wheelFilters:WheelFilterProvider;

        constructor() {
            this.globalFilters = new GlobalFilterProvider();
            this.tireFilters = new TireFilterProvider(this.globalFilters);
            this.wheelFilters = new WheelFilterProvider(this.globalFilters);
        }

        public setVehicle(vehicle:Vehicle) {
            this.clearFilters(false);
            this.globalFilters.setVehicle(vehicle);
        }

        public clearFilters(triggerChange?: boolean) {
            this.globalFilters.clear();
            this.tireFilters.clear(triggerChange);
            this.wheelFilters.clear(triggerChange);
        }
    }

    export interface Vehicle {
        vehicleConfigurationID: string;
        vehicleTireOptionID: string;
    }

    export interface FilterValue {
        key: string;
        value: any;
    }

    export interface IFilter<ValueType, FilterType> {
        key: string;
        label?: string;
        allOptionLabel?: string;
        visible?: boolean;

        retrieveOptions?: (globalFilters:GlobalFilterModel) => RideStylerPromise<IFilterOption<ValueType>[], ridestyler.RideStylerAPIResponse>;
        getValueFromFilters?: (filters:FilterType) => any;
        apply: (filters:FilterType, value:ValueType) => void;
    }

    export interface IFilterOption<ValueType> {
        label: string;
        value: ValueType;
    }

    export abstract class FilterProvider<FilterType extends object> {
        public readonly type:FilterProviderType;
        public readonly filterOptions:IFilter<any, FilterType>[];

        protected currentFilters:FilterType;
        
        protected readonly globalFilterProvider: GlobalFilterProvider;

        constructor(type:FilterProviderType, globalFilterProvider:GlobalFilterProvider) {
            this.type = type;
            this.currentFilters = {} as FilterType;

            this.globalFilterProvider = globalFilterProvider;
        }

        /**
         * If specified, this function is called each time the filters change
         */
        public onFiltersChanged:(filters:FilterType) => void;

        /**
         * Trigger the filter changed callback
         */
        protected triggerFilterChange() {
            if (typeof this.onFiltersChanged === 'function')
                this.onFiltersChanged(this.getFilters());
        }

        /**
         * Returns a filter model with the specified filter values set, 
         * without actually setting them
         */
        public previewFilters(filterValues:FilterValue[]):FilterType {
            let globalFilters:GlobalFilterModel = this.globalFilterProvider ? this.globalFilterProvider.getFilters() : {};
            let filters:FilterType = {} as FilterType;

            for (const filterValue of filterValues) {
                let {key, value} = filterValue;

                this.setFilter(key, value, filters);
            }

            return ObjectHelper.assign<FilterType>({} as FilterType, globalFilters as FilterType, filters);
        }

        /**
         * Returns the currently applied filters
         */
        public getFilters():FilterType {
            let globalFilters:GlobalFilterModel = this.globalFilterProvider ? this.globalFilterProvider.getFilters() : {};

            return ObjectHelper.assign<FilterType>({} as FilterType, globalFilters as FilterType, this.currentFilters);
        }

        public retrieveMenuOptions<ValueType>(filter:IFilter<ValueType, FilterType>):RideStylerPromise<IFilterOption<ValueType>[], ridestyler.RideStylerAPIResponse> {
            return filter.retrieveOptions(this.globalFilterProvider.getFilters());
        }
        
        /**
         * Set a filter option, on a specific filter model
         * @param key The filter key to apply
         * @param value The value to apply to the filter
         * @param filters The filters to apply them to
         */
        public setFilter<ValueType = any>(key:string, value:ValueType, filters:FilterType = this.currentFilters):void {
            const filterOption = this.findFilterOption(key);

            if (filterOption) {
                filterOption.apply(filters, value);
            }
        }

        /**
         * Returns the filter option for the specified key
         * @param key The filter key
         */
        protected findFilterOption(key:string): IFilter<any, FilterType> {
            for (const filter of this.filterOptions) {
                if (filter.key === key) {
                    return filter;
                }
            }

            return undefined;
        }

        /**
         * Apply a list of selected filter key-value pairs
         * @param selectedFilters A list of selected filter key-value pairs to apply
         */
        public setFilters(selectedFilters:FilterValue[], triggerChange?: boolean):boolean;
        /**
         * Apply a filter
         * @param key The key of the filter to apply
         * @param value The value to apply to the filter
         */
        public setFilters(key: string, value: any, triggerChange?:boolean):boolean;
        public setFilters(selectedFiltersOrKey:FilterValue[]|string, value?:any, triggerChange?: boolean):boolean {
            const newFilters:FilterType = {} as FilterType;

            let selectedFilters: FilterValue[];

            if (typeof selectedFiltersOrKey === 'string') {
                selectedFilters = [{
                    key: selectedFiltersOrKey,
                    value: value
                }];
            } else {
                selectedFilters = selectedFiltersOrKey;
                if (typeof value === 'boolean') triggerChange = value;
            }

            for (const selectedFilter of selectedFilters) {
                const {key, value} = selectedFilter;

                this.setFilter(key, value, newFilters);
            }

            let hasChanged = false;
            for (const key in newFilters) {
                if (newFilters.hasOwnProperty(key)) {
                    const newFilterValue = newFilters[key];
                    const currentFilterValue = this.currentFilters[key];
                    
                    if (newFilterValue !== currentFilterValue) {
                        this.currentFilters[key] = newFilterValue;
                        hasChanged = true;
                    }
                }
            }

            if (typeof triggerChange === 'undefined') triggerChange = true;
            if (hasChanged && triggerChange) this.triggerFilterChange();

            return hasChanged;
        }

        public abstract getCount(filters:FilterType):RideStylerPromise<number, ridestyler.RideStylerAPIResponse>;

        public clear(triggerChange: boolean = true) {
            this.currentFilters = {} as FilterType;
            if (triggerChange) this.triggerFilterChange();
        }
    }

    const vehicleConfigFilterKey = 'vehicle-config';
    export class GlobalFilterProvider extends FilterProvider<GlobalFilterModel> {
        public readonly filterOptions:IFilter<any, GlobalFilterModel>[];
        private readonly defaultFilters: GlobalFilterModel = {
            HasFitments: true
        };
        
        constructor() {
            super('global', undefined);

            this.currentFilters = ObjectHelper.assign({}, this.defaultFilters);

            this.filterOptions = [
                // VehicleConfiguration & VehicleTireOption
                {
                    key: vehicleConfigFilterKey,
                    visible: false,
                    apply: (filters, vehicle:Vehicle) => {
                        let {
                            vehicleConfigurationID,
                            vehicleTireOptionID
                        } = vehicle;

                        if (vehicleConfigurationID) filters.VehicleConfiguration = vehicleConfigurationID;
                        if (vehicleTireOptionID) filters.VehicleTireOption = vehicleTireOptionID;
                    }
                }
            ];
        }

        public clear() {
            this.currentFilters = ObjectHelper.assign({}, this.defaultFilters);
            console.log('clear');
        }

        /**
         * Applies a vehicle selection to all 
         * @param vehicle The vehicle to apply to filter queries
         */
        public setVehicle(vehicle:Vehicle) {
            this.setFilter(vehicleConfigFilterKey, vehicle);
            console.log('setVehicle');
        }

        public getCount():RideStylerPromise<number, ridestyler.RideStylerAPIResponse> {
            // We'll never call getCount on the GlobalFilterModel
            return undefined;
        }
    }

    export class TireFilterProvider extends FilterProvider<TireFilterModel> {
        public readonly filterOptions:IFilter<any, TireFilterModel>[];

        constructor(globalFilterProvider:GlobalFilterProvider) {
            super('tire', globalFilterProvider);
            
            this.filterOptions = [];
        }

        public getCount(filters:TireFilterModel):RideStylerPromise<number, ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("tire/countmodels", filters), response => {
                return response.Count
            });
        }
    }

    export class WheelFilterProvider extends FilterProvider<WheelFilterModel> {
        public readonly filterOptions:IFilter<any, WheelFilterModel>[];

        constructor(globalFilterProvider:GlobalFilterProvider) {
            super('wheel', globalFilterProvider);

            this.filterOptions = [
                // Brand
                {
                    label: strings.getString('brands'),
                    allOptionLabel: strings.getString('all-brands'),
                    key: 'wheel-brand',
                    retrieveOptions: globalFilters => {
                        // Request Brands
                        return PromiseHelper.then(api.request('wheel/getbrands', globalFilters), response => {
                            // Map brands to IFilterOptions
                            return ArrayHelper.map(response.Brands, brand => {
                                return {
                                    label: brand.WheelBrandName,
                                    value: brand.WheelBrandID
                                }
                            });
                        });
                    },
                    getValueFromFilters: filters => filters.WheelBrand,
                    apply: (filters, wheelBrandID:string) => {
                        filters.WheelBrand = wheelBrandID;
                    }
                },
                // Finish
                {
                    label: strings.getString('finishes'),
                    allOptionLabel: strings.getString('all-finishes'),
                    key: 'wheel-finish',
                    retrieveOptions: globalFilters => {
                        // Request finishes
                        return PromiseHelper.then(api.request('wheel/getfinishes', globalFilters), response => {
                            // Map finishes to IFilterOptions
                            return ArrayHelper.map(response.Finishes, finishCategory => {
                                return {
                                    label: finishCategory.WheelFinishCategoryName,
                                    value: finishCategory.WheelFinishCategoryID
                                }
                            });
                        });
                    },
                    getValueFromFilters: filters => filters.WheelFinishCategory,
                    apply: (filters, wheelFinishCategoryID:string) => {
                        filters.WheelFinishCategory = wheelFinishCategoryID;
                    }
                },
                // Diameter
                {
                    label: strings.getString('sizes'),
                    allOptionLabel: strings.getString('all-sizes'),
                    key: 'wheel-size',
                    retrieveOptions: globalFilters => {
                        // Request diameters
                        return PromiseHelper.then(api.request('wheel/getdiameters', globalFilters), response => {
                            // Map diameters to IFilterOptions
                            return ArrayHelper.map(response.Diameters, diameter => {
                                return {
                                    label: diameter.toString(),
                                    value: diameter
                                }
                            });
                        });
                    },
                    getValueFromFilters: filters => getFitmentFilterValue(filters, 'Diameter'),
                    apply: (filters, diameter:number) => {
                        if (!filters.FitmentFilters) filters.FitmentFilters = [];

                        applyFitmentFilter(filters, {
                            Diameter: diameter
                        });
                    }
                }
            ];
        }
        
        public getCount(filters:WheelFilterModel):RideStylerPromise<number, ridestyler.RideStylerAPIResponse> {
            return PromiseHelper.then(api.request("wheel/countmodels", filters), response => {
                return response.Count;
            });
        }
    }

    function getFitmentFilterValue<FitmentFilterKey extends keyof FitmentFilterModel>(filters:{FitmentFilters?: FitmentFilterModel[]}, key: FitmentFilterKey):FitmentFilterModel[FitmentFilterKey] {
        for (const fitmentFilter of filters.FitmentFilters || []) {
            if (fitmentFilter.GroupKey === fitmentFilterGroupKey) {
                return fitmentFilter[key];
            }
        }

        return undefined;
    }

    const fitmentFilterGroupKey = "ridestyler-showcase-filters";
    function applyFitmentFilter(filters:{FitmentFilters?: FitmentFilterModel[]}, fitmentFilter: FitmentFilterModel) {
        let fitmentFilters = filters.FitmentFilters || [];
        let existingFitmentFilterGroup:FitmentFilterModel;

        for (const appliedFitmentFilter of fitmentFilters) {
            if (appliedFitmentFilter.GroupKey === fitmentFilterGroupKey) {
                existingFitmentFilterGroup = appliedFitmentFilter;
                break;
            }
        }

        if (!existingFitmentFilterGroup) {
            fitmentFilter.GroupKey = fitmentFilterGroupKey;
            fitmentFilters.push(fitmentFilter);
            
            // We've modified the array so update the array in the filters
            filters.FitmentFilters = fitmentFilters;
        } else {
            ObjectHelper.assign<FitmentFilterModel>(existingFitmentFilterGroup, fitmentFilter);
            existingFitmentFilterGroup.GroupKey = fitmentFilterGroupKey;
        }
    }
}