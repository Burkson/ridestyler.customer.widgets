namespace RideStylerShowcase {
    import Option = RideStylerShowcaseToggleButton.Option;
    import OptionElement = RideStylerShowcaseToggleButton.OptionElement;
    import OptionChangedCallback = RideStylerShowcaseToggleButton.OptionChangedCallback;

    const toggleButtonClass = 'ridestyler-showcase-toggle-button';
    const optionClass = toggleButtonClass + '-option';
    const optionActiveClass = optionClass + '-active';
    export class RideStylerShowcaseToggleButton extends ComponentBase {
        /**
         * The current value of the toggle button
         */
        public value:string;

        /**
         * Attach a change function to call when the value is changed
         */
        public onChanged:OptionChangedCallback;

        /**
         * Create the DOM for the toggle button
         * 
         * @override
         */
        protected initializeComponent() {
            this.component = HTMLHelper.createElement({
                className: toggleButtonClass
            });

            this.component.addEventListener('click', clickEvent => this.onClicked(clickEvent));
        }

        /**
         * Called when the toggle button is clicked on
         */
        private onClicked(clickEvent:MouseEvent) {
            const target:HTMLElement = clickEvent.target as HTMLElement;
            
            if (!target.classList.contains(optionClass)) return; // The click was not on an option
            if (target.classList.contains(optionActiveClass)) return; // The click was on an active option

            this.selectOptionElement(target as OptionElement);
        }

        private selectOptionElement(optionElement:OptionElement, triggerChange:boolean = true) {
            const newValue:string = optionElement.value;

            if (this.value === newValue) return;

            this.value = newValue;

            for (let childIndex = 0; childIndex < this.component.children.length; childIndex++) {
                const childOptionElement:OptionElement = this.component.children[childIndex] as OptionElement;
                childOptionElement.classList.toggle(optionActiveClass, childOptionElement === optionElement);
            }

            if (typeof this.onChanged === 'function' && triggerChange) this.onChanged(newValue);
        }

        public setValue(value:string) {
            if (this.value === value) return;

            for (let childIndex = 0; childIndex < this.component.children.length; childIndex++) {
                const childOptionElement:OptionElement = this.component.children[childIndex] as OptionElement;
                
                if (childOptionElement.value === value) {
                    this.selectOptionElement(childOptionElement);
                    return;
                }
            }
        }

        public setOptions(options:Option[]) {
            HTMLHelper.empty(this.component);
            this.value = undefined;

            for (const option of options) {
                this.addOption(option);
            }
        }

        public addOption(option:Option) {
            const optionElement:OptionElement = ObjectHelper.assign(HTMLHelper.createElement('span', {
                className: optionClass,
                text: option.label,
                appendTo: this.component
            }), {
                value: option.value
            });

            if (this.value === undefined) this.selectOptionElement(optionElement, false);
        }
    }

    export namespace RideStylerShowcaseToggleButton {
        export interface OptionElement extends HTMLElement {
            value: string;
        }

        export interface OptionChangedCallback {
            (value:string):void;
        }

        export interface Option {
            label:string;
            value:string;
        }
    }
}