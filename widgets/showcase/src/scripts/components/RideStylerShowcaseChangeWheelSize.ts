namespace RideStylerShowcase {
    import WheelFitmentDescriptionModel = ridestyler.Descriptions.WheelFitmentDescriptionModel;
    export class RideStylerShowcaseChangeWheelSize extends RideStylerShowcaseButtonPicker<WheelFitmentDescriptionModel> {
        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance, {
                title: strings.getString('change-wheel-size')
            });

            this.component.classList.add('ridestyler-showcase-change-wheel-size');
        }

        public setFitmentOptions(fitments:WheelFitmentDescriptionModel[], activeFitment?:WheelFitmentDescriptionModel) {
            let seenDiameters = {};
            let diameterFitments:[number,WheelFitmentDescriptionModel][] = [];

            for (let fitment of fitments) {
                let diameter = fitment.DiameterMin;

                if (diameter in seenDiameters === false) {
                    seenDiameters[diameter] = true;

                    diameterFitments.push([diameter, fitment]);
                }
            }

            diameterFitments.sort(function (a, b) {
                return a[0] - b[0];
            });

            if (diameterFitments.length === 1) {
                this.component.style.display = 'none';
            }

            this.setOptions(ArrayHelper.map(diameterFitments, diameterFitment => {
                return {
                    label: diameterFitment[0] + '″',
                    value: diameterFitment[1],
                    active: diameterFitment[1] === activeFitment
                };
            }));
        }
    }
}