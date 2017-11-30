namespace RideStylerShowcase {
    const barClass = 'ridestyler-showcase-tab-bar';
    const tabClass = barClass + '-tab';
    const tabBackgroundClass = tabClass + '-background';
    const activeTabClass = tabClass + '-active';
    const modeClass = barClass + '-';

    export class RideStylerShowcaseTabBar extends ComponentBase {
        protected initializeComponent() {
            this.component = HTMLHelper.createElement('div', {
                className: barClass
            });
            
            this.setMode('vertical');

            this.component.addEventListener("click", e => this.onClick(e));
        }

        private mode: 'vertical'|'horizontal';

        public tabSwitchedCallback: RideStylerShowcaseTabBar.TabSwitchedCallback;
        public tabs:RideStylerShowcaseTabBar.Tab[];
        public currentTab:RideStylerShowcaseTabBar.Tab;

        public setMode(mode: RideStylerShowcaseTabBar['mode']) {
            // Do nothing if the modes are the same
            if (this.mode === mode) return;

            const toggle = this.component.classList.toggle;

            // Remove the current mode class
            if (typeof this.mode === 'string') toggle(modeClass + this.mode, false);

            // Set the new mode
            this.mode = mode;

            // Add the current mode class
            toggle(modeClass + mode, true);
        }

        public setTabs(tabs:RideStylerShowcaseTabBar.TabCreateOptions[]);
        public setTabs(tabs:RideStylerShowcaseTabBar.Tab[]);
        public setTabs(tabsOrTabCreateOptions:RideStylerShowcaseTabBar.Tab[]|RideStylerShowcaseTabBar.TabCreateOptions[]) {
            let tabs:RideStylerShowcaseTabBar.Tab[];

            if (tabsOrTabCreateOptions.length === 0) {
                tabs = [];
            } else if (tabsOrTabCreateOptions[0] instanceof RideStylerShowcaseTabBar.Tab) {
                tabs = tabsOrTabCreateOptions as RideStylerShowcaseTabBar.Tab[];
            } else {
                tabs = new Array(tabsOrTabCreateOptions.length);

                for (var index = 0; index < tabsOrTabCreateOptions.length; index++) {
                    let createOptions = tabsOrTabCreateOptions[index] as RideStylerShowcaseTabBar.TabCreateOptions;
                    tabs[index] = new RideStylerShowcaseTabBar.Tab(createOptions);
                }
            }

            this.tabs = ArrayHelper.copy(tabs);

            HTMLHelper.empty(this.component);

            let tabPercent = (100/tabs.length) + '%';

            for (let tab of tabs) {
                if (this.mode === 'vertical') 
                    tab.element.style.height = tabPercent;
                else
                    tab.element.style.width = tabPercent;
                
                this.component.appendChild(tab.element);
            }

            this.currentTab = undefined;
            this.setActiveTab(tabs[0]);
        }

        public clearActiveTab() {
            this.setActiveTab(undefined);
        }

        public setActiveTab(newTab:RideStylerShowcaseTabBar.Tab) {
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

        private onTabClick(tab:RideStylerShowcaseTabBar.Tab) {
            if (!tab) return;

            this.setActiveTab(tab);
        }

        public tabForLabel(label:string):RideStylerShowcaseTabBar.Tab {
            for (let tab of this.tabs) {
                if (tab.label === label) {
                    return tab;
                }
            }

            return undefined;
        }

        public tabForElement(element:HTMLElement):RideStylerShowcaseTabBar.Tab {
            for (let tab of this.tabs) {
                if (tab.element === element) {
                    return tab;
                }
            }

            return undefined;
        }
    }
    
    export namespace RideStylerShowcaseTabBar {
        export interface TabSwitchedEvent {
            newTab:Tab;
            oldTab:Tab;
        }

        export interface TabSwitchedCallback {
            (this:RideStylerShowcaseTabBar, event:TabSwitchedEvent):void;
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