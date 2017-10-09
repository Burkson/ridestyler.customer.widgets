/// <reference path="typings/ridestyler.d.ts" />

declare class RideStylerVehicleSelectionModal {
    constructor(options:RideStylerVehicleSelectionModal.Options);
}

declare namespace RideStylerVehicleSelectionModal {
    export interface Options {
        /**
         * Text to appear on the button of the last screen
         */
        ConfirmButtonText?:string;

        /**
         * Image Settings for vehicle image
         */
        ImageSettings?: ridestyler.Requests.ImageRenderRequest

        /**
         * If true, group the options inside of the vehicle selection menus
         */
        GroupOptions?: boolean;

        afterBackClicked?: (data: OptionChangedEvent) => void;
        afterOptionSelected?: (data: OptionSelectedEvent) => void;
        callback?: (data: VehicleSelectedEvent) => void;
    }

    export interface CurrentSelectionData {
        [title:string]:string;
    }

    export interface OptionChangedEvent {
        /**
         * An object with all of the current selections, with menu titles as keys and their
         * selection as values.
         */
        FullSelection: CurrentSelectionData;
        /**
         * An array with all of the current selections, as sent to the RideStyler API
         */
        FullSelectionData: string[];
    }

    export interface OptionSelectedEvent extends OptionChangedEvent {
        /**
         * An object with one key/value with the title of the current selection as it's key
         * and the value of the selection (as the value).
         */
        CurrentSelection: CurrentSelectionData;
    }

    export interface SelectedVehicleData extends CurrentSelectionData {
        /**
         * A URL to the image of the vehicle that was displayed to the user
         */
        ImageUrl: string;

        /**
         * A description of the vehicle
         */
        VehicleDescription: string;

        /**
         * A VehicleConfigurationID representing the selected vehicle
         */
        VehicleConfiguration: string;
    }

    export interface VehicleSelectedEvent {
        /**
         * Whether or not a final vehicle selection has been made. False if the user closes the modal
         */
        FinalSelectionMade: boolean;
        /**
         * Information about the selected vehicle
         */
        Vehicle: SelectedVehicleData;
        /**
         * An array with all of the current selections, as sent to the RideStyler API
         */
        FullSelectionData: string[];
    }
}