//Template HTML
var vsm_template = '<div id="vsm_modal_base" class="vsm-modal vsm-hide vsm-fade" style="z-index: 9999;" tabindex="-1" role="dialog"> <div class="vsm-modal-container"> <div class="vsm-modal-header"> <button type="button" class="vsm-close"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAARVBMVEUAAACdnZ2ampqbm5ubm5uampqdnZ2ZmZmZmZmZmZmcnJyZmZmZmZmdnZ2ZmZmZmZmbm5uZmZmbm5ubm5uZmZmcnJybm5v/bA1VAAAAF3RSTlMAFL8yOr0Qz//tMvHLEs3zNO8wNuswLru4YpkAAADeSURBVHgBvdUFisQAEETRjrvL/W+6Em8+1PoWNpO8H5y2/1oQRhrESep8lhel9FVeN87nvqDP87ZxXhVxt4GsuT0K+K0Itv9hnrOA3xZuD/rBFcIXkZku6HVBrwt6XdDrgl4V8KOZLui5yRf0unj4md5YPPxiHAt6XdDrQntRzCsFC3i9sriDLv6a1wW9Luh1QS8L+mGWBf20yoLeTBf0sqDftogCnoX0opDebCxcIT2KKhZeFtHD94axCKV3H0zcyYJHUad2FvAocEbhUWTuUMOj2PxdhN6zCAP7p70CQy4hRTemab0AAAAASUVORK5CYII=" style="width:24px;"></button> </div><div class="vsm-modal-body vsm-option-body vsm-list-body"> <a href="javascript:void(0);" class="vsm-back-link vsm-back-step">< </a> <div class="vsm-in-progress"> <p class="vsm-header vsm-center"></p><div class="vsm-line-step center-piece vsm-columns"> </div><div class="vsm-list-container scrollable"><i class="vsm-loaderIcon" alt="Loading options"></i></div></div><div class="vsm-final"> <div class="center-piece vsm-line-step vehicle-result-wrap"> <i class="dot-style dot-before active"></i> <p class="vehicle-result-name"></p><p class="vehicle-result-size"></p></div><div class="scrollable"> <div class="center-piece vehicle-image-wrap"> <div style="position: relative; text-align: center; min-height: 120px;"> <i class="vsm-loaderIcon" alt="Loading an image of your vehicle"></i> <img src="" alt="" class="vehicle-display" style="display: none;"> </div><a href="javascript:void(0);" class="vsm-btn vsm-btn-gray vsm-full-width vsm-find">Find</a> </div></div></div></div></div></div>';
//Promise Polyfill
!function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);

function RideStylerVehicleSelectionModal(options) {
    var modalIDCounter = 0,
    infoArray = [];

    //Check if transition is supported, Boolean
    var transitionSupport = (function(){ 
        var thisBody = document.body || document.documentElement,
        thisStyle = thisBody.style,
        support = thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.OTransition !== undefined || thisStyle.transition !== undefined;
        
        return support; 
    })();

    // add onTransitionEndOnce to HTMLElement
    (function() {
        var i,
            el = document.createElement('div'),
            transitions = {
                'transition':'transitionend',
                'OTransition':'otransitionend',
                'MozTransition':'transitionend',
                'WebkitTransition':'webkitTransitionEnd'
            };

        var transitionEnd = '';
        for (i in transitions) {
            if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                transitionEnd = transitions[i];
                break;
            }
        }

        HTMLElement.prototype.onTransitionEndOnce = function(callback) {
            if (transitionEnd === '') {
                callback();
                return this;
            }
            var transitionEndWrap = function(e) {
                callback(); 
                e.target.removeEventListener(e.type, transitionEndWrap);
            };
            this.addEventListener(transitionEnd, transitionEndWrap, false);
            return this;
        };
    }());

    /**
     * Add certain class to elements
     * @private
     * @param  {Element|[Element]} elements - Element(s) to search
     * @param  {String}  myClass - Class name to add
     * @return void
     */
    function addClass(elements, myClass) {
        if (!elements) { return; }
        if (typeof(elements) === 'string') elements = document.querySelectorAll(elements);
        else if (elements.tagName) elements=[elements];
        // add class to all chosen elements
        for (var i=0; i<elements.length; i++) {
            if ( (' '+elements[i].className+' ').indexOf(' '+myClass+' ') < 0 ) {
                // add class
                elements[i].className += ' ' + myClass;
            }
        }
    }

    /**
     * Remove certain class from elements
     * @private
     * @param  {Element|[Element]} elements - Element(s) to search
     * @param  {String}  myClass - Class name to match against
     * @return void
     */
    function removeClass(elements, myClass) {
        if (!elements) { return; }
        if (typeof(elements) === 'string') elements = document.querySelectorAll(elements);
        else if (elements.tagName) elements=[elements];
        var reg = new RegExp('(^| )'+myClass+'($| )','g');
        // remove class from all chosen elements
        for (var i=0; i<elements.length; i++) {
            elements[i].className = elements[i].className.replace(reg,' ');
        }
    }

    /**
     * Get the closest matching element up the DOM tree.
     * @private
     * @param  {Element} element - Starting element
     * @param  {String}  selector Selector to match against
     * @return {Boolean|Element}  Returns null if no match found
     */
    var getClosest = function ( element, selector ) {
        // Element.matches() polyfill
        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                };
        }

        // Get closest match
        for ( ; element && element !== document; element = element.parentNode ) {
            if ( element.matches( selector ) ) return element;
        }

        return null;
    };

    var extend = function(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                out[key] = arguments[i][key];
            }
        }

        return out;
    };

    function createBackdrop() {
        var existingBackdrop = document.getElementById('vsm-backdrop');
        if (!existingBackdrop) {
            var backDrop = document.createElement('div');
            backDrop.id = 'vsm-backdrop';
            backDrop.style.opacity = 0;
            backDrop.style.transition = 'opacity linear .3s';
            document.body.appendChild(backDrop);

            showBackdrop();
        }
    }

    function showBackdrop() {
        var existingBackdrop = document.getElementById('vsm-backdrop');
        if (!existingBackdrop) {
            createBackdrop();
        }
        setTimeout(function(){
            existingBackdrop.style.opacity = 0.55
            existingBackdrop.onTransitionEndOnce(function(){});
        }, 0);
    }

    function hideBackdrop() {
        var existingBackdrop = document.getElementById('vsm-backdrop');
        if (existingBackdrop) {
            existingBackdrop.style.opacity = 0;
            existingBackdrop.onTransitionEndOnce(function(){
                existingBackdrop.parentNode.removeChild(existingBackdrop);
            });
        }
    }

    /*Load HTML code and append to body*/
    function loadBase() {
        var existingModal = document.getElementById('vsm_modal_base');
        if (!existingModal) {
            var divEle = document.createElement('div');
            divEle.innerHTML = vsm_template;
            document.body.appendChild(divEle.firstChild);
        }
    }

    /**
     * Generate and prepare modal screen
     * @private
     * @param  {Function} prepareFunction - The function to prepare the modal
     * @param  {Object} prepareFunctionOptions - Options to pass in
     * @param  {Object} transitionModal - The modal screen to transition to
     * @return {Element}  Returns the prepared modal
     */
    function base(prepareFunction, prepareFunctionOptions, transitionModal) {
        var modalBase = document.getElementById('vsm_modal_base');
        if (!modalBase) return undefined;
        //Make a copy of #vsm_modal_base
        var modalBaseCopy = modalBase.cloneNode(true);

        //Override id of modalBaseCopy and append to body
        modalBaseCopy.id = 'vsm_modal_' + modalIDCounter;
        modalBaseCopy.className += ' vsm_modal_' + modalIDCounter;
        document.body.appendChild(modalBaseCopy);

        //Setup transition
        if (typeof(transitionModal) !== 'undefined') {
            prepareFunctionOptions = extend({
                backModal: transitionModal,
                thisModal: modalBaseCopy
            }, prepareFunctionOptions);

            var backLinks = modalBaseCopy.querySelectorAll('.vsm-back-step');
            [].forEach.call(backLinks, function (backLink) {
                backLink.addEventListener('click', function(){
                    var bm = prepareFunctionOptions.backModal,
                    bc = prepareFunctionOptions.thisModal;
                    transitionToModal(bm, bc, true)
                    .then(
                        function(){
                            if (infoArray.length) infoArray.pop();
                            if (bc.parentNode) bc.parentNode.removeChild(bc);
                        }
                    )
                }, false);
            });
        }

        //Call the prepare function to initialize the new modal
        if (typeof prepareFunction === "function") prepareFunction(modalBaseCopy, prepareFunctionOptions);

        //bind click event to close the modal
        var closeButtons = modalBaseCopy.querySelectorAll('.vsm-close');
        [].forEach.call(closeButtons, function (closeButton) {
            closeButton.onclick = function(){
                var allModals = document.querySelectorAll('.vsm-modal:not(#vsm_modal_base)'),
                parentBase = getClosest(this, '.vsm-modal');
                infoArray = [];
                
                parentBase.style.opacity = 0;
                parentBase.onTransitionEndOnce(function(){
                    [].forEach.call(allModals, function (thisModal) {thisModal.parentNode.removeChild(thisModal);})
                });
                hideBackdrop();
            };
        });

        modalIDCounter++;

        return modalBaseCopy;
    }

    /**
     * Transition between modal
     * @private
     * @param  {Element} toModal - The modal to transition to
     * @param  {Element} fromModal - The current modal to transition from
     * @param  {Boolean} backwards - set to true, if transition from higher index to lower index
     * @return {Promise} - Returns the promise
     */
    var transitionToModal = function(toModal, fromModal, backwards) {
        backwards = !! backwards;

        if (!toModal || !fromModal)
            return;

        var fromAnimatePromise, toAnimatePromise;

        if (!backwards) {
            var fromZ = parseInt(fromModal.style.zIndex, 10) || 0,
                toZ = parseInt(toModal.style.zIndex, 10) || 0;
            if (toZ <= fromZ) toZ = fromZ + 1;
            toModal.style.zIndex = toZ;
        }

        if (transitionSupport) {
            if (backwards) {
                //toModal already has in class if it's backwards
                toModal.style.display = 'block';
                toAnimatePromise = new Promise(function(resolve, reject) {
                    resolve();
                });
                fromAnimatePromise = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        removeClass(fromModal, 'in');
                        fromModal.onTransitionEndOnce(function(){
                            fromModal.style.display = 'none';
                            resolve();
                        })
                    }, 50);
                });
            }
            else {
                toModal.style.display = 'block';
                toAnimatePromise = new Promise(function(toResolve, toReject) {
                    setTimeout(function() {
                        addClass(toModal, 'in');
                        toModal.onTransitionEndOnce(function(){
                            fromModal.style.display = 'none';
                            toResolve();
                            fromAnimatePromise = new Promise(function(fromResolve, fromReject) {
                                fromResolve();
                            })
                        })
                    }, 50);
                });
            }
        }
        else {
            if (backwards) {
                //toModal already has in class if it's backwards
                toModal.style.display = 'block';
                toAnimatePromise = new Promise(function(resolve, reject) {
                    resolve();
                });
                removeClass(fromModal, 'in');
                fromModal.style.display = 'none';
                fromAnimatePromise = new Promise(function(resolve, reject) {
                    resolve();
                });
            }
            else {
                toModal.style.display = 'block';
                toAnimatePromise = new Promise(function(resolve, reject) {
                    resolve();
                });
                addClass(toModal, 'in');
                fromModal.style.display = 'none';
                fromAnimatePromise = new Promise(function(resolve, reject) {
                    resolve();
                });
            }
        }

        return Promise.all([fromAnimatePromise, toAnimatePromise]).then(function(result) {
        }).catch(function(e){console.log(e)});
    }

    /**
     * Modal preparation: Process the vehicle select request
     * @private
     * @param  {Element} modal - The modal to prepare
     * @param  {Object} options - options to pass in, including the selections array
     * @return void
     */
    function requestStep(modal, options) {
        var selections = options ? options.selections : [];
        var request = {
            Selection: selections
        };

        ridestyler.ajax.send({
            action: 'Vehicle/Select',
            data: request,
            callback: function (response) {
                if (response.Success) {
                    if (response.BestConfiguration) {
                        showSelection(modal, response.BestConfiguration);
                    }
                    else {
                        updateModal(modal, selections, response.Menu);   
                    }
                }
            }
        });
    }

    /**
     * Modal preparation: Update modal content
     * @private
     * @param  {Element} modal - The modal to prepare
     * @param  {Array} selections - the selections array
     * @param  {Object} menu - Menu object to pass in for modal content update
     * @return void
     */
    function updateModal(modal, selections, menu) {
        var itemListContainer = modal.querySelectorAll('.vsm-list-container')[0],
        headerElement = modal.querySelectorAll('.vsm-header')[0],
        bodyElement = modal.querySelectorAll('.vsm-modal-body')[0],
        vsmLinkStyle = modal.querySelectorAll('.vsm-line-step')[0],
        finalScreen = modal.querySelectorAll('.vsm-final')[0],
        onListItemSelected = function(o){
            var optionValue = o.getAttribute('data-optionvalue');
            var optionKey = o.getAttribute('data-optionkey');
            var optionLabel = o.getAttribute('data-optionlabel');
            var newSelections = selections.slice(0);
            newSelections.push(optionKey + ':' + optionValue);
            infoArray.push(optionLabel);
            transitionToModal(
                base(requestStep, {selections: newSelections}, modal),
                modal
            );
        }
        //In progress, removing the final screen element from loaded modal
        finalScreen.parentNode.removeChild(finalScreen);
        addClass(vsmLinkStyle, 'vsm-single-step');

        //Create right-side progress bar
        var divELe = document.createElement('div'),
        dotEle = document.createElement('i'),
        spanEle = document.createElement('span');
        divELe.className = 'vsm-column-2';
        dotEle.className = 'dot-style dot-before active';
        spanEle.className = 'dot-info dot-info-before active';
        spanEle.innerHTML = menu.Title;
        divELe.appendChild(dotEle);
        divELe.appendChild(spanEle);

        //Create left-side progress info
        if (!selections.length) {
            var notStyleDiv = document.createElement('div');
            notStyleDiv.className = 'vsm-column-2 no-style';
            vsmLinkStyle.appendChild(notStyleDiv);
            vsmLinkStyle.appendChild(divELe);
        }
        else {
            addClass(bodyElement, 'vsm-has-back');
            var notStyleDiv = document.createElement('div'),
            cellEle = document.createElement('span'),
            infoEle = document.createElement('span');
            notStyleDiv.className = 'vsm-column-2 no-style vsm-table';
            cellEle.className = 'vsm-table-cell';
            infoEle.className = 'vsm-selected-info';
            cellEle.appendChild(infoEle);
            notStyleDiv.appendChild(cellEle);
            infoEle.innerHTML = infoArray.join(' ');
            vsmLinkStyle.appendChild(notStyleDiv);
            vsmLinkStyle.appendChild(divELe);

        }
        headerElement.innerHTML = menu.Description;

        var options = menu.Options,
        menuKey = menu.Key;
        //Clear the container
        while (itemListContainer.firstChild) {
            itemListContainer.removeChild(itemListContainer.firstChild);
        }

        if (options.length) {
            var groupWrap = document.createElement('div');
            groupWrap.className = 'vsm-group-wrap center-piece';
            itemListContainer.appendChild(groupWrap);

            /*Make list in group*/
            var groupList = document.createElement('div');
            groupList.className = 'vsm-group-list vsm-one-container';
            groupWrap.appendChild(groupList);

            for (var i = 0; i < options.length; i++) {
                var optionObj = options[i];
                var optionLabel = optionObj.Label,
                optionValue = optionObj.Value;
                if (typeof(optionLabel) === 'undefined' || typeof(optionValue) === 'undefined') continue;

                var optionBtn = document.createElement('a'),
                optionText = document.createTextNode(optionLabel);
                optionBtn.className = 'vsm-option-item vsm-btn vsm-btn-gray';
                optionBtn.href = 'javascript:void(0)';
                optionBtn.setAttribute('data-optionvalue', optionValue);
                optionBtn.setAttribute('data-optionkey', menuKey);
                optionBtn.setAttribute('data-optionlabel', optionLabel);
                optionBtn.appendChild(optionText);
                groupList.appendChild(optionBtn);

                optionBtn.onclick = function(){
                    onListItemSelected(this);
                };
            }
        }
    }

    /**
     * Modal preparation: Show final vehicle selection
     * @private
     * @param  {Element} modal - The modal to prepare
     * @param  {Object} bestConfiguration - bestConfiguration object to pass in for modal content update
     * @return void
     */
    function showSelection(modal, bestConfiguration) {
        var vehicleImage = modal.querySelectorAll('.vehicle-display')[0],
        vehicleLoader = modal.querySelectorAll('.vsm-final .vsm-loaderIcon')[0],
        nameElement = modal.querySelectorAll('.vehicle-result-name')[0],
        sizeElement = modal.querySelectorAll('.vehicle-result-size')[0],
        bodyElement = modal.querySelectorAll('.vsm-modal-body')[0],
        inProgressScreen = modal.querySelectorAll('.vsm-in-progress')[0];

        addClass(bodyElement, 'vsm-has-back');

        var copyOfArray = infoArray.slice(0);
        var mainPartString = copyOfArray[0],
        lastItem = copyOfArray.pop();

        for (var i = 1; i < copyOfArray.length; i++) {
            if (i >= 3) break;
            mainPartString += ' ' + copyOfArray[i];
        }

        nameElement.innerHTML = mainPartString + ' ' + lastItem;

        addClass(modal.querySelectorAll('.vsm-modal-body')[0], 'vsm-final-screen');
        inProgressScreen.parentNode.removeChild(inProgressScreen);

        var imageUrl = ridestyler.ajax.url("Vehicle/Render", {
            Width: 260,
            Height: 120,
            VehicleConfiguration: bestConfiguration.Value
        });

        vehicleImage.src = imageUrl;
        vehicleImage.style.display = 'inline-block';
        vehicleImage.onload = function(){
            vehicleLoader.style.display = 'none';
        }
    }

    this.Show = function (o) {
        loadBase();
        var modal = base();
        createBackdrop();
        modal.style.display = 'block';
        setTimeout(function(){
            if ((' '+modal.className+' ').indexOf(' in ') < 0) modal.className += ' in';
            modal.onTransitionEndOnce(function(){
                requestStep(modal);
            })
        }, 50);
    }
}
