namespace RideStylerShowcase {
    const prevButtonClass = 'ridestyler-showcase-pagination-prev';
    const nextButtonClass = 'ridestyler-showcase-pagination-next';
    const optionClass = 'ridestyler-showcase-pagination-option';
    const optionSelectedClass = optionClass + '-selected';
    const optionLoadingClass = optionClass + '-loading';
    const optionLoaderClass = optionClass + '-loader';

    export abstract class RideStylerShowcasePaginationComponent extends ComponentBase {
        protected optionContainer:HTMLElement;

        protected selectedOption:HTMLElement;

        protected prevButton:HTMLButtonElement;
        protected nextButton:HTMLButtonElement;

        protected hasMoreResults: boolean = true;
        protected isLoading: boolean = false;

        protected initializeComponent() {
            this.component = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-pagination'
            });
            this.optionContainer = HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-pagination-wrapper',
                appendTo: this.component
            });

            this.prevButton = HTMLHelper.createElement('button', {
                className: prevButtonClass,
                appendTo: this.component,
                append: HTMLHelper.createIcon('chevron-left')
            });
            
            this.nextButton = HTMLHelper.createElement('button', {
                className: nextButtonClass,
                appendTo: this.component,
                append: HTMLHelper.createIcon('chevron-right')
            });

            // Listen for clicks on options
            this.component.addEventListener('click', event => this.onComponentClick(event));

            // Our custom scroll event
            this.optionContainer.addEventListener('scroll', event => this.onScroll(event));

            // Run clear options to get the loader
            this.clearOptions();

            // Load pagination after this component has been setup
            setTimeout(() => this.loadMore(), 0);
        }

        /**
         * Load additional results
         */
        protected abstract _loadMore():RideStylerPromise;
        public loadMore():RideStylerPromise {
            return this._loadMore().always(() => {
                this.clearOptionLoader();
            });
        }

        private onScroll(event:UIEvent) {
            this.updatePaginationButtons();

            let optionContainer = this.optionContainer;
            const reachedEndTolerance = 10;
            
            if (optionContainer.scrollLeft >= optionContainer.scrollWidth - optionContainer.offsetWidth - reachedEndTolerance) {
                this.onEndVisible();
            }
        }

        protected onEndVisible() {
            if (!this.isLoading && this.hasMoreResults) {
                this.addOptionLoader();
                
                let optionContainer = this.optionContainer;
                this.optionContainer.scrollLeft = optionContainer.scrollWidth - optionContainer.clientWidth;

                this.loadMore();
            }
        }

        private onComponentClick(event:MouseEvent) {
            let currentTarget:HTMLElement = event.target as HTMLElement;
            
            // Iterate through parents until we've reached the bound element
            while (currentTarget !== this.component) {
                if (currentTarget.classList.contains(optionClass)) {
                    this.onOptionClick(currentTarget);
                    return;
                } else if (currentTarget === this.prevButton) {
                    this.previousPage();
                    return;
                } else if (currentTarget === this.nextButton) {
                    this.nextPage();
                    return;
                }

                currentTarget = currentTarget.parentElement;
            }
        }

        private updatePaginationButtons() {
            const optionContainer = this.optionContainer;

            this.prevButton.disabled = optionContainer.scrollLeft === 0;
            this.nextButton.disabled = optionContainer.scrollLeft === optionContainer.scrollWidth - optionContainer.clientWidth;
        }

        /**
         * Adds a spinner to the end of the list indicating something is loading
         */
        protected addOptionLoader() {
            this.optionContainer.appendChild(HTMLHelper.createElement('div', {
                className: optionClass + ' ' + optionLoaderClass
            }));
        }

        protected clearOptionLoader() {
            HTMLHelper.removeChildrenWithClasses(this.optionContainer, optionLoaderClass);
        }

        protected addOptionElements(elements:Node[]|Node) {
            if ('length' in elements) {
                for (let element of elements as Node[])
                    this.optionContainer.appendChild(element);
            } else {
                this.optionContainer.appendChild(elements as Node);
            }

            this.clearOptionLoader();
            this.update();
        }

        public clearOptions() {
            HTMLHelper.empty(this.optionContainer);
            this.addOptionLoader();
        }

        public update() {
            this.updatePaginationButtons();
        }

        public previousPage() {
            this.optionContainer.scrollLeft -= this.optionContainer.clientWidth;
        }

        public nextPage() {
            this.optionContainer.scrollLeft += this.optionContainer.clientWidth;
        }

        public selectOption(optionElement:HTMLElement) {
            if (this.selectedOption === optionElement) return; // Already selected

            let oldOptionElement = this.selectedOption;

            if (oldOptionElement)
                oldOptionElement.classList.remove(optionSelectedClass);
            
            optionElement.classList.add(optionSelectedClass);

            this.selectedOption = optionElement;
        }

        /**
         * Set or remove the loading class from the currently selected option
         * @param isLoading If true, add the loading class, otherwise remove it
         */
        public setOptionIsLoading(isLoading:boolean) {
            if (!this.selectedOption) return;

            this.selectedOption.classList[isLoading ? 'add' : 'remove'](optionLoadingClass);
        }

        /**
         * Called when an option element is clicked on.
         * @param optionElement The option element that was clicked on
         */
        protected onOptionClick(optionElement:HTMLElement) {
            this.selectOption(optionElement);
        }
    }
}