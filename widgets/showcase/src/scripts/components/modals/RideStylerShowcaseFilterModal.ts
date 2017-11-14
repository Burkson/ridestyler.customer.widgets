namespace RideStylerShowcase {
    import FilterProvider = filters.FilterProvider;

    const filterModalClass = 'ridestyler-showcase-filter-modal';
    const filterModalMenuTitleClass = filterModalClass + '-menu-title';

    const countFormatToken = '{count}';

    export class RideStylerShowcaseFilterModal<FilterType extends object, FilterProviderType extends FilterProvider<FilterType>> extends RideStylerShowcaseModal {
        private readonly filterProvider: FilterProviderType;
        private menus: RideStylerShowcaseOptionMenu[];
        private readonly showCountTextFormat:string;

        private showButton:HTMLButtonElement;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options: RideStylerShowcaseFilterModal.Options<FilterProviderType>) {
            super(showcaseInstance, {
                removeOnHidden: true
            });

            this.filterProvider = options.filterProvider;
            this.showCountTextFormat = options.showCountTextFormat;

            this.component.classList.add(filterModalClass);

            this.buildFilterMenus().done(() => {
                this.updateCount();
            });
            
            this.buildShowButton();
        }

        private buildFilterMenus():RideStylerPromise {
            const menusContainer = HTMLHelper.createElement({
                className: filterModalClass + '-menus',
                appendTo: this.component
            });

            const filterProvider = this.filterProvider;
            const menuLoadedPromises = [];

            const currentFilters = filterProvider.getFilters();

            this.menus = [];

            for (const filterOption of filterProvider.filterOptions) {
                // Don't show non-visible filter options or filter options without labels
                if (!(filterOption.visible !== false && filterOption.label)) continue;
                
                let menu:RideStylerShowcaseOptionMenu = new RideStylerShowcaseOptionMenu(filterOption.key);

                const menuContainer = HTMLHelper.createElement({
                    className: filterModalClass + '-menu-container',
                    appendTo: menusContainer,
                    append: [
                        HTMLHelper.createElement({
                            className: filterModalMenuTitleClass,
                            text: filterOption.label
                        }),
                        menu.component
                    ]
                });

                let menuLoadedPromise = filterProvider.retrieveMenuOptions(filterOption)
                    .done(options => {
                        options.unshift({
                            label: filterOption.unselectedOptionLabel || strings.getString('all'),
                            value: undefined
                        });

                        menu.setOptions(options);
                        
                        if (typeof filterOption.getValueFromFilters === 'function')
                            menu.setValue(filterOption.getValueFromFilters(currentFilters));
                        else 
                            menu.setValue(undefined);
                    });

                menu.onChange = () => {
                    this.updateCount();
                }
                
                menuLoadedPromises.push(menuLoadedPromise);
                this.menus.push(menu);
            }

            return PromiseHelper.all(menuLoadedPromises);
        }

        private buildShowButton():void {
            this.showButton = HTMLHelper.createButton({
                large: true,
                disabled: true,
                text: strings.getString('loading-ellipsis'),
                appendTo: this.component
            });

            this.showButton.addEventListener('click', () => {
                this.filterProvider.setFilters(this.getValues());
                this.hide();
            });
        }

        private getValues():filters.FilterValue[] {
            let values: filters.FilterValue[] = [];

            for (const menu of this.menus) {
                values.push({
                    key: menu.name,
                    value: menu.value
                });
            }

            return values;
        }

        private getFilters():FilterType {
            return this.filterProvider.previewFilters(this.getValues());
        }

        private updateCount() {
            this.setCountText(false);

            this.filterProvider.getCount(this.getFilters()).done(count => {
                this.setCountText(count);
            });
        }

        /**
         * Set the count text to a loading state
         * @param count 
         */
        private setCountText(count:false);
        /**
         * Sets the count text
         * @param count The count to set
         */
        private setCountText(count:number);
        private setCountText(count:number|false) {
            if (count === false) {
                HTMLHelper.setText(this.showButton, strings.getString('loading-ellipsis'));
                this.showButton.disabled = true;
            } else {
                HTMLHelper.setText(this.showButton, this.showCountTextFormat.replace(countFormatToken, count.toString()));
                this.showButton.disabled = count === 0;
            }
        }
    }

    export namespace RideStylerShowcaseFilterModal {
        export interface Options<FilterProviderType> {
            filterProvider: FilterProviderType;
            showCountTextFormat: string;
        }
    }
}