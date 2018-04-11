namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-button-picker';
    const optionClass = className + '-option';
    const activeClass = optionClass + '-active';

    export class RideStylerShowcaseButtonPicker<T> extends ComponentBase {
        private optionContainer:HTMLElement;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options: RideStylerShowcaseButtonPicker.Settings) {
            super(showcaseInstance);

            this.component = HTMLHelper.createElement('div', {
                className: className,
                style: {
                    height: '2.5em'
                }
            });

            HTMLHelper.createElement('div', {
                className: className + '-title',
                text: options.title,
                appendTo: this.component
            }).addEventListener('click', () => {
                this.optionContainer.style.transform = this.optionContainer.style.transform == 'scaleY(0)' ? 'scaleY(1)' : 'scaleY(0)';
                this.optionContainer.style.height = this.optionContainer.style.height == '0px' ? 'auto' : '0px';
                this.component.style.height = this.component.style.height == '2.5em' ? '9.5em' : '2.5em';
            })

            this.optionContainer = HTMLHelper.createElement('div', {
                className: className + '-option-container',
                appendTo: this.component,
                style: {
                    height: '0px',
                    transform: 'scaleY(0)'
                }
            });

            this.optionContainer.addEventListener('click', event => this.onOptionClick(event));
        }

        public setOptions(options: RideStylerShowcaseButtonPicker.Option<T>[]) {
            HTMLHelper.empty(this.optionContainer);

            let fragment = document.createDocumentFragment();

            for (let option of options) {
                let optionElement:RideStylerShowcaseButtonPicker.OptionElement<T> = Object.assign(HTMLHelper.createElement('div', {
                    className: optionClass,
                    text: option.label
                }), {
                    value: option.value
                });

                if (option.active) optionElement.classList.add(activeClass);

                fragment.appendChild(optionElement);
            }

            this.optionContainer.appendChild(fragment);
        }

        private onOptionClick(event:MouseEvent) {
            let currentTarget:HTMLElement = event.target as HTMLElement;
            
            // Iterate through parents until we've reached the bound element
            while (currentTarget !== this.optionContainer) {
                if (currentTarget.classList.contains(optionClass)) {
                    // An option was clicked

                    // Remove the active class from the old option
                    for (let child of HTMLHelper.childrenWithClasses(this.optionContainer, activeClass))
                        child.classList.remove(activeClass);

                    // Add it to the new one
                    currentTarget.classList.add(activeClass);

                    if (typeof this.optionSelectedCallback === 'function')
                        this.optionSelectedCallback((currentTarget as RideStylerShowcaseButtonPicker.OptionElement<T>).value);

                    return;
                }

                currentTarget = currentTarget.parentElement;
            }
        }

        public optionSelectedCallback: (value:T) => void;
    }

    export namespace RideStylerShowcaseButtonPicker {
        export interface Settings {
            title: string;
        }

        export interface OptionElement<T> extends HTMLElement {
            value: T;
        }

        export interface Option<T> {
            label: string;
            value: T;
            active?: boolean;
        }
    }
}