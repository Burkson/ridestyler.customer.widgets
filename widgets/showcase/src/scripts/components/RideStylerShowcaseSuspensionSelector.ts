namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-suspension-selector';
    const elementClassName = 'ridestyler-showcase-suspension-selector-element';

    const defaultSuspensionRange = {
        Min: -4,
        Max: 0
    }

    export class RideStylerShowcaseSuspensionSelector extends ComponentBase {
        // private front:SuspensionUIElement;
        // private rear:SuspensionUIElement;
        private frontAndRear:SuspensionUIElement;

        protected initializeComponent() {
            this.component = HTMLHelper.createElement('div', {
                className: className
            });
            let stateData = this.state.getData();
            let vehicleDescription = stateData.currentVehicleDescriptionModel;
            let suspensionOptions:SuspensionOptions = {
                min: defaultSuspensionRange.Min,
                max: defaultSuspensionRange.Max,
                start: stateData.currentSuspension || 0,
                step: 1,
                decimalPlaces: 1,
                unitAbbreviation: '″'
            };

            // Retrieve suspension from API settings
            {
                let suspensionRanges = this.showcase.settingsFromAPI.SuspensionRanges;
                let {StyleType,DriveType} = vehicleDescription;
                let suspensionRangeKey = StyleType + DriveType;

                if (suspensionRangeKey in suspensionRanges === false) suspensionRangeKey = 'Default';
                let suspensionRange = suspensionRanges[suspensionRangeKey] || defaultSuspensionRange;
                
                suspensionOptions.min = suspensionRange.Min;
                suspensionOptions.max = suspensionRange.Max;
            }

            this.frontAndRear = new NoUISuspensionElement(this.showcase, ObjectHelper.assign({
                label: strings.getString('suspension')
            }, suspensionOptions));

            this.frontAndRear.suspensionChangedCallback = () => {
                if (typeof this.suspensionChangeCallback === 'function')
                    this.suspensionChangeCallback({
                        Suspension: this.frontAndRear.value
                    });
            };

            this.component.appendChild(this.frontAndRear.component);


            // let frontOptions:SuspensionUIElementOptions = ObjectHelper.assign({
            //     label: strings.getString('front')
            // }, suspensionOptions);

            // this.front = new NoUISuspensionElement(this.showcase, frontOptions);

            // let rearOptions:SuspensionUIElementOptions = ObjectHelper.assign({
            //     label: strings.getString('rear')
            // }, suspensionOptions);
            
            // this.rear = new NoUISuspensionElement(this.showcase, rearOptions);

            // this.component.appendChild(this.front.component);
            // this.component.appendChild(this.rear.component);

            // this.front.suspensionChangedCallback = this.rear.suspensionChangedCallback = () => {
            //     if (typeof this.suspensionChangeCallback === 'function') {
            //         this.suspensionChangeCallback({
            //             SuspensionFront: this.front.value,
            //             SuspensionRear: this.rear.value
            //         });
            //     }
            // };
        }
        
        public suspensionChangeCallback: (renderRequestChange:ridestyler.Requests.VehicleRenderInstructions) => void;
    }

    /**
     * A general interface for UI components that modify suspension
     */
    abstract class SuspensionUIElement extends ComponentBase {
        protected options:SuspensionUIElementOptions;
        
        public value:number;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options:SuspensionUIElementOptions) {
            super(showcaseInstance);
            this.options = options;
            this.value = options.start;
        }

        protected onSuspensionChanged(newValue:number) {
            this.value = newValue;

            this.state.extendData({
                currentSuspension: this.value
            })

            if (typeof this.suspensionChangedCallback === 'function') 
                this.suspensionChangedCallback(newValue);
        }

        public suspensionChangedCallback: (newSuspension:number) => void;
    }

    interface SuspensionOptions {
        min: number;
        max: number;
        start: number;
        step: number;
        decimalPlaces: number;
        unitAbbreviation: string;
    }

    interface SuspensionUIElementOptions extends SuspensionOptions {
        label: string;
    }

    class NoUISuspensionElement extends SuspensionUIElement {
        private readonly sliderElement:noUiSlider.Instance;
        private readonly slider:noUiSlider.noUiSlider;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options:SuspensionUIElementOptions) {
            super (showcaseInstance, options);

            this.component = HTMLHelper.createElement('div', {
                className: elementClassName,
                append: HTMLHelper.createElement('div', {
                    className: elementClassName + '-label',
                    text: options.label
                })
            });

            let sliderElement:HTMLElement = HTMLHelper.createElement('div', {
                className: elementClassName + '-slider',
                appendTo: this.component
            });

            noUiSlider.create(sliderElement, {
                start: options.start,
                range: {
                    min: options.min,
                    max: options.max
                },
                step: options.step,
                pips: {
                    mode: 'steps',
                    format: (function () {
                        let postfix:string = options.unitAbbreviation;
                        let decimalPlaces:number = options.decimalPlaces;

                        return {
                            to: (value:number) => value.toFixed(decimalPlaces) + postfix,
                            from: (value:string) => parseFloat(value.replace(new RegExp(StringHelper.escapeRegExp(postfix) + '$'), ""))
                        };
                    })()
                }
            });

            this.sliderElement = (sliderElement as noUiSlider.Instance);
            this.slider = this.sliderElement.noUiSlider;

            this.slider.on('update', (formattedValues, handle, values) => {
                this.onSuspensionChanged(values[0]);
            });
        }
    }
}