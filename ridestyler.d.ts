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

        interface WheelModelDataObject {
            WheelModelID: string;
            WheelModel_WheelBrandID: string;
            WheelModelUpdated: string;
            WheelModelArchived: boolean;
            WheelModelName: string;
            WheelModelFinishDescription: string;
            WheelModelDataStatus: DataStatus;
        }
    }

    namespace Responses {
        interface RideStylerAuthStartResponse extends RideStylerAPIResponse {
            UserID: number;
            Token: string;
            Roles: ("System Admin"|"Organization Admin"|"Manage Vehicles"|"Manage Tires"|"Manage Wheels")[]
        }

        interface WheelModelsResultModel extends RideStylerAPIResponse {
            Models: DataObjects.WheelModelDataObject[]
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
            Sort?:{[key:string]:OrderDirection}
        }

        interface TireFilterModel extends ActionRequestPagedModel {

        }

        interface WheelFilterModel extends ActionRequestPagedModel {
            HasSideImage?:boolean;
            HasAngledImage?:boolean;
            HasCatalogImage?:boolean;

            WheelModel?: string;
            WheelModels?: string;
        }

        interface VehicleFilterModel extends ActionRequestPagedModel {

        }

        const enum ImagePosition
        {
            Near = 0,
            Center = 1,
            Far = 2,
            Fill = 3
        }

        interface ImageRenderRequest {
            Width: number;
            Height: number;

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

        const enum WheelFitmentResourceType
        {
            Side = 1,
            Angled = 2,
            Catalog = 3
        }

        interface WheelRenderInstructions extends WheelFilterModel, ImageRenderRequest {
            ShowCaliper?: boolean;
            Resource?: string;
            WheelFitmentResourceType?: WheelFitmentResourceType;
        }

        interface VehicleRenderInstructions {
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

        interface VehicleRenderRequest extends VehicleRenderInstructions, ImageRenderRequest {
            
        }
    }
    
    interface RidestylerAPIActionResponseMapping {
        "auth/validate": RideStylerAPIResponse,
        "auth/start": Responses.RideStylerAuthStartResponse
        "organization/image": never,
        "wheel/getmodels": Responses.WheelModelsResultModel,
        "wheel/image": never
    }

    interface RidestylerAPIActionRequestMapping {
        "auth/validate": object,
        "auth/start": { Username:string; Password:string; },
        "organization/image": { assetKey:string, organization?:number },
        "wheel/getmodels": Requests.WheelFilterModel,
        "wheel/image": Requests.WheelRenderInstructions
    }

    interface ajaxRequestBase {
        action?:string;
        data?:any;
        callback?: (response:any) => void;
    }

    interface ajaxRequest<A extends keyof RidestylerAPIActionResponseMapping> extends ajaxRequestBase
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
        export function image(filters:Requests.TireFilterModel):string;
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
        send<A extends keyof RidestylerAPIActionResponseMapping>(batchKey:string, request:ajaxRequest<A>): boolean;
        send(batchKey:string, request:ajaxRequestBase): boolean;
        execute(): boolean;
    }

    export namespace ajax {
        export function initialize():void;

        export function url<A extends keyof RidestylerAPIActionResponseMapping>(action:A, data:RidestylerAPIActionRequestMapping[A]):string;
        export function url(action:string, data: any);

        export function send<A extends keyof RidestylerAPIActionResponseMapping>(request:ajaxRequest<A>):void;
        export function send(request:ajaxRequestBase);

        export function batch():RideStylerBatch;
    }
}

declare type RideStylerPromise<ResolveValueType = any, RejectValueType = ResolveValueType> = ridestyler.RideStylerPromise<ResolveValueType, RejectValueType>;