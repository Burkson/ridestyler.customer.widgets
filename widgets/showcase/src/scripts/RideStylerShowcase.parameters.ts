namespace RideStylerShowcase.parameters {
    var keyValueStore = {};

    export class RideStylerShowcaseParameters {
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

        public popEventListener(context) {
            window.addEventListener('popstate', function(e) {
                context.state.extendData(e.state);
                context.activeWheelDiameterSelect();
                context.viewport.Update({
                    VehicleConfiguration: e.state.currentVehicleConfigurationID,
                    VehicleTireOption: e.state.currentVehicleTireOptionID,
                    WheelFitment: !e.state.currentWheelFitment ? null : e.state.currentWheelFitment.WheelFitmentID,
                    Suspension:   !e.state.currentSuspension? null : e.state.currentSuspension,
                    PaintColor:   !e.state.currentPaintScheme ? null : e.state.currentPaintScheme.Colors[0].Hex,
                });
            }.bind(this));
        };  
    };
};
