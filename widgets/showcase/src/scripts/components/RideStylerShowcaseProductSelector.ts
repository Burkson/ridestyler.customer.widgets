namespace RideStylerShowcase {
    export interface ProductElement<T> extends Node {
        product?: T;
    }
    export abstract class RideStylerShowcaseProductSelector<DataType,FilterType extends ridestyler.Requests.ActionRequestPagedModel> extends RideStylerShowcasePaginationComponent {
        protected currentFilters: FilterType;
        protected readonly defaultFilters: FilterType;

        protected readonly resultsPerLoad = 50;

        protected count:number = -1;
        protected index:number = 0;

        protected _loadMore() {
            this.isLoading = true;
            
            let countPromise:RideStylerPromise<number,ridestyler.RideStylerAPIResponse>;

            if (this.count > -1) {
                countPromise = PromiseHelper.resolved(this.count);
            } else {
                countPromise = this.countResults(this.currentFilters);
            }

            const resultsPerLoad = this.resultsPerLoad;

            return PromiseHelper.then(countPromise, productCount => {
                this.count = productCount;

                let filters:FilterType = ObjectHelper.assign({
                    Start: this.index,
                    Count: resultsPerLoad
                }, this.currentFilters) as FilterType;
                
                return this.getResults(filters).done(products => {
                    this.index += resultsPerLoad;
                    this.hasMoreResults = this.index < productCount;
                    this.createOptions(products);
                });
            }).always(() => {
                this.isLoading = false});
        }

        protected abstract countResults(filters: FilterType) : RideStylerPromise<number,ridestyler.RideStylerAPIResponse>;
        protected abstract getResults(filters: FilterType) : RideStylerPromise<DataType[],ridestyler.RideStylerAPIResponse>;

        /**
         * Set filters and reload
         * @param newFilters The new filters
         */
        public setFilters(newFilters: FilterType) {
            this.clearOptions();
            
            // Reset our count
            this.count = -1;

            // Reset our index
            this.index = 0;

            // Set our filters
            this.currentFilters = ObjectHelper.assign({}, this.currentFilters, newFilters);
            
            // Load first result set
            this.loadMore();
        }

        /**
         * Update filters and reload
         * @param filterUpdates The filter properties to update
         */
        public updateFilters(filterUpdates: FilterType) {
            this.setFilters(ObjectHelper.assign({}, this.currentFilters, filterUpdates));
        }

        /**
         * Returns false if the product should not be displayed in the list
         * @param product The product
         */
        protected abstract productFilter(product: DataType):boolean;
        /**
         * Returns a URL for the product or false-ish if there is not one
         * @param product The product
         */
        protected abstract productImageSource(product: DataType):string;
        protected abstract productImageLabels(product: DataType):{
            primary: string;
            secondary?: string;
            tertiary?: string;
        };

        private createOptions(products: DataType[]) {
            let fragment = document.createDocumentFragment();

            for (let product of products) {
                if (!this.productFilter(product)) continue;

                let option = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option',
                    appendTo: fragment
                }) as ProductElement<DataType>;

                option.product = product;

                // Image
                {
                    let imageSource = this.productImageSource(product);

                    if (imageSource) {
                        HTMLHelper.createElement('img', {
                            className: 'ridestyler-showcase-pagination-option-display',
                            appendTo: option,
                            properties: {
                                src: imageSource
                            }
                        });
                    }
                }

                let productImageLabels = this.productImageLabels(product);

                HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-pagination-option-label',
                    text: productImageLabels.primary,
                    appendTo: option
                });

                if (productImageLabels.secondary)
                    HTMLHelper.createElement('div', {
                        className: 'ridestyler-showcase-pagination-option-label-secondary',
                        text: productImageLabels.secondary,
                        appendTo: option
                    });

                if (productImageLabels.tertiary)
                    HTMLHelper.createElement('div', {
                        className: 'ridestyler-showcase-pagination-option-label-tertiary',
                        text: productImageLabels.tertiary,
                        appendTo: option
                    });
            }

            this.addOptionElements(fragment);
        }

        protected onOptionClick(optionElement:HTMLElement) {
            let product = (optionElement as ProductElement<DataType>).product;

            if (product) {
                super.onOptionClick(optionElement);

                this.onProductClick(product);
            }
        }

        public productSelectedCallback: (product:DataType)=>void;
        
        protected onProductClick(product:DataType) {
            if (typeof this.productSelectedCallback === 'function')
                this.productSelectedCallback(product);
        }
    }
}