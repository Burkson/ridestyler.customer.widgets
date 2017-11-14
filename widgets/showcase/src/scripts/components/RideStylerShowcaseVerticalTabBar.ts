namespace RideStylerShowcase {
    const barClass = 'ridestyler-showcase-vertical-tab-bar';
    const tabClass = 'ridestyler-showcase-vertical-tab-bar-tab';
    const tabBackgroundClass = tabClass + '-background';
    const activeTabClass = tabClass + '-active';

    export class RideStylerShowcaseVerticalTabBar extends ComponentBase {
        protected initializeComponent() {
            this.component = HTMLHelper.createElement('div', {
                className: barClass
            });

            this.component.addEventListener("click", e => this.onClick(e));
        }

        public tabSwitchedCallback: RideStylerShowcaseVerticalTabBar.TabSwitchedCallback;
        public tabs:RideStylerShowcaseVerticalTabBar.Tab[];
        public currentTab:RideStylerShowcaseVerticalTabBar.Tab;

        public setTabs(tabs:RideStylerShowcaseVerticalTabBar.TabCreateOptions[]);
        public setTabs(tabs:RideStylerShowcaseVerticalTabBar.Tab[]);
        public setTabs(tabsOrTabCreateOptions:RideStylerShowcaseVerticalTabBar.Tab[]|RideStylerShowcaseVerticalTabBar.TabCreateOptions[]) {
            let tabs:RideStylerShowcaseVerticalTabBar.Tab[];

            if (tabsOrTabCreateOptions.length === 0) {
                tabs = [];
            } else if (tabsOrTabCreateOptions[0] instanceof RideStylerShowcaseVerticalTabBar.Tab) {
                tabs = tabsOrTabCreateOptions as RideStylerShowcaseVerticalTabBar.Tab[];
            } else {
                tabs = new Array(tabsOrTabCreateOptions.length);

                for (var index = 0; index < tabsOrTabCreateOptions.length; index++) {
                    let createOptions = tabsOrTabCreateOptions[index] as RideStylerShowcaseVerticalTabBar.TabCreateOptions;
                    tabs[index] = new RideStylerShowcaseVerticalTabBar.Tab(createOptions);
                }
            }

            this.tabs = ArrayHelper.copy(tabs);

            HTMLHelper.empty(this.component);

            let tabHeightPercent = 100/tabs.length;

            for (let tab of tabs) {
                tab.element.style.height = tabHeightPercent + '%';
                this.component.appendChild(tab.element);
            }

            this.currentTab = undefined;
            this.setActiveTab(tabs[0]);
        }

        public clearActiveTab() {
            this.setActiveTab(undefined);
        }

        public setActiveTab(newTab:RideStylerShowcaseVerticalTabBar.Tab) {
            let oldTab = this.currentTab;

            if (oldTab === newTab) return;

            this.currentTab = newTab;

            // Switch the active class
            {
                if (oldTab)
                    oldTab.element.classList.remove(activeTabClass);
                
                if (newTab)
                    newTab.element.classList.add(activeTabClass);
            }

            // Send off the callback
            if (newTab && typeof this.tabSwitchedCallback === 'function')
                this.tabSwitchedCallback({
                    oldTab: oldTab,
                    newTab: newTab
                });
        }

        private onClick(e:MouseEvent) {
            let clickTarget:HTMLElement = e.target as HTMLElement;
            let currentElement:HTMLElement = clickTarget;
            
            // Go up through the parent elements until we reach the tab bar
            while (currentElement !== this.component) {
                // If the current element is a tab
                if (currentElement.classList.contains(tabClass)) {
                    this.onTabClick(this.tabForElement(currentElement));
                    return;
                }

                currentElement = currentElement.parentElement;
            }
        }

        private onTabClick(tab:RideStylerShowcaseVerticalTabBar.Tab) {
            if (!tab) return;

            this.setActiveTab(tab);
        }

        public tabForLabel(label:string):RideStylerShowcaseVerticalTabBar.Tab {
            for (let tab of this.tabs) {
                if (tab.label === label) {
                    return tab;
                }
            }

            return undefined;
        }

        public tabForElement(element:HTMLElement):RideStylerShowcaseVerticalTabBar.Tab {
            for (let tab of this.tabs) {
                if (tab.element === element) {
                    return tab;
                }
            }

            return undefined;
        }
    }
    
    export namespace RideStylerShowcaseVerticalTabBar {
        export interface TabSwitchedEvent {
            newTab:Tab;
            oldTab:Tab;
        }

        export interface TabSwitchedCallback {
            (this:RideStylerShowcaseVerticalTabBar, event:TabSwitchedEvent):void;
        }

        export interface TabCreateOptions {
            icon:string;
            label:string;
            key:string;
        }

        export class Tab {
            public readonly iconClass:string;
            public readonly label:string;
            public readonly element:HTMLElement;
            public readonly key:string;

            constructor(createOptions:TabCreateOptions) {
                this.label = createOptions.label;
                this.iconClass = createOptions.icon;
                this.element = Tab.create(createOptions);
                this.key = createOptions.key;
            }

            private static create(createOptions:TabCreateOptions):HTMLElement {
                let element = HTMLHelper.createElement('div', {
                    className: tabClass
                });

                let icon = HTMLHelper.createIcon({
                    icon: createOptions.icon,
                    appendTo: element,
                    wrap: HTMLHelper.createElementWithClass('div', tabClass + '-icon')
                });

                element.appendChild(Tab.createBackground());

                element.title = createOptions.label;

                return element;
            }

            private static createBackground():HTMLElement {
                let background = HTMLHelper.createElementWithClass('div', tabBackgroundClass);
                
                if (StyleHelper.svgSupported) {
                    /**
                     * The height in percentage of the triangle size
                     */
                    const triangleHeight = 30;
                    /**
                     * The width in percentage of the triangle size
                     */
                    const triangleWidth = 15;

                    HTMLHelper.createSVGElement('svg', {
                        attributes: {
                            width: '100%',
                            height: '100%',
                            preserveAspectRatio: 'none',
                            viewBox: '0 0 100 100'
                        },
                        append: HTMLHelper.createSVGElement('polygon', {
                            attributes: {
                                fill: 'black',
                                points: `0,0 100,0 100,${50-triangleHeight/2} ${100-triangleWidth},50 100,${50+triangleHeight/2} 100,100 0,100`
                            }
                        }),
                        appendTo: background
                    });
                } else {
                    background.classList.add(tabBackgroundClass + '-nosvg');
                }


                return background;
            }
        }
    }
}