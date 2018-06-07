namespace RideStylerShowcase.parameters {
    var keyValueStore = {};

    export class RideStylerShowcaseParameters {

        //Retrieves the url and parses data
        public get() {
           let currentUrl = decodeURIComponent(location.search.substr(1));
           let splitUrl = [];
           currentUrl.split("&").forEach(innerArray => {
               splitUrl.push(innerArray.split("="));
           });

           keyValueStore = splitUrl.reduce(function(o, [k, v]) {return  (o[k]=v, o)}, {});
           
           history.pushState(keyValueStore, null, null)
           return keyValueStore;
        };
        
        //Sets data to state, window.history and url 
        public set(stateData) {
            let historyState = history.state;
            let newData = Object.assign(historyState, stateData);

            let vehicleFragments = {
                VehicleConfiguration: stateData.currentVehicleConfigurationID,
                TireOptionID: historyState.TireOptionID,
                TireOptionString: historyState.TireOptionString,
                TireModelID: !stateData.currentTire ? undefined : stateData.currentTire.TireModelID,
                WheelModel: stateData.currentWheel == undefined ? historyState.WheelModel : stateData.currentWheel.WheelModelID,
                WheelFitmentID: stateData.currentWheelFitment == undefined ? historyState.WheelFitmentID : stateData.currentWheelFitment.WheelFitmentID,
                Suspension:  (stateData.currentSuspension !== historyState.Suspension && stateData.currentSuspension === 0) ? historyState.Suspension : stateData.currentSuspension,
                PaintScheme: stateData.currentPaintScheme == undefined ? historyState.PaintScheme : stateData.currentPaintScheme.VehiclePaintSchemeID,
                PaintName: stateData.currentPaintScheme == undefined ? historyState.PaintName : stateData.currentPaintScheme.SchemeName,
            }

            vehicleFragments = JSON.parse(JSON.stringify(vehicleFragments));

            let url = "?" + Object.keys(vehicleFragments).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(vehicleFragments[k])
            }).join('&');

            history.pushState(newData, null, url);
        };

        //listens for (back / forward) events
        public popEventListener(context) {
            window.addEventListener('popstate', function(e) {
                let historyState = e.state;

                context.state.extendData(historyState);
                context.activeWheelDiameterSelect();
                context.viewport.Update({
                    VehicleConfiguration: historyState.currentVehicleConfigurationID,
                    VehicleTireOption: historyState.currentVehicleTireOptionID,
                    WheelFitment: !historyState.currentWheelFitment ? null : historyState.currentWheelFitment.WheelFitmentID,
                    Suspension: !historyState.currentSuspension? null : historyState.currentSuspension,
                    PaintColor: !historyState.currentPaintScheme ? null : historyState.currentPaintScheme.Colors[0].Hex,
                }); 
            });
        };  
    };
};
