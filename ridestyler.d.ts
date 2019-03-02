declare namespace ridestyler {
    interface initializeSettings{
        Key?:string;
        Token?:string;
        Verb?:string;
        DataType?:string;
        NoCache?:boolean;
    }

    interface RideStylerAPIResponse {
        Success: boolean;
        Code: number;
        Message: string;
    }

    namespace DataObjects {
        const enum DataStatus {
            Valid = 1,
            NeedsReview = 2,
            PendingDelete = 4
        }

        const enum VehicleResourceType
        {
            Default = 0,
            Side = 1,
            Angle = 2
        }

        const enum VehicleSearchOptions
        {
            None = 0,
    
            /// <summary>
            /// Requires that all tokens in the search string are matched when locating the vehicle configurations
            /// </summary>
            ExactMatch = 1,
    
            /// <summary>
            /// Indicates that we prefer to sort results with images above those we feel might be a more accurate
            /// vehicle for the search being performed.
            /// </summary>
            PreferImagesOverAccuracy = 2,
    
            /// <summary>
            /// Requires that we match a known make during the search otherwise we won't return any results.
            /// </summary>
            RequireMakeMatch = 4,
    
            /// <summary>
            /// Require that we can match a RideStyler model before proceeding to matching configurations. Otherwise, we will not return
            /// any results for the request.
            /// </summary>
            RequireModelMatch = 8,
    
            /// <summary>
            /// If we end up with a list of configurations and none of them have a score (we used all the tokens on initial matching or none of them match the tokens we have left)
            /// then we just pick a random result and return it as the only search result
            /// </summary>
            AllowConfigurationGuessing = 16,
    
            /// <summary>
            /// Limit our configuration guess to only include a single result instead of all configurations for the matched model
            /// </summary>
            LimitConfigurationsToSingleGuess = 32,
    
            /// <summary>
            /// Limits result to only return a single record for each unique image set
            /// </summary>
            CombineResultsByImage = 64
        }

        const enum WheelBrandFlags
        {
            None = 0,
            PreferProprietaryInstallationKits = 1,
            RequireProprietaryInstallationKits = 2
        }

        interface WheelFinishCategoryDataObject
        {
            WheelFinishCategoryID: string;
            WheelFinishCategoryUpdated: string;
            WheelFinishCategoryArchived: boolean;
            WheelFinishCategoryName: string;
        }

        interface WheelBrandDataObject {
            WheelBrandID: string;
            WheelBrand_DataSourceID: number;
            WheelBrand_OrganizationPermissionID: number;
            WheelBrandUpdated: string;
            WheelBrandArchived: boolean
            WheelBrandName: string;
            WheelBrandFlags: WheelBrandFlags;
        }

        interface WheelModelDataObject {
            WheelModelID: string;
            WheelModel_WheelBrandID: string;
            WheelModelUpdated: string;
            WheelModelArchived: boolean;
            WheelModelName: string;
            WheelModelFinishDescription: string;
            WheelModelDataStatus: DataStatus;
        }

        const enum WheelFitmentResourceType
        {
            Side = 1,
            Angled = 2,
            Catalog = 3
        }

        const enum TireBrandResourceType
        {
            Logo = 1
        }

        const enum VehiclePaintSchemeType
        {
            SingleTone = 1,
            DualTone = 2,
            TriTone = 3
        }

        const enum BaseColor
        {
            Red = 1,
            Green = 2,
            Blue = 3,
            Black = 4,
            White = 5,
            Gray = 6,
            Grey = 6,
            Orange = 7,
            Yellow = 8,
            Beige = 9,
            Brown = 10,
            Purple = 11
        }

        const enum VehiclePaintPosition
        {
            Default = 1
        }
    
        const enum VehiclePaintAttributes
        {
            None        = 0b000,
            Metallic    = 0b001,
            Pearlescent = 0b010,
            Matte       = 0b100
        }

        const enum PromotionType
        {
            Sale = 1,
            Closeout = 2,
            Feature = 3,
            Special = 4
        }

        interface PromotionDataObject {
            PromotionID: number;
            Promotion_OrganizationPermissionID: number;
    
            PromotionName: string;
    
            PromotionDescription: string;
    
            PromotionNotes: string;
    
            PromotionPriority: number;
    
            PromotionTag: string;
            
            PromotionType: PromotionType;
    
            PromotionStartDate: string;
            PromotionEndDate: string;
        }

        interface WheelCenterCapTypeDataObject {
            WheelCenterCapTypeID: number;
            WheelCenterCapTypeName: string;
        }

        interface WheelHoleTypeDataObject {
            WheelHoleTypeID: number;
            WheelHoleTypeName: string;
        }

        interface BoltPatternDataObject {
            BoltPatternID: number;
            BoltPatternBoltCount: number;
            BoltPatternSpacingMM: number;
            BoltPatternSpacingIN: number;
            BoltPatternDescription: string;
            BoltPatternDataStatus: DataStatus;
        }

        interface WheelPricingDataObject {
            WheelPricingID: number;
            WheelPricing_WheelFitmentID: string;
            WheelPricing_PricingDataTypeID: number;
            WheelPricing_PricingGroupID: string;
            WheelPricingAmount: number;
            WheelPricingItemNumber: string;
            WheelPricingNotes: string;
        }

        interface WheelAccessoryPricingDataObject {
            WheelAccessoryPricingID: number;
            WheelAccessoryPricing_WheelAccessoryID: number;
            WheelAccessoryPricing_PricingDataTypeID: number;
            WheelAccessoryPricing_PricingGroupID: string;
            WheelAccessoryPricingAmount: number;
            WheelAccessoryPricingNotes: string;
            WheelAccessoryPricingItemNumber: string;
        }

        const enum WheelFitmentFlag
        {
            None = 0,
            Discontinued = 1,
        }
        
        const enum WheelUseTypeFlag
        {
            AllVehicles = 0,
            Truck = 1,
            SUV = 2,
            Crossover = 4,
            Van = 8,
            Car = 16
        }

        interface WheelFitmentDataObject {
            WheelFitmentID: string;
            WheelFitmentUpdated: string;
            WheelFitmentArchived: boolean;
    
            WheelFitment_WheelModelID: string;
            
            WheelFitmentMaxWeight: number;
    
            WheelFitmentDiameterMin: number;
            WheelFitmentDiameterMax: number;
            WheelFitmentWidthMin: number;
            WheelFitmentWidthMax: number;
            WheelFitmentOffsetMin: number;
            WheelFitmentOffsetMax: number;
            WheelFitmentCenterboreMM: number;
    
            WheelFitment_WheelCenterCapTypeID: number;
            WheelFitment_WheelHoleTypeID: number;
            WheelFitmentCoveredLug: boolean;
    
            WheelFitmentPartNumber: string;
    
            WheelFitmentFlags: WheelFitmentFlag;
            WheelFitmentUseTypeFlags: WheelUseTypeFlag;
            WheelFitmentDataStatus: DataStatus;
        }

        interface WheelFitmentResourceDataObject {
            WheelFitmentResourceID: string;
            WheelFitmentResourceUpdated: string;
            WheelFitmentResourceArchived: boolean;
    
            WheelFitmentResource_WheelFitmentID: string;
            WheelFitmentResource_ResourceID: string;
    
            WheelFitmentResourceType: WheelFitmentResourceType;
        }

        const enum FitmentFilterFlags
        {
            IgnoreSpeedRating = 1,
            IgnoreLoadIndex = 2
        }

        const enum TireWarrantyType
        {
            Unknown = 0,
            None = 1,
            Limited = 2,
            Mileage = 3
        }

        interface TireBrandDataObject
        {
            TireBrandID: string;
            TireBrand_DataSourceID: number;
            TireBrand_OrganizationPermissionID: number;
            TireBrandUpdated: string;
            TireBrandArchived: boolean;
            TireBrandName: string;
        }

        interface TireModelDataObject {
            TireModelID: string;
            TireModel_TireBrandID: string;
            TireModelUpdated: string;
            TireModelArchived: boolean;
            TireModelName: string;
            TireModelDataStatus: DataStatus;
        }

        interface TireModelAttributeDataObject {
            TireModelAttributeID: number;
            TireModelAttributeName: string;
            TireModelAttributeDescription: string;
        }

        const enum TireUseTypeFlags {
            AllVehicles = 0,
            Truck = 1,
            SUV = 2,
            Crossover = 4,
            Van = 8,
            Car = 16
        }

        interface TireFitmentDataObject
        {
            TireFitmentID: string;
            TireFitment_TireModelID: string;
            TireFitmentUpdated: string;
            TireFitmentArchived: boolean;
        
            TireFitmentPrimary_TireSidewallID: number;
            TireFitmentSecondary_TireSidewallID: number;
        
            TireFitment_TireSizeID: string;
            TireFitmentWheelWidthMin: number;
            TireFitmentWheelWidthMax: number;
            TireFitmentUTQG: string;
        
            TireFitmentWarrantyType: TireWarrantyType;
            TireFitmentWarrantyMileage: number;
        
            TireFitmentPartNumber: string;
        
            TireFitmentDataStatus: DataStatus;
            TireFitmentUseType: TireUseTypeFlags;
        }
        
        interface TireLoadIndexDataObject {
            TireLoadIndexID: number;
            TireLoadIndexCode: string;
            TireLoadIndexWeightKG: number;
        }
        
        interface TireSpeedRatingDataObject {
            TireSpeedRatingID: number;
            TireSpeedRatingCode: string;
            TireSpeedRatingMPH: number;
            TireSpeedRatingKPH: number;
            TireSpeedRatingExcess: boolean;
        }

        interface TireSidewallDataObject
        {
            TireSidewallID: number;
            TireSidewallAbbr: string;
            TireSidewallName: string;
        }

        interface TirePricingDataObject {
            TirePricingID: number
            TirePricing_TireFitmentID: string;
            TirePricing_PricingDataTypeID: number
            TirePricing_PricingGroupID: string;
            TirePricingAmount: number;
            TirePricingItemNumber: string;
            TirePricingNotes: string;
        }

        const enum TireFitmentResourceType
        {
            Side = 1,
            Catalog = 2,
            Tread = 3,
        
            Optional1 = 10,
            Optional2 = 11,
            Optional3 = 12
        }

        const enum TireFitmentResourceVariant
        {
            PrimarySidewall = 1,
            AlternateSidewall = 2
        }

        interface TireFitmentResourceDataObject {
            TireFitmentResourceID: string;
            TireFitmentResourceUpdated: string;
            TireFitmentResourceArchived: boolean;
            TireFitmentResource_TireFitmentID: string;
            TireFitmentResource_ResourceID: string;
            TireFitmentResourceType: TireFitmentResourceType;
            TireFitmentResourceVariant: TireFitmentResourceVariant;
            TireFitmentResourcePriority: number;
        }

        const enum TireSizeType
        {
            Unknown = 0,
            Metric = 1,
            Flotation = 2,
            Asymmetrical = 3,
            FlotationLegacy = 4,
            Alphanumeric = 5,
            Millimetric = 6,
            EuroMetric = 7
        }

        const enum VehicleReferenceType
        {
            ACES = 1,
            WheelPros = 2
        }

        const enum WheelProsReferenceFields
        {
            VehicleCD = 1
        }
        
        const enum VcDbReferenceFields
        {
            BaseVehicleID = 1,
            BedConfigID = 2,
            BedLengthID = 3,
            BedTypeID = 4,
            BodyNumDoorsID = 5,
            BodyStyleConfigID = 6,
            BodyTypeID = 7,
            DriveTypeID = 8,
            EngineBaseID = 9,
            EngineConfigID = 10,
            FuelTypeID = 11,
            MakeID = 12,
            ModelID = 13,
            RegionID = 14,
            SubModelID = 15,
            VehicleID = 16,
            VehicleTypeGroupID = 17,
            VehicleTypeID = 18,
            YearID = 19
        }
        type VehicleReferenceFields = VcDbReferenceFields | WheelProsReferenceFields;

        interface VehicleReferenceDataObject {
            VehicleReferenceID: number;
            VehicleReference_VehicleConfigurationID: string;
            VehicleReferenceType: VehicleReferenceType;
            VehicleReferenceField: VehicleReferenceFields;
            VehicleReferenceValue: string;
            VehicleReferenceUpdated: string;
        }

        interface VehicleTireOptionDataObject {
            VehicleTireOptionID: string;
            VehicleTireOption_VehicleConfigurationID: string;
            VehicleTireOptionUpdated: string;
            VehicleTireOptionArchived: boolean;
            VehicleTireOptionFront_TireSizeID: string;
            VehicleTireOptionRear_TireSizeID: string;    
        }
    }

     namespace Descriptions {
        interface VehiclePaintSchemeDescriptionModel {
            VehiclePaintSchemeID: string;
            SchemeName: string;
            Type: DataObjects.VehiclePaintSchemeType;
            Colors: VehiclePaintColorDescriptionModel[];
        }

        interface VehiclePaintColorDescriptionModel {
            VehiclePaintColorID: string;
            PaintName:string;
            
            Red:number;
            Green:number;
            Blue:number;

            Hue:number;
            Saturation:number;
            Brightness:number;
            
            Hex: string;

            BaseColor: DataObjects.BaseColor;
            Position: DataObjects.VehiclePaintPosition;
            Attributes: DataObjects.VehiclePaintAttributes;
        }

        interface VehicleTireOptionDescriptionModel {
            ConfigurationID: string;
            TireOptionID: string;
            Front: TireSizeDescriptionModel;
            Rear: TireSizeDescriptionModel;
        }

        interface VehicleSuspensionDescriptionModel {
            Suspension: number;
        }

        interface WheelModelDescriptionModel {
            WheelBrandID:string;
            WheelBrandName:string;
    
            DataSourceDescription:string;
            DataSourceCode:string;
    
            WheelModelID:string;
            WheelModelName:string;
            WheelModelArchived:boolean;
            WheelModelFinishDescription:string;
            WheelModelDataStatus:DataObjects.DataStatus;
            WheelModelUpdated: string;
    
            Promotions:DataObjects.PromotionDataObject[];
    
            SideImageCount: number;
            AngleImageCount: number;
            CatalogImageCount: number;
    
            HasSideImage:boolean;
            HasAngleImage:boolean;
            HasCatalogImage:boolean;
    
            Attributes: string;
            Meta: {
                [key: string]: string;
            };
            WheelFitments: WheelFitmentDescriptionModel[];
            Pricing: {
                [pricingType: string]: [number, number]
            };
        }

        interface WheelFitmentDescriptionModel {
            DataSourceDescription: string;
            WheelBrandName: string;
            WheelModelName: string;
            WheelModelFinishDescription: string;
            WheelBrandID: string;
            WheelFitmentID: string;
            WheelModelID: string;
            MaxWeight: number;
            DiameterMin: number;
            DiameterMax: number;
            WidthMin: number;
            WidthMax: number;
            OffsetMin: number;
            OffsetMax: number;
            CenterboreMM: number;
            WheelCenterCapType: DataObjects.WheelCenterCapTypeDataObject;
            WheelHoleType: DataObjects.WheelHoleTypeDataObject;
            CoveredLug: boolean;
            PartNumber: string;
            WheelFitmentArchived: boolean;
            WheelFitmentDataStatus: DataObjects.DataStatus;
            WheelFitmentUpdated: string;
            HasAngleImage: boolean;
            HasSideImage: boolean;
    
            BoltPatternDescription: string;
            BoltPattern: DataObjects.BoltPatternDataObject;
            BoltPatterns: DataObjects.BoltPatternDataObject[];
    
            Pricing: {
                [pricingType: string]: DataObjects.WheelPricingDataObject;
            };
            Meta: {
                [metaKey: string]: string;
            };
            Promotions: DataObjects.PromotionDataObject[];
            Accessories: WheelAccessoryDescriptionModel;
        }

        interface WheelAccessoryDescriptionModel {
            WheelAccessoryID: number;
            Name: string;
            WheelFitmentID: string;
            Required: boolean;
            Archived: boolean;
            Updated: string;
            Pricing: {
                [pricingType: string]: DataObjects.WheelAccessoryPricingDataObject
            }
        }

        interface VehicleDescriptionModel {
            HasSideImage: boolean;
            HasAngledImage: boolean;
    
            ConfigurationID: string;
    
            MakeName: string;
            ModelName: string;
            TrimName: string;
            Year: number;
    
            DriveType: string;
            DoorType: string;
            StyleType: string;
            StyleDescription: string;
            CabType: string;
            CabTypeClass: string;
            BedType: string;
            BedLength: string;
    
            FullDescription: string;
            TrimDescription: string;

            PaintSchemes: VehiclePaintSchemeDescriptionModel[];
            ReferenceCounts: {
                [vehicleReferenceType:number]:number;
            };
            SearchConfidence: number;
        }



        interface TireSizeDescriptionModel
        {
            TireSizeID: string;
            TireSizeUpdated: string;

            Description: string;
            OutsideDiameter: number;
            Width: number;
            AspectRatio: number;
            InsideDiameter: number;
            Type: DataObjects.TireSizeType;

            SpeedRating: string;
            LoadRange: string;
            LoadIndex: string;
            ServiceType: string;
            Capacities: {
                MaxSpeed: {
                    MPH: number;
                    KMPH: number;
                };
                IsExcess: boolean;
                MaxLoad:  {
                    Kilograms: number;
                    Pounds: number;
                };
                MaxInflationPSI: number;
            };
        }

        interface TireFitmentDescriptionModel
        {
            TireFitmentID: string;
            TireFitment_TireModelID: string;
            TireFitmentWheelWidthMin: number;
            TireFitmentWheelWidthMax: number;
            TireFitmentPartNumber: string;
            TireFitmentUTQG: string;
            TireFitmentWarrantyType: DataObjects.TireWarrantyType;
            TireFitmentWarrantyMileage: number;
            TireFitmentDataStatus: DataObjects.DataStatus;
            TireFitmentUseType: DataObjects.TireUseTypeFlags;
            TireFitmentUpdated: string;
            TireFitmentArchived: boolean;
        
            TireBrandID: string;
            TireBrandName: string;
        
            TireModelName: string;
        
            DataSourceDescription: string;
            DataSourceCode: string;
         
            TireSidewall: DataObjects.TireSidewallDataObject;
            TireSidewallAlt: DataObjects.TireSidewallDataObject;
        
            TireSize: TireSizeDescriptionModel;
        
            Meta: {
                [metaKey: string]: string;
            };
            Pricing: {
                [partNumber: string]: DataObjects.TirePricingDataObject
            };
            Resources: {
                [resourceType: string]: DataObjects.TireFitmentResourceDataObject[]
            };
        }

        interface TireModelDescriptionModel {
            TireBrandName: string;
            TireBrandID: string;
        
            TireModelID: string;
            TireModelName: string;
            TireModelDataStatus: DataObjects.DataStatus;
            TireModelUpdated: string;
            TireModelArchived: boolean;
        
            DataSourceDescription: string;
            DataSourceCode: string;
        
            Attributes: string[];
            Meta: {
                [metKey: string]: string;
            };
            Sidewalls: DataObjects.TireSidewallDataObject[];
            TireFitments: TireFitmentDescriptionModel[];
            Pricing: {
                [pricingType: string]: [number, number]
            };
            WarrantyTypes: DataObjects.TireWarrantyType;
            WarrantyMileageMin: number;
            WarrantyMileageMax: number;
        
            HasSideImage: boolean;
            HasCatalogImage: boolean;
            HasTreadImage: boolean;
        
            SideImageCount: number;
            CatalogImageCount: number;
            TreadImageCount: number;
            OtherImageCount: number;
        
            Promotions: DataObjects.PromotionDataObject[];
        }
    }

    namespace Responses {
        interface RideStylerAuthStartResponse extends RideStylerAPIResponse {
            UserID: number;
            Token: string;
            Roles: ("System Admin"|"Organization Admin"|"Manage Vehicles"|"Manage Tires"|"Manage Wheels")[]
        }

        interface ActionCountResultModel extends RideStylerAPIResponse {
            Count: number;
        }

        interface DiameterResultModel extends RideStylerAPIResponse {
            Diameters: number[];
        }

        interface WheelBrandsResultModel extends RideStylerAPIResponse {
            Brands: DataObjects.WheelBrandDataObject[];
        }

        interface WheelModelsResultModel extends RideStylerAPIResponse {
            Models: DataObjects.WheelModelDataObject[];
        }

        interface WheelModelDescriptionResultModel extends RideStylerAPIResponse {
            Models: Descriptions.WheelModelDescriptionModel[];
        }

        interface WheelFinishCategoriesResultModel extends RideStylerAPIResponse {
            Finishes: DataObjects.WheelFinishCategoryDataObject[];
        }

        interface VehiclePaintSchemeDescriptionResultModel extends RideStylerAPIResponse {
            Schemes: Descriptions.VehiclePaintSchemeDescriptionModel[];
        }

        interface WheelFitmentResultModel extends RideStylerAPIResponse {
            Fitments: DataObjects.WheelFitmentDataObject[];
        }

        interface WheelFitmentDescriptionResultModel extends RideStylerAPIResponse {
            Fitments: Descriptions.WheelFitmentDescriptionModel[];
        }

        interface WheelFitmentResourcesResultModel extends RideStylerAPIResponse {
            Resources: DataObjects.WheelFitmentResourceDataObject[];
        }

        interface WheelCanBeRenderedResultModel extends RideStylerAPIResponse {
            Result: {
                [partNumber: string]: boolean
            },
            PossibleTypes: {
                [partNumber: string]: {
                    Angled: boolean;
                    Side: boolean;
                }
            }
        }

        interface VehicleDescriptionResultModel extends RideStylerAPIResponse {
            Descriptions: Descriptions.VehicleDescriptionModel[];
        }

        interface VehicleReferencesResultModel extends RideStylerAPIResponse {
            References: DataObjects.VehicleReferenceDataObject[]
        }

        interface VehicleCanBeRenderedResponseModel extends RideStylerAPIResponse {
            Result: VehicleCanBeRenderedResultModel
        }

        interface VehicleCanBeRenderedResultModel {
            [vehicleConfigurationID: string]: {
                [identifier: string]: {
                    Renderable: boolean
                }
            }
        }

        interface TireBrandsResultModel extends RideStylerAPIResponse {
            Brands: DataObjects.TireBrandDataObject[]
        }

        interface TireModelsResultModel extends RideStylerAPIResponse {
            Models: DataObjects.TireModelDataObject[]
        }

        interface TireModelAttributesResultModel extends RideStylerAPIResponse {
            Attributes: DataObjects.TireModelAttributeDataObject[];
        }

        interface TireModelDescriptionResultModel extends RideStylerAPIResponse {
            Models: Descriptions.TireModelDescriptionModel[];
        }

        interface TireFitmentResultModel extends RideStylerAPIResponse {
            Fitments: DataObjects.TireFitmentDataObject[];
        }

        interface TireFitmentDescriptionResultModel extends RideStylerAPIResponse {
            Fitments: Descriptions.TireFitmentDescriptionModel[];
        }

        interface TireFitmentResourcesResultModel extends RideStylerAPIResponse {
            Resources: DataObjects.TireFitmentResourceDataObject[];
        }

        interface TireSpeedRatingsResultModel extends RideStylerAPIResponse {
            SpeedRatings: DataObjects.TireSpeedRatingDataObject[];
        }

        interface VehicleTireOptionResultModel extends RideStylerAPIResponse {
            Options: DataObjects.VehicleTireOptionDataObject[];
        }

        interface VehicleTireOptionDetailResultModel extends RideStylerAPIResponse {
            Details: Descriptions.VehicleTireOptionDescriptionModel[];
        }

        interface LinkCreateResponse extends RideStylerAPIResponse {
            ShortURL: string
        }

        interface ShareResultModel extends RideStylerAPIResponse {
            Url: string;
        }

        interface SettingsResultModel extends RideStylerAPIResponse{
            Settings: {
                [key: string]: string;
            }
        }
    }

    namespace Requests {
        const enum OrderDirection {
            Ascending = 0,
            Descending = 1
        }

        interface ActionRequestPagedModel {
            Search?:string;
            Start?:number;
            Count?:number;
            Sort?:{[key:string]:OrderDirection},
            NoCache?:boolean;
            SortRandom?:boolean;
        }

        interface FitmentFilterModel {
            GroupKey?: string;
            
            BoltPattern?: number;
            CenterCap?: number;
            WheelHoleType?: number;
    
            Weight?: number;
            WeightMin?: number;
            WeightMax?: number;
    
            Hub?: number;
            HubMin?: number;
            HubMax?: number;
    
            Offset?: number;
            OffsetMin?: number;
            OffsetMax?: number;
    
            Width?: number;
            WidthMin?: number;
            WidthMax?: number;
    
            Diameter?: number;
            DiameterMin?: number;
            DiameterMax?: number;
    
            SpeedRating?: number;
            LoadIndex?: number;
            SectionWidth?: number;
            AspectRatio?: number;
    
            OutsideDiameter?: number;
            OutsideDiameterMin?: number;
            OutsideDiameterMax?: number;
        }

        interface TireFilterModel extends ActionRequestPagedModel {
            SelectBrandsOnly?: boolean;

            UsePromotionOrder?: boolean;
            UseBrandPriorities?: boolean;
    
            Promotion?: number;
            Promotions?: number[];
    
            TireBrandName?: string;
            TireBrandNames?: string[];
    
            TireBrand?: string;
            TireBrands?: string[];
    
            TireModelName?: string;
            TireModelNames?: string[];
    
            TireModel?: string;
            TireModels?: string[];
    
            TireFitment?: string;
            TireFitments?: string[];
    
            TireSize?: string;
            TireSizes?: string[];
    
            TireSidewall?: number;
            TireSidewalls?: number[];
    
            IgnoredTireModelAttributes?: number[];
    
            RequiredTireModelAttribute?: number;
            RequiredTireModelAttributes?: number[];
    
            RequiredTireModelAttributeGroups?: {
                [key:string]: number[];
            }
    
            VehicleTireOptionPlusSize?: number;
            VehicleTireOption?: string;
            VehicleTireOptionFlags?: DataObjects.FitmentFilterFlags;
            
            VehicleType?: number;
    
            TireFitmentPartNumber?: string;
    
            WarrantyType?: DataObjects.TireWarrantyType;
    
            FitmentFilters?: FitmentFilterModel[];
    
            LoadIndex?: number;
            LoadIndexes?: number[];
             
            LoadIndexCode?: string;
            LoadIndexCodes?: string[];
    
            MinLoadIndex?: number;
            MinLoadIndexCode?: string;
    
            SpeedRating?: number;
            SpeedRatings?: number[];
    
            SpeedRatingCode?: string;
            SpeedRatingCodes?: string[];
    
            MinSpeedRating?: number;
            MinSpeedRatingCode?: string;
    
            TirePricingID?: number;
            TirePricingIDs?: number[];
    
            Price?: number;
    
            PriceMin?: number;
            PriceMax?: number;
            
            asPricing?: boolean;
    
            PricingGroupID?: string;
    
            PricingGroupName?: string;
    
            UseType?: DataObjects.TireUseTypeFlags;
            UseTypes?: DataObjects.TireUseTypeFlags; 
            ExcludedUseTypes?: DataObjects.TireUseTypeFlags;
    
            HasLogo?: boolean;
    
            MissingBrandResourceTypes?: DataObjects.TireBrandResourceType[];
            RequiredBrandResourceTypes?: DataObjects.TireBrandResourceType[];
    
            HasCatalogImage?: boolean;
            HasSideImage?: boolean;
            HasTreadImage?: boolean;
    
            MissingFitmentResourceTypes?: DataObjects.TireFitmentResourceType[];
            RequiredFitmentResourceTypes?: DataObjects.TireFitmentResourceType[];
        }

        const enum InclusionState
        {
            None     = 0b00000, // 0
            Optional = 0b00001, // 1
            Excluded = 0b00010, // 2
            Required = 0b00101, // 5
            ByChild =  0b01000, // 8
            ByParent = 0b10000, // 16
        }
        
        const enum PromotionType
        {
            Sale = 1,
            Closeout = 2,
            Feature = 3,
            Special = 4
        }
        
        const enum WheelBrandResourceType
        {
            Logo = 1
        }

        const enum WheelFitmentResourceType
        {
            Side = 1,
            Angled = 2,
            Catalog = 3
        }
        
        const enum VehicleFitmentPositionType
        {
            Both = 0,
            Front = 1,
            Rear = 2
        }

        interface WheelFilterModel extends ActionRequestPagedModel {
            HasFitments?: boolean;
            
            HasSideImage?:boolean;
            HasAngledImage?:boolean;
            HasCatalogImage?:boolean;

            HasLogo?: boolean;

            SelectBrandsOnly?: boolean;
            UsePromotionOrder?: boolean;
            UseBrandPriorities?: boolean;

            WheelBrandStatus?: InclusionState;
            WheelBrandStatuses?: InclusionState[];

            Promotion?: number;
            Promotions?: number[];
    
            PromotionType?: PromotionType;
            PromotionTypes?: PromotionType[];
    
            WheelBrand?: string;
            WheelBrands?: string[];
    
            WheelModel?: string;
            WheelModels?: string[];
    
            WheelFitment?: string;
            WheelFitments?: string[];
    
            WheelFinishCategory?: string;
            WheelFinishCategories?: string[];
    
            BrandResourceType?: WheelBrandResourceType;
            BrandResourceTypes?: WheelBrandResourceType[];
    
            FitmentResourceType?: WheelFitmentResourceType;
            FitmentResourceTypes?: WheelFitmentResourceType[];
    
            FitmentFilters?: FitmentFilterModel[];
    
            PartNumber?: string;
            PartNumbers?: string[];
    
            DataSource?: number;
            DataSources?: number[];
    
            IgnoredWheelModelAttributes?: number[];
    
            RequiredWheelModelAttribute?: number;
            RequiredWheelModelAttributes?: number[];
            
            RequiredWheelModelAttributeGroups?: {
                [groupKey: string]: number[]
            };
    
            VehicleConfiguration?: string;
            VehicleType?: number;
            VehicleFitmentPosition?: VehicleFitmentPositionType;
            ApplyGlobalFilters?: boolean;
    
            HasPricing?: boolean;
    
            WheelPricingID?: number;
            WheelPricingIDs?: number[];
    
            Price?: number;
    
            PriceMin?: number;
            PriceMax?: number;
    
            GetPricingGroupID?: string;
            PricingGroupID?: string;
    
            PricingGroupName?: string;
        }

        interface WheelCanBeRenderedRequestModel {
            PartNumbers?: string[];
            ItemNumbers?: string[];
            Type?: ridestyler.DataObjects.VehicleResourceType;
            VehicleConfiguration?: string;
            ExcludeDiscontinuedWheels?: boolean;
            PricingGroupID?: string;
        }

        interface VehicleFilterModel extends ActionRequestPagedModel {
            HasImage?: boolean;
            HasSideImage?: boolean;
            HasAngledImage?: boolean;

            VehicleMake?: string;
            VehicleMakes?: string[];
            VehicleModel?: string;
            VehicleModels?: string[];
            VehicleConfiguration?: string;
            VehicleConfigurations?: string[];

            Year?: number;
            YearMin?: number;
            YearMax?: number;
            Years?: number[];

            SearchOptions?: DataObjects.VehicleSearchOptions|number;
        }

        interface VehicleReferenceFilterModel extends ActionRequestPagedModel {
            VehicleConfiguration?: string;
            VehicleConfigurations?: string[];

            VehicleReferenceType?: DataObjects.VehicleReferenceType;
            VehicleReferenceTypes?: DataObjects.VehicleReferenceType[];

            VehicleReferenceField?: DataObjects.VehicleReferenceFields;
            VehicleReferenceFields?: DataObjects.VehicleReferenceFields[];

            VehicleReferenceValue?: string;
            VehicleReferenceValues?: string[];
        }

        interface VehicleCanBeRenderedRequestModel {
            Vehicles: string[];
            Wheels?: VehicleCanBeRenderedRequestFitment[];
        }

        interface VehicleCanBeRenderedRequestFitment {
            ID?: string;
            PartNumber?: string;
            ItemNumber?: string;
        }

        const enum VehicleTireSizeComparisonSettings
        {
            None = 0,
            /// <summary>
            /// Groups tires together by exact matches on size
            /// </summary>
            GroupBySize = 2,
            /// <summary>
            /// Groups "Excess" (Z+) speed rating together, and non Z+ speed ratings together.
            /// </summary>
            GroupBySpeedRatingExcess = 4,
            /// <summary>
            /// Groups sizes by exact matches on the speed rating
            /// </summary>
            GroupBySpeedRatingUnique = 8,
    
            All = ~None
        }

        interface GetTireOptionsRequestModel extends VehicleFilterModel {
            /**
             * @default VehicleTireSizeComparisonSettings.GroupBySize
             */
            GroupSettings?: VehicleTireSizeComparisonSettings;
        }

        interface TireFitmentDescriptionRequestModel extends TireFilterModel {
            /**
             * @default DESCRIPTION|HIGHLIGHTS|VALUE|WarrantyMileageMin|WarrantyMileageMax
             */
            IncludeMetaKeys?: string[];
            IncludePricing?: boolean;

            /**
             * @default true
             */
            IncludeResources?: boolean;
            IncludePromotions?: boolean;
            IncludeAccessories?: boolean;
        }

        interface TireModelDescriptionRequestModel extends TireFitmentDescriptionRequestModel {
            /**
             * @default []
             */
            IncludeMetaKeys?: string[];
            IgnoreImageFiltersForFitments?: boolean;
            IncludeFitments?: boolean;
        }

        const enum ImagePosition
        {
            Near = 0,
            Center = 1,
            Far = 2,
            Fill = 3
        }

        interface ImageRenderRequest {
            Width?: number;
            Height?: number;

            IncludeShadow?: boolean;

            PositionX?: ImagePosition;
            PositionY?: ImagePosition;

            PaddingX?: number;
            PaddingY?: number;
            PaddingTop?: number;
            PaddingRight?: number;
            PaddingBottom?: number;
            PaddingLeft?: number;
        }

        interface TireRenderInstructions extends TireFilterModel, ImageRenderRequest {
            Variant?: DataObjects.TireFitmentResourceVariant;
            FitmentResource?: string;
            FitmentResources?: string[];
            Resource?: string;
            TireFitmentResourceType?: DataObjects.TireFitmentResourceType;
            TireFitmentResourceTypes?: DataObjects.TireFitmentResourceType[];
        }

        interface WheelRenderInstructions extends WheelFilterModel, ImageRenderRequest {
            ShowCaliper?: boolean;
            Resource?: string;
            WheelFitmentResourceType?: DataObjects.WheelFitmentResourceType;
        }

        interface VehicleRenderInstructions extends ImageRenderRequest {
            Type?: DataObjects.VehicleResourceType;

            VehicleConfiguration?:string;
            VehicleTireOption?:string;
            VehicleFilters?:VehicleFilterModel;
            PaintColor?:string;
            
            Suspension?:number;
            SuspensionFront?:number;
            SuspensionRear?:number;

            WheelPartNumber?:string;
            WheelPartNumberFront?:string;
            WheelPartNumberRear?:string;

            WheelItemNumber?:string;
            WheelItemNumberFront?:string;
            WheelItemNumberRear?:string;
            
            WheelFitment?:string;
            WheelFitmentFront?:string;
            WheelFitmentRear?:string;
            
            WheelFitmentResource?:string;
            WheelFitmentResourceFront?:string;
            WheelFitmentResourceRear?:string;
        }

        interface VehiclePaintFilterModel extends ActionRequestPagedModel {
            VehicleConfiguration?: string;
            VehicleConfigurations?: string[];
    
            VehiclePaintScheme?: string;
            VehiclePaintSchemes?: string[];
    
            SchemeName?: string;
            SchemeNames?: string[];
    
            ColorName?: string;
            ColorNames?: string[];

            BaseColor?: DataObjects.BaseColor;
            BaseColors?: DataObjects.BaseColor[];

            Red?: number;
            RedMin?: number;
            RedMax?: number;
            Green?: number;
            GreenMin?: number;
            GreenMax?: number;
            Blue?: number;
            BlueMin?: number;
            BlueMax?: number;

            IncludeMultitone?: boolean;

            PaintSchemeType?: DataObjects.VehiclePaintSchemeType;
            PaintSchemeTypes?: DataObjects.VehiclePaintSchemeType[];

            VehicleFilters?: VehicleFilterModel;
        }

        interface VehiclePaintSchemeRequestModel extends VehiclePaintFilterModel {
            /**
             * If false, don't return default schemes if none are available for a vehicle
             * @default true
             */
            ShowDefaultSchemes?:boolean;
        }

        interface WheelFitmentDescriptionRequestModel extends WheelFilterModel {
            IncludeAccessories?: boolean;
            IncludePricing?: boolean;
            IncludePromotions?: boolean;
            IncludeMetaKeys?: string[];
        }

        interface WheelModelDescriptionRequestModel extends WheelFitmentDescriptionRequestModel {
            IncludeFitments?: boolean;
            IgnoreImageFiltersForFitments?: boolean;
        }

        interface VehicleDescriptionRequestModel extends VehicleFilterModel {
            IncludeReferenceCounts?: boolean;
            IncludePaintSchemes?: boolean;
        }

        interface OrganizationFilterModel {
            Organization?: number;
            Organizations?: number[];
            ParentOrganization?: number;
            ParentOrganizations?: number[];
            IncludeNetwork?: boolean;
            IncludeActiveOrganization?: boolean;
        }

        interface OrganizationSettingsRequestModel extends OrganizationFilterModel {
            Keys: string[];
        }

        interface ShareVehicleRequest extends VehicleRenderInstructions {
            Mode?: "Link"|"Email";
            To?: string;
        }
    }
    
    interface RidestylerAPIActionResponseMapping {
        "auth/validate": RideStylerAPIResponse,
        "auth/start": Responses.RideStylerAuthStartResponse,
        
        "link/create": Responses.LinkCreateResponse,

        "share/vehicle": Responses.ShareResultModel,

        "organization/image": never,
        "organization/getsettings": Responses.SettingsResultModel,

        "tire/countbrands": Responses.ActionCountResultModel,
        "tire/countmodels": Responses.ActionCountResultModel,
        "tire/getbrands": Responses.TireBrandsResultModel,
        "tire/getmodelattributes": Responses.TireModelAttributesResultModel,
        "tire/getmodels": Responses.TireModelsResultModel,
        "tire/getmodeldescriptions": Responses.TireModelDescriptionResultModel,
        "tire/getfitments": Responses.TireFitmentResultModel,
        "tire/getfitmentdescriptions": Responses.TireFitmentDescriptionResultModel,
        "tire/getfitmentresources": Responses.TireFitmentResourcesResultModel,
        "tire/image": never,
        "tire/getspeedratings": Responses.TireSpeedRatingsResultModel,

        "vehicle/getdescriptions": Responses.VehicleDescriptionResultModel,
        "vehicle/gettireoptions": Responses.VehicleTireOptionResultModel,
        "vehicle/gettireoptiondetails": Responses.VehicleTireOptionDetailResultModel,
        "vehicle/getpaintschemedescriptions": Responses.VehiclePaintSchemeDescriptionResultModel,
        "vehicle/countreferences": Responses.ActionCountResultModel,
        "vehicle/getreferences": Responses.VehicleReferencesResultModel,
        "vehicle/canberendered": Responses.VehicleCanBeRenderedResponseModel,

        "wheel/countmodels": Responses.ActionCountResultModel,
        "wheel/countbrands": Responses.ActionCountResultModel,
        "wheel/getdiameters": Responses.DiameterResultModel,
        "wheel/getbrands": Responses.WheelBrandsResultModel,
        "wheel/getmodels": Responses.WheelModelsResultModel,
        "wheel/getmodeldescriptions": Responses.WheelModelDescriptionResultModel,
        "wheel/getfinishes": Responses.WheelFinishCategoriesResultModel,
        "wheel/getfitments": Responses.WheelFitmentResultModel,
        "wheel/getfitmentdescriptions": Responses.WheelFitmentDescriptionResultModel,
        "wheel/getfitmentresources": Responses.WheelFitmentResourcesResultModel,
        "wheel/canberendered": Responses.WheelCanBeRenderedResultModel,
        "wheel/image": never
    }
    interface RidestylerAPIActionRequestMapping {
        "auth/validate": object,
        "auth/start": { Username:string; Password:string; },

        "link/create": { URL: string },

        "share/vehicle": Requests.ShareVehicleRequest,

        "organization/image": { AssetKey:string, Organization?:number },
        "organization/getsettings": Requests.OrganizationSettingsRequestModel,

        "tire/getbrands": Requests.TireFilterModel,
        "tire/countbrands": Requests.TireFilterModel,
        "tire/countmodels": Requests.TireFilterModel,
        "tire/getmodelattributes": Requests.TireFilterModel,
        "tire/getmodels": Requests.TireFilterModel,
        "tire/getmodeldescriptions": Requests.TireModelDescriptionRequestModel,
        "tire/getfitments": Requests.TireFilterModel,
        "tire/getfitmentdescriptions": Requests.TireFitmentDescriptionRequestModel,
        "tire/getfitmentresources": Requests.TireFilterModel,
        "tire/getspeedratings": Requests.TireFilterModel,
        "tire/image": Requests.TireRenderInstructions,

        "vehicle/getdescriptions": Requests.VehicleDescriptionRequestModel,
        "vehicle/gettireoptions": Requests.VehicleFilterModel,
        "vehicle/gettireoptiondetails": Requests.GetTireOptionsRequestModel,
        "vehicle/getpaintschemedescriptions": Requests.VehiclePaintSchemeRequestModel,
        "vehicle/countreferences": Requests.VehicleReferenceFilterModel,
        "vehicle/getreferences": Requests.VehicleReferenceFilterModel,
        "vehicle/canberendered": Requests.VehicleCanBeRenderedRequestModel,

        "wheel/countmodels": Requests.WheelFilterModel,
        "wheel/countbrands": Requests.WheelFilterModel,
        "wheel/getdiameters": Requests.WheelFilterModel,
        "wheel/getbrands": Requests.WheelFilterModel,
        "wheel/getmodels": Requests.WheelFilterModel,
        "wheel/getmodeldescriptions": Requests.WheelModelDescriptionRequestModel,
        "wheel/getfinishes": Requests.WheelFilterModel,
        "wheel/getfitments": Requests.WheelFilterModel,
        "wheel/getfitmentdescriptions": Requests.WheelFitmentDescriptionRequestModel,
        "wheel/getfitmentresources": Requests.WheelFilterModel,
        "wheel/canberendered": Requests.WheelCanBeRenderedRequestModel,
        "wheel/image": Requests.WheelRenderInstructions
    }

    type RideStylerAPIEndpoint = keyof RidestylerAPIActionRequestMapping & keyof RidestylerAPIActionResponseMapping;

    interface ajaxRequestBase {
        action?:string;
        data?:any;
        callback?: (response:any) => void;
    }

    interface ajaxRequest<A extends RideStylerAPIEndpoint> extends ajaxRequestBase
    {
        action?:A;
        data?:RidestylerAPIActionRequestMapping[A];
        callback?: (response:RidestylerAPIActionResponseMapping[A]) => void;
    }

    export function initialize(settings:initializeSettings);
    
    export namespace events {
        export function on(event:string, callback:Function):void;
        export function call(event:string):void;
    }

    export namespace tire {
        export function image(filters:Requests.TireRenderInstructions):string;
    }

    export namespace wheel {
        export function image(filters:Requests.WheelRenderInstructions):string;
    }

    export namespace utils {
        export function toParamString(object:object):string;
    }

    export namespace auth {
        export function initialize():void;

        export function validate(request:ajaxRequest<"auth/validate">):void;

        interface authSetOptions {
            token?:string;
            key?:string;
        }
        export function set(options:authSetOptions):void;

        export function start(request:ajaxRequest<"auth/start">):void;

        export function authenticateData(object:object): object;

        export function generateAuthUrl(baseURL:string):string;
    }

    interface RideStylerPromise<ResolveValueType = any, RejectValueType = ResolveValueType> {
        /**
         * Get the current state of this promise
         */
        state():RideStylerPromiseState;
    
        /**
         * Get the value set in the resolve or reject call
         */
        value():ResolveValueType|RejectValueType;
    
        /**
         * Change the state to a specified state
         * @param state The state to change to
         * @param value The value to set
         * @returns The new state of the promise
         */
        changeState(state:RideStylerPromiseState, value:ResolveValueType|RejectValueType):RideStylerPromiseState;
    
        /**
         * Resolve this promise
         * @param value The value to set
         */
        resolve(value?:ResolveValueType);
    
        /**
         * Reject this promise
         * @param value The value to set
         */
        reject(value?:RejectValueType);
    
        /**
         * Attach a callback to run when resolved or rejected
         * @param callback A callback to run when resolved or rejected
         * @returns This promise
         */
        always(callback:IRideStylerPromiseCallback<ResolveValueType|RejectValueType>): RideStylerPromise<ResolveValueType,RejectValueType>;
        
        /**
         * Attach a callback to run when resolved
         * @param callback A callback to run when resolved
         * @returns This promise
         */
        done(callback:IRideStylerPromiseCallback<ResolveValueType>): RideStylerPromise<ResolveValueType,RejectValueType>;
        
        /**
         * Attach a callback to run when rejected
         * @param callback A callback to run when rejected
         * @returns This promise
         */
        fail(callback:IRideStylerPromiseCallback<RejectValueType>): RideStylerPromise<ResolveValueType,RejectValueType>;
    
        /**
         * Returns true if this promise's state is Resolved
         */
        isResolved(): boolean;
    
        /**
         * Returns true if this promise's state is Rejected
         */
        isRejected(): boolean;
    }
    
    const enum RideStylerPromiseState {
        Pending = 0,
        Resolved = 1,
        Rejected = 2
    }
    interface IRideStylerPromiseCallback<DataType> {
        ( value: DataType ) : void;
    }
    
    export function promise<ResolveValueType, RejectValueType = ResolveValueType>():RideStylerPromise<ResolveValueType, RejectValueType>;

    interface RideStylerBatch extends RideStylerPromise<undefined> {
        send<A extends RideStylerAPIEndpoint>(batchKey:string, request:ajaxRequest<A>): boolean;
        send(batchKey:string, request:ajaxRequestBase): boolean;
        execute(): boolean;
    }

    export namespace ajax {
        export function initialize():void;

        export function url<A extends RideStylerAPIEndpoint>(action:A, data:RidestylerAPIActionRequestMapping[A]):string;
        export function url(action:string, data: any);

        export function send<A extends RideStylerAPIEndpoint>(request:ajaxRequest<A>):void;
        export function send(request:ajaxRequestBase);

        export function batch():RideStylerBatch;
    }
}

declare type RideStylerPromise<ResolveValueType = any, RejectValueType = ResolveValueType> = ridestyler.RideStylerPromise<ResolveValueType, RejectValueType>;