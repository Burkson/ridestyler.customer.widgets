namespace RideStylerShowcase.api.settings {
    export interface RideStylerShowcaseSettingsFromAPI {
        EnableSharing: boolean;
        SuspensionRanges: {
            [styleTypeDriveType:string]:{
                Min: number,
                Max: number
            }
        };
        UseRawTireDescription: boolean;
    }

    let defaultSettings:RideStylerShowcaseSettingsFromAPI = {
        EnableSharing: true,
        SuspensionRanges: {
            Default: {
                Min: -4,
                Max: 0
            },
            Truck4WD: {
                Min: -4,
                Max: 4
            },
            Van4WD: {
                Min: -4,
                Max: 4
            }
        },
        UseRawTireDescription: false
    };

    export function getSettings():RideStylerPromise<RideStylerShowcaseSettingsFromAPI, ridestyler.RideStylerAPIResponse> {
        return PromiseHelper.then(api.request("organization/getsettings", {
            Keys: [
                'ENABLE_SHARING',
                'SUSPENSION_RANGES',
                'RAWTIREDESC'
            ]
        }), response => {
            let settings = response.Settings;

            if (!settings) return defaultSettings;

            return {
                EnableSharing: parseBoolean(settings["ENABLE_SHARING"] || defaultSettings.EnableSharing),
                SuspensionRanges: parseSuspensionRanges(settings["SUSPENSION_RANGES"]),
                UseRawTireDescription: parseBoolean(settings["RAWTIREDESC"] || defaultSettings.UseRawTireDescription)
            }
        });

    }

    function parseBoolean(boolean:string|boolean):boolean {
        // Not a string, or an empty string, return true or false
        if (typeof boolean !== 'string' || !boolean) return !!boolean;

        let firstChar = boolean[0];

        // True is: the first char being uppercase/lowercase T or Y
        if (firstChar === 'y' || firstChar === 'Y' || firstChar === 't' || firstChar === 'T') return true;

        // False is everything else
        return false;
    }
    
    function parseSuspensionRanges(suspensionRangesSetting:string):RideStylerShowcaseSettingsFromAPI["SuspensionRanges"] {
        if (!suspensionRangesSetting) return defaultSettings.SuspensionRanges;

        try {
            let suspensionRanges:RideStylerShowcaseSettingsFromAPI["SuspensionRanges"] = JSON.parse(suspensionRangesSetting);

            return suspensionRanges;
        } catch (e) {
            console.error(e);

            return defaultSettings.SuspensionRanges;
        }
    }
}