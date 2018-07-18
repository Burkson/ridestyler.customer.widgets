namespace RideStylerShowcase.parameters {
    export class RideStylerShowcaseParameters {
        //Retrieves the url and parses data
        public get() {
           let currentUrl = decodeURIComponent(location.search.substr(1));
           let splitUrl = [];
           currentUrl.split("&").forEach(innerArray => {
               splitUrl.push(innerArray.split("="));
           });

           return splitUrl.reduce(function(o, [k, v]) {return  (o[k]=v, o)}, {});
        };
        
        //Sets data to state, window.history and url 
        public set(stateData) {
            // Create an instance of our state for this specific history
            let historyState = Object.assign({}, stateData);

            // Update our URL fragments
            let vehicleFragments = {
                vc: stateData.currentVehicleConfigurationID,
                to: stateData.currentVehicleTireOptionID,
                wm: stateData.currentWheel ? stateData.currentWheel.WheelModelID : false,
                wf: stateData.currentWheelFitment ? stateData.currentWheelFitment.WheelFitmentID : false,
                p: stateData.currentPaintScheme ? stateData.currentPaintScheme.VehiclePaintSchemeID + '|' + stateData.currentPaintScheme.SchemeName : false,
                s: stateData.currentSuspension ? stateData.currentSuspension : false,
                tm: stateData.currentTire ? stateData.currentTire.TireModelID : false
            }

            vehicleFragments = JSON.parse(JSON.stringify(vehicleFragments));

            let url = '';
            for(var prop in vehicleFragments) {
                if (vehicleFragments[prop] == false) continue;
                url += (url.length == 0 ? '?' : '&') + prop + '=' + encodeURIComponent(vehicleFragments[prop]);
            }

            history.pushState(historyState, null, url);
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
