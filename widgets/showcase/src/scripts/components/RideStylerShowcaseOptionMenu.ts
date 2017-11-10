namespace RideStylerShowcase {
    const optionMenuClass = 'ridestyler-showcase-option-menu';
    const optionMenuOptionClass = optionMenuClass + '-option';
    const optionMenuOptionActiveClass = optionMenuOptionClass + '-active';
    const optionMenuLoadingClass = optionMenuClass + '-loading';

    import Option = RideStylerShowcaseOptionMenu.Option;
    import OptionElement = RideStylerShowcaseOptionMenu.OptionElement;

    export class RideStylerShowcaseOptionMenu implements IComponent {
        component:HTMLElement;

        public readonly name:string;
        public value:any;
        
        constructor(name:string, options?: Option[]) {
            this.name = name;

            this.component = HTMLHelper.createElement({
                className: optionMenuClass
            });

            this.component.addEventListener('click', clickEvent => this.onClicked(clickEvent));

            if (options) this.setOptions(options);
            else this.setLoading(true);
        }

        public setLoading(loading:boolean) {
            this.component.classList.toggle(optionMenuLoadingClass, loading);
        }

        private generateOptionElement(option:Option):HTMLElement {
            let optionElement:OptionElement = HTMLHelper.createElement('div', {
                className: optionMenuOptionClass,
                text: option.label
            }) as OptionElement;

            optionElement.value = option.value;

            return optionElement;
        }

        private clearOptions() {
            HTMLHelper.empty(this.component);
        }

        private appendOptions(options: Option[]) {
            for (const option of options) {
                this.component.appendChild(this.generateOptionElement(option));
            }
        }

        public setOptions(options: Option[]) {
            this.clearOptions();
            this.appendOptions(options);
            this.setLoading(false);
        }

        public setValue(value: any) {
            for (let index = 0; index < this.component.children.length; index++) {
                const optionElement = this.component.children[index] as OptionElement;
                const active = optionElement.value === value;
                
                optionElement.classList.toggle(optionMenuOptionActiveClass, active);

                if (active) this.value = value;
            }
        }

        public onChange:(newValue:any)=>void;

        private onClicked(clickEvent: MouseEvent) {
            let target:HTMLElement = clickEvent.target as HTMLElement;

            if (!target.classList.contains(optionMenuOptionClass)) return; // The click was not on an option
            if (target.classList.contains(optionMenuOptionActiveClass)) return; // The click was on an active option

            let previouslySelectedOption:OptionElement = HTMLHelper.firstChildWithClass(this.component, optionMenuOptionActiveClass);
            let newSelectedOption:OptionElement = target as OptionElement;
            
            if (previouslySelectedOption) previouslySelectedOption.classList.remove(optionMenuOptionActiveClass);
            newSelectedOption.classList.add(optionMenuOptionActiveClass);

            this.value = newSelectedOption.value;

            if (typeof this.onChange === 'function') this.onChange(newSelectedOption.value);
        }
    }

    export namespace RideStylerShowcaseOptionMenu {
        export interface Option {
            label: string;
            value: any;
        }

        export interface OptionElement extends HTMLElement {
            value?: any;
        }
    }
}