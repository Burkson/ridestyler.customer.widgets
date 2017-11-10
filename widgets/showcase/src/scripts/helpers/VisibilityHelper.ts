namespace RideStylerShowcase.VisibilityHelper {
    const defaultTransitionInClass = 'in'

    export function show(element:HTMLElement, transitionClass:string = defaultTransitionInClass):RideStylerPromise {
        setVisibility(element, true);

        StyleHelper.triggerReflow(element);

        element.classList.add(transitionClass);

        let promise = ridestyler.promise();

        if (!StyleHelper.transitionsSupported) promise.resolve();
        else StyleHelper.onNextTransitionEnd(element, () => promise.resolve());

        return promise;
    }

    export function hide(element:HTMLElement, transitionClass:string = defaultTransitionInClass):RideStylerPromise {
        element.classList.remove(transitionClass);

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