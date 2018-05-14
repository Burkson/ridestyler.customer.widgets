namespace RideStylerShowcase {
    export interface RideStylerShowcaseAPIInitializeSettings{}
    export interface RideStylerShowcaseAPIInitializeSettingsKeyToken extends RideStylerShowcaseAPIInitializeSettings {
        token?:string;
        key?:string;
    }
    export interface RideStylerShowcaseAPIInitializeSettingsUser extends RideStylerShowcaseAPIInitializeSettings {
        username: string;
        password: string;
    }

    export namespace api {
        /**
         * Initialize the RideStyler API by passing in a user/password combination, a user token, or a key.
         * @param settings The API initialization settings
         * @returns A promise that is resolved (or rejected) when the API is authenticated (or fails authentication)
         */
        export function initialize(settings?:RideStylerShowcaseAPIInitializeSettingsKeyToken|RideStylerShowcaseAPIInitializeSettingsUser):RideStylerPromise {
            // If authentication information was passed in, let's use that
            if (settings) {
                if ('username' in settings && 'password' in settings) {
                    // Login using a username and password
                    settings = settings as RideStylerShowcaseAPIInitializeSettingsUser;

                    ridestyler.auth.start({
                        data: {
                            Username: settings.username,
                            Password: settings.password
                        },
                        callback: function(response) {
                            if (response.Success) authenticated.resolve();
                            else authenticated.reject();
                        }
                    });

                    this.getURL()
                    // Skip calling validate below
                    return;
                } else if ('token' in settings || 'key' in settings) {
                    // Login using a key or token
                    ridestyler.auth.set(settings as RideStylerShowcaseAPIInitializeSettingsKeyToken);
                }
            }

            // Validate the user's key or token
            auth.validate()
                .done(() => {
                    const url = ridestyler.ajax.url('', undefined);

                    if (/\/api-alpha\./i.test(url)) environment = Environment.Alpha;
                    else if (/\/api-beta\./i.test(url)) environment = Environment.Beta;
                    else if (/\/api\./i.test(url)) environment = Environment.Live;
                    else environment = Environment.Other;

                    authenticated.resolve();
                })
                .fail(() => authenticated.reject());

            return authenticated;
        }

        export let authenticated = ridestyler.promise();
        export function isAuthenticated():boolean {
            return authenticated.state() === ridestyler.RideStylerPromiseState.Resolved;
        }
        export function afterAuthenticated(callback: Function) {
            if (isAuthenticated()) callback();
            else authenticated.done(() => callback());
        }

        export function request<Action extends keyof ridestyler.RidestylerAPIActionResponseMapping>(action:Action, data?:ridestyler.RidestylerAPIActionRequestMapping[Action]) : RideStylerPromise<ridestyler.RidestylerAPIActionResponseMapping[Action]> {
            type Response = ridestyler.RidestylerAPIActionResponseMapping[Action];
            var promise = ridestyler.promise<Response>();

            ridestyler.ajax.send<Action>({
                action: action,
                data: data,
                callback: function (response) {
                    if (response.Success) promise.resolve(response);
                    else promise.reject(response);
                }
            });

            return promise;
        }

        export function getURL<Action extends ridestyler.RideStylerAPIEndpoint>(action:Action, data?:ridestyler.RidestylerAPIActionRequestMapping[Action]) : string {
            return ridestyler.ajax.url(action, data);
        }

        export enum Environment {
            Alpha,
            Beta,
            Live,
            Other
        }

        export let environment:Environment;
    }
}