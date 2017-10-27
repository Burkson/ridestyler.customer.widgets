namespace RideStylerShowcase.api.auth {
    export function validate() {
        return api.request("auth/validate");
    }
}