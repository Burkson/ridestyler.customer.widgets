namespace RideStylerShowcase {
    const popoverClass = 'ridestyler-showcase-popover';
    const popoverInClass = 'in';

    export class RideStylerShowcasePopover {
        public component:HTMLElement;

        constructor() {
            this.component = HTMLHelper.createElement({
                className: popoverClass
            });
        }

        public show() {
            this.setVisible(true);
        }

        public hide() {
            this.setVisible(false);
        }

        public setVisible(visible:boolean) {
            this.component.classList.toggle(popoverInClass, visible);
        }

        public isVisible():boolean {
            return this.component.classList.contains(popoverInClass);
        }

        public toggle() {
            this.setVisible(this.isVisible() ? false : true);
        }
    }
}