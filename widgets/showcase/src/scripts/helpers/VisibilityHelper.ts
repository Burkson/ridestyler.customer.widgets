namespace RideStylerShowcase.VisibilityHelper {
    export function show(element:HTMLElement):RideStylerPromise {
        setVisibility(element, true);
        element.classList.add('in');

        let promise = ridestyler.promise();

        if (!StyleHelper.transitionsSupported) promise.resolve();
        else StyleHelper.onNextTransitionEnd(element, () => promise.resolve());

        return promise;
    }

    export function hide(element:HTMLElement):RideStylerPromise {
        element.classList.remove('in');

        let promise = ridestyler.promise();

        promise.done(() => setVisibility(element, false));

        if (!StyleHelper.transitionsSupported) promise.resolve();
        else StyleHelper.onNextTransitionEnd(element, () => promise.resolve());

        return promise;
    }

    export function setVisibility(element:HTMLElement, visible: boolean) {
        if (!visible) {
            element.style.visibility = 'hidden';
            element.style.pointerEvents = 'none';
        } else {
            element.style.visibility = '';
            element.style.pointerEvents = '';
        }
    }
}