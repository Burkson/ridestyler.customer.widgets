namespace RideStylerShowcase {
    export abstract class MainComponentBase extends ComponentBase {
        component: HTMLElement;

        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance);

            this.component = document.createElement('div');
            this.component.classList.add('ridestyler-showcase-main-component');

            if (StyleHelper.transitionsSupported)
                this.component.addEventListener(StyleHelper.transitionEndEvent, e => {
                    // Only transitions on this component element
                    if (e.target !== this.component) return;

                    this.onTransitionEnd();
                });

            this.setVisible(false);
            this.buildComponent(this.component);
            
            this.initializeMainComponent();
        }

        /**
         * A overridable function called after the base component is constructed
         * @virtual
         */
        protected initializeComponent() {
            let currentUrl = decodeURIComponent(location.search.substr(1));
            let splitUrl = [];
            let dataObject = undefined;
            let actionString = '';

            if (currentUrl.length !== 1) {
                let urlArray = currentUrl.split("&")
                urlArray.forEach(innerArray => {
                  splitUrl.push(innerArray.split("="));
                })
                
                actionString = 'Vehicle/Render';
                dataObject = splitUrl.reduce(function(object, [key, value]) {return  (object[key]=value, object)}, {});
                
                let url = ridestyler.ajax.url(actionString, dataObject);
            }

        }

        /**
         * A overridable function called after the main component is constructed
         * @virtual
         */
        protected initializeMainComponent() {}

        private _visible: boolean;
        private _animating: boolean;

        /**
         * @param container The container to build the component in
         */

        protected abstract buildComponent(container:HTMLElement);

        /**
         * Whether or not this component is visible
         * @return true, if this component is visible, otherwise false
         */
        isVisible(): boolean {
            return this._visible;
        }

        /**
         * Hide/show the component without animation
         * @param visible If true, show the component, otherwise hide the component
         */
        setVisible(visible:boolean) {
            if (this._visible === visible) return;

            this._visible = visible;
            this.setVisibleStyling(visible)

            StyleHelper.skipTransition(this.component, () => visible ? this.show() : this.hide());
        }

        private setVisibleStyling(visible:boolean) {
            let styles = this.component.style;

            if (visible) {
                styles.visibility = 'visible';
                styles.top = '';
            } else {
                styles.visibility = 'hidden';
                styles.top = '1000%';
            }
        }

        private callWhenDoneAnimating(callback:(this:this)=>void) {
            // Call the callback after the view has been animated in 
            if (this._animating) StyleHelper.onNextTransitionEnd(this.component, () => callback.call(this));
            else callback.call(this);
        }

        /**
         * Called before this component is shown
         * @virtual
         */
        protected onShow() {}
        /**
         * Called before this component is shown but after it has received dimensions
         */
        protected onDisplay() {}
        /**
         * Called after the component is shown
         * @virtual
         */
        protected onShown(){}
        /**
         * Called before the component is hidden
         * @virtual
         */
        protected onHide() {}
        /**
         * Called after the component is hidden
         * @virtual
         */
        protected onHidden() {}

        /**
         * Animate the component into the view
         */
        show(callback?:(this:this)=>void) {
            if (this.component.classList.contains('in')) {
                // The component is already visible, trigger the callback as needed
                this._visible = true;

                if (typeof callback === 'function') {
                    this.callWhenDoneAnimating(callback);
                }

                return;
            }

            if (this._animating) {
                // This view is animating out, show it after it's done
                StyleHelper.onNextTransitionEnd(this.component, () => this.show(callback));
                return;
            }

            this._visible = true;
            this._animating = StyleHelper.transitionsSupported;


            this.onShow();
            
            this.setVisibleStyling(true);

            StyleHelper.triggerReflow(this.component);

            this.onDisplay();

            this.callWhenDoneAnimating(function () {
                this.onShown();

                if (typeof callback === 'function')
                    callback.call(this);
            });

            this.component.classList.add('in');
        }
        
        /**
         * Animate the component out of the view
         */
        hide(callback?:(this:this)=>void) {
            if (!this.component.classList.contains('in')) {
                // Already hidden
                this._visible = false;

                if (typeof callback === 'function') {
                    this.callWhenDoneAnimating(callback);
                }

                return;
            }

            if (this._animating) {
                // This view is animating in, show it after it's done
                StyleHelper.onNextTransitionEnd(this.component, () => this.hide(callback));
                return;
            }

            this._visible = false;
            this._animating = StyleHelper.transitionsSupported;
            
            this.onHide();

            this.callWhenDoneAnimating(function () {
                this.onHidden();

                if (typeof callback === 'function')
                    callback.call(this);
            });

            this.component.classList.remove('in');

            if (!StyleHelper.transitionsSupported)
                this.setVisibleStyling(false);
        }

        /**
         * Hide components after transition out
         */
        onTransitionEnd() {
            if (!this.component.classList.contains('in'))
                this.setVisibleStyling(false);

            this._animating = false;
        }
    }
}