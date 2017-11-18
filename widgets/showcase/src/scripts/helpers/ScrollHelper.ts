namespace RideStylerShowcase.ScrollHelper {
    let scrollEvent:'wheel'|'mousewheel'|'MozMousePixelScroll';
    const mousewheelEventScale = -1/40;

    {
        const testElement = document.createElement('div');

        scrollEvent = 'onwheel' in testElement ? 'wheel' :                 // Modern browers support "wheel"
                      document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
                      'MozMousePixelScroll';                               // older Firefox
    }

    export function attachWheelListener(element:HTMLElement, listener:(event:NormalizedWheelEvent) => any) {
        if (scrollEvent === 'wheel') {
            element.addEventListener('wheel', (event:WheelEvent) => {
                const normalizedEvent:NormalizedWheelEvent = ObjectHelper.assign(event, {
                    originalEvent: event
                });

                return listener(normalizedEvent);
            });

            return;
        }

        element.addEventListener(scrollEvent, (event:WheelEvent) => {
            if (!event) event = window.event as WheelEvent;

            const normalizedEvent:NormalizedWheelEvent = {
                originalEvent: event,
                target: event.target || event.srcElement,
                type: 'wheel',
                deltaMode: event.type === 'MozMousePixelScroll' ? 0 : 1,
                deltaX: 0,
                deltaY: 0,
                deltaZ: 0,

                preventDefault: () => {
                    if (typeof event.preventDefault === 'function') event.preventDefault();
                    else {
                        event.returnValue = false;
                    }
                }
            };

            if (scrollEvent === 'mousewheel') {
                normalizedEvent.deltaY = mousewheelEventScale * event.wheelDelta;
                
                if (event.wheelDeltaX)
                    normalizedEvent.deltaX = mousewheelEventScale * event.wheelDeltaX;
            } else {
                normalizedEvent.deltaY = event.detail;
            }

            return listener(normalizedEvent);
        });
    }

    export interface NormalizedWheelEvent {
        originalEvent: WheelEvent;
        target: EventTarget;
        type: string;
        deltaMode: number;
        deltaX: number;
        deltaY: number;
        deltaZ: number;
        preventDefault(): void;
    }
}