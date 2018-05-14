var rsqv = function() {

    var builder = document.createElement("div");

    return {
        bind: function(options) {

            // Setup a default empty option if they don't provide any options of their own
            options = options || {};

            var elements = document.querySelectorAll("[data-rsqv-wheel-pn]");
            var vehicleDescriptions = [];

            var map = {
                descriptions: [],
                paintOptions: [],
                matches: [],
                links: [],
                render: {},
                partLookup: {},
                options: {
                    defaultAngle: options.defaultAngle || 'side'
                }
            };

            for(var i = 0; i < elements.length; i++) {
                var e = elements[i];

                // Figure out a description for this element and lookup index
                var vehicleDesc = (e.getAttribute("data-rsqv-vehicle-desc") || options.vehicleDesc).toUpperCase();
                var vehicleIndex = map.descriptions.indexOf(vehicleDesc);

                // We haven't seen this description before so we add it to our lookup
                if (vehicleIndex === -1) {
                    vehicleIndex = map.descriptions.length;
                    map.descriptions.push(vehicleDesc);
                    map.matches.push({
                        models: null,
                        partNumbers: []
                    });
                }

                var link = {
                    ele: e,
                    index: vehicleIndex,
                    loadingClass: (options.buttonLoadingClass || 'rsqv-button-loading')
                }

                // Figure out how to reference our wheel
                var wheelPartNum = e.getAttribute("data-rsqv-wheel-pn");
                if (typeof wheelPartNum !== 'undefined') {
                    link.partNumbers = wheelPartNum.split(/[;,:|]/);

                    for(var x = 0; x < link.partNumbers.length; x++) {
                        var pn = link.partNumbers[x];
                        if (map.matches[vehicleIndex].partNumbers.indexOf(pn) === -1)
                            map.matches[vehicleIndex].partNumbers.push(pn);
                    }
                }

                map.links.push(link);

                // Hide our link elements while we perform loading
                addClass(link.ele, link.loadingClass);
            }

            // Generate our search payload to lookup vehicle descriptions
            var searchRequest = { Parameters: [], SearchOptions: 2 };
            for(var i = 0; i < map.descriptions.length; i++) {
                searchRequest.Parameters.push({
                    ID: i,
                    Search: map.descriptions[i]
                });
            }

            ridestyler.ajax.send({
                action: 'Organization/GetSettings',
                data: {
                    Keys: [
                        'ENABLE_SHARING',
                        'SUSPENSION_RANGES',
                        'RAWTIREDESC'
                    ]
                },
                callback: function(response) {

                    if (response.Success) {
                        map.settings = response.Settings;
                    }

                    ridestyler.ajax.send({
                        action: 'Vehicle/Search',
                        data: searchRequest,
                        callback: function (response) {
                            if (response.Success) {

                                // Store our configuration maps
                                for(var i = 0; i < response.Results.length; i++) {
                                    var result = response.Results[i];
                                    var index = parseInt(result.ID);          
                                    var descriptions = result.Descriptions;                          

                                    // Group our search results together based on unique images
                                    var group = {};
                                    for(var x = descriptions.length - 1; x >= 0; x--) {
                                        var desc = descriptions[x];
                                        group[desc.SideImage + '_' + desc.AngledImage] = desc;
                                    }

                                    // Convert our grouped images back into an array
                                    map.matches[index].models = [];
                                    for(var key in group) {
                                        map.matches[index].models.push(group[key]);
                                    }
                                }
        
                                // Load our default paint schemes (use the first match for simplicity)
                                ridestyler.ajax.send({
                                    action: 'Vehicle/GetPaintSchemeDescriptions',
                                    data: {
                                        VehicleConfiguration: map.matches[0].models[0].ConfigurationID
                                    },
                                    callback: function (response) {
                                        if (response.Success) {
                                            map.paintOptions = response.Schemes;
                                        }
        
                                        var batch = ridestyler.ajax.batch();
                                        for(var i = 0; i < map.matches.length; i++) {
                                            var match = map.matches[i];
                                            for(var x = 0; x < match.models.length; x++) {
                                                var model = match.models[x];
        
                                                batch.send(i + '_' + x, {
                                                    action: "Wheel/CanBeRendered",
                                                    data: {
                                                        VehicleConfiguration: model.ConfigurationID,
                                                        PartNumbers: match.partNumbers
                                                    }
                                                })
                                            }
                                        }
        
                                        batch.execute();
                                        batch.done(function(v) {
        
                                            for(var key in v) {
                                                var tokens = key.split('_');
                                                var match = map.matches[tokens[0]];
                                                var model = match.models[tokens[1]];
        
                                                var result = v[key];
                                                if (result.Success) {
                                                    for(var i = 0; i < match.partNumbers.length; i++) {
                                                        var pn = match.partNumbers[i];
                                                        var availability = result.PossibleTypes[pn];
                                                        availability.Available = (availability.Angled || availability.Side);
        
                                                        map.render[model.ConfigurationID + '_' + pn] = availability;
                                                    }
                                                }
                                            }
        
                                            // Hookup our links
                                            for(var i = 0; i < map.links.length; i++) {
                                                var lnk = map.links[i];
        
                                                setupLinkEvents(lnk, map);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });            
        }
    };

    function setupLinkEvents(lnk, map) {
        var partNumbers = lnk.partNumbers;
        var models = map.matches[lnk.index].models.slice();
        for(var i = models.length - 1; i >= 0; i--) {
            var key = models[i].ConfigurationID + '_' + partNumbers[0];
            var render = map.render[key];
            if (render.Available == false) {
                models.splice(i, 1);
            }
        }

        // Attach our click event to the button
        if (models.length > 0) {
            lnk.ele.addEventListener("click", function() {
                showModal(models, partNumbers[0], map);
            });
        } else {
            addClass(lnk.ele, 'rsqv-button-disabled');
        }

        // Make sure we restore visibility to the button
        removeClass(lnk.ele, lnk.loadingClass);
    }

    function showModal(models, partNumber, map) {
        if (typeof models === 'string') models = [ models ];
        var modal = createModalElement(models, partNumber, map);

        document.body.appendChild(modal);

        // Small delay to trigger transition
        setTimeout(function() {
            addClass(modal, 'show');
        }, 10);
    }

    function createModalElement(models, partNumber, map) {
        // Setup our variables for this modal instance
        var height = 0.416666667;
        var selectedModelId = sessionStorage.getItem('last-vehicle-id');
        var selectedModel = findModelForId(models, selectedModelId);
        if (selectedModel == null) selectedModelId = false;

        var selectedPaintOptionId = sessionStorage.getItem('last-paint-id') || null;
        var suspensionOffset = 0;
        var currentAngle = map.options.defaultAngle;

        if (selectedModelId) {
            suspensionOffset = sessionStorage.getItem('last-suspension-offset') || 0;
            currentAngle = sessionStorage.getItem('last-angle') || currentAngle;            
        } else {
            selectedModelId = models[0].ConfigurationID
            selectedModel = models[0];
        }
   
        // Create our modal context
        var context = {
            partNumber: partNumber,
            currentAngle: currentAngle,
            paintOptions: map.paintOptions,
            settings: map.settings,
            models: models,
            suspensionOffset: suspensionOffset,
            selectedModelId: selectedModelId,
            selectedModel : selectedModel,
            selectedPaintOptionId: selectedPaintOptionId,
            selectedPaintOption: findPaintForId(map.paintOptions, selectedPaintOptionId),
            anglesAvailable: map.render
        };

        // If we don't have a model selected then we need to select one
        if (context.selectedModel === null) {
            context.selectedModel = models[0];
            selectedModelId = models[0].ConfigurationID;
        }

        var wrapper = createElement('<div class="rsqv-modal-wrapper"></div>');
        wrapper.addEventListener('click', function() {
            if (wrapper.className.indexOf('show') !== -1) {
                removeClass(wrapper, 'show');

                // Give animations some time to complete
                setTimeout(function() {
                    document.body.removeChild(wrapper);
                }, 2000);
            }
        });

        var container = createElement('<div class="rsqv-modal-container"></div>');
        wrapper.appendChild(container);

        // Prevent bubbling on click events on the container
        container.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
        });

        var header = createElement('<div class="rsqv-modal-header"></div>');
        container.appendChild(header);

        var body = createElement('<div class="rsqv-modal-body"></div>');
        container.appendChild(body);

        context.container = container;
        context.header = header;
        context.body = body;

        var modelTag = createElement('<div class="rsqv-tag-button left"></div>');
        header.appendChild(modelTag);

        modelTag.innerHTML = 
            '<em>' + context.selectedModel.Year + ' ' + context.selectedModel.MakeName + ' ' + context.selectedModel.ModelName + '</em>' +
            '<strong>' + context.selectedModel.TrimName + '</strong>';

        // Create our visualizer controls
        header.appendChild(createControllerMenu(context));
        
        var viewport = createElement('<div class="rsqv-modal-viewport"></div>');
        body.appendChild(viewport);

        var messageContainer = createElement('<div class="rsqv-modal-disclaimer"></div>');
        body.appendChild(messageContainer);

        // If we have more than one model we need to create our selection button
        if (models.length > 1) {
            messageContainer.appendChild(createModelSelectionButton(body, context));
        }

        var renderer = new RideStylerViewport(viewport, { containerAspectRatio: 0.42 });

        // Create our vehicle helper functions
        context.refresh = function() {
            var available = context.anglesAvailable[context.selectedModelId + '_' + partNumber];

            var angle = context.currentAngle;
            if (context.currentAngle == 'side' && !available.Side)
                angle = 'angle';
            else if (context.currentAngle == 'angle' && !available.Angled)
                angle = 'side';

            var renderOptions = {
                PositionX: 1,
                PositionY: 2,
                Suspension: context.suspensionOffset,
                VehicleConfiguration: context.selectedModelId,
                WheelPartNumber: partNumber,
                ExcludeDiscontinuedWheels: true,
                Type: angle
            };

            if (context.selectedPaintOption)
                renderOptions.PaintColor = context.selectedPaintOption.Colors[0].Hex;

            // Update our renderer
            renderer.Update(renderOptions);
        };

        context.changeAngle = function(newAngle) {
            sessionStorage.setItem('last-angle', context.currentAngle = newAngle);
            context.refresh();
        }

        context.changeSuspensionOffset = function(offset) {
            sessionStorage.setItem('last-suspension-offset', context.suspensionOffset = offset);
            context.refresh();
        };

        context.changePaint = function(id) {
            // Store our selected vehicle
            sessionStorage.setItem('last-paint-id', context.selectedPaintOptionId = id);
            context.selectedPaintOption = findPaintForId(context.paintOptions, id);

            context.refresh();
        };

        context.changeVehicle = function(id) {
            // Store our selected vehicle
            sessionStorage.setItem('last-vehicle-id', context.selectedModelId = id);
            context.selectedModel = findModelForId(models, id);

            context.refresh();
        };

        // Trigger a drawing for initial vehicle
        context.changeVehicle(selectedModelId);

        return wrapper;
    }

    function createModelSelectionButton(body, context) {
        var link = createElement("<a href='#'>Not your vehicle? Click here to change trim options.</a>");
        

        link.addEventListener("click", function() {
            var overlay = createElement('<div class="rsqv-modal-overlay"></div>', body);
            var table = createElement('<table class="rsqv-trim-selection"></table>', overlay);
            var renderers = [];

            var row = null;
            for (var i = 0; i < 4; i++) {
                // Create a new row for every two elements
                if (i % 2 == 0) {
                    row = document.createElement('tr');
                    table.appendChild(row);
                }

                // Create our cell for this record
                var cell = document.createElement('td');
                row.appendChild(cell);

                if (i < context.models.length) {
                    var model = context.models[i];
                    var wrapper = createElement('<div class="rsqv-trim-wrapper"></div>', cell);
                    renderers.push(createRenderPreview(wrapper, model.ConfigurationID));
                    
                    // Fix our loop variable scope
                    (function(wrapper, model) {
                        wrapper.addEventListener('click', function() {
                            context.changeVehicle(model.ConfigurationID);
                            removeClass(overlay, 'show');
                            setTimeout(function() { overlay.parentElement.removeChild(overlay); }, 500);
                        });
                    })(wrapper, model);
                }
            }

            setTimeout(function() {
                addClass(overlay, 'show');
            }, 10);
        });
        
        return link;
    }

    function createRenderPreview(wrapper, id) {
        var renderer = new RideStylerViewport(wrapper, { responsive: false });

        setTimeout(function() {
            // Update our renderer
            renderer.Update({
                PositionX: 1,
                PositionY: 2,
                VehicleConfiguration: id
            });
        }, 10);

        return renderer;
    }

    function createControllerMenu(context) {
        var buttonContainer = createElement('<div class="rsqv-tag-button right"></div>');
        var controls = createElement('<div class="rsqv-control-wrapper"></div>');
        buttonContainer.appendChild(controls);

        controls.appendChild(createControllerMenuItem('Rotate', 'rsicon-rotate', false, function(menu) {
            context.changeAngle((context.currentAngle == 'side') ? 'angle' : 'side');
        }, context));

        controls.appendChild(createControllerMenuItem('Suspension', 'rsicon-suspension', function(menu) {
            var susRanges = context.settings['SUSPENSION_RANGES'];
            var min = -4;
            var max = 0;
            var current = parseInt(context.suspensionOffset);

            var suspensionKey = context.selectedModel.StyleType + context.selectedModel.DriveType;

            // Lookup our real ranges based on the current vehicle
            if (typeof susRanges !== 'undefined' && susRanges != null) { 
                if (typeof susRanges[suspensionKey] !== 'undefined') {
                    min = susRanges[suspensionKey].Min;
                    max = susRanges[suspensionKey].Max;
                } else if (typeof susRanges['Default'] !== 'undefined') {
                    min = susRanges['Default'].Min;
                    max = susRanges['Default'].Max;
                }
            }

            if (current < min) current = min;
            else if (current > max) current = max;

            var minus = createElement('<i class="rsicon-minus-circle"></i>', menu);
            var susOutput = createElement('<span class="rsqv-output">' + current +'</span>', menu);
            var plus = createElement('<i class="rsicon-plus-circle"></i>', menu);

            function validateButtons() {
                if (current <= min) addClass(minus, 'disabled');
                else removeClass(minus, 'disabled');

                if (current >= max) addClass(plus, 'disabled');
                else removeClass(plus, 'disabled');
            }

            function changeSuspension(newOffset) {
                if (newOffset < min || newOffset > max) return;
                context.changeSuspensionOffset(current = newOffset);
                validateButtons();

                susOutput.innerText = current;
            }

            validateButtons();
            
            plus.addEventListener('click', function() {
                changeSuspension(current + 1);
            });

            minus.addEventListener('click', function() {
                changeSuspension(current - 1);
            })
            
        }, context));

        controls.appendChild(createControllerMenuItem('Paint', 'rsicon-paint', function(menu) {
            for(var i = 0; i < context.paintOptions.length; i++) {
                (function(p) {
                    var swatch = createElement('<div class="rsqv-paint-swatch" style="background-color: ' + p.Colors[0].Hex + ';"></div>', menu);
                    swatch.addEventListener('click', function() {
                        context.changePaint(getPaintSchemeId(p));
                    });
                })(context.paintOptions[i]);
            }
        }, context));

        // Create our listener to close menus when the container is clicked somewhere else.
        context.container.addEventListener('click', function() {
            var activeMenus = document.querySelectorAll('.rsqv-control-menu.show');
            for(var i = 0; i < activeMenus.length; i++) {
                removeClass(activeMenus[i], 'show');
            }
        });

        return buttonContainer;
    }

    function createControllerMenuItem(title, icon, menuSetupCallback, clickCallback, context) {
        var control = createElement('<div class="rsqv-control"></div>');

        control.appendChild(createElement('<i class="' + icon + '"></i>'));
        control.appendChild(createElement('<div class="rsqv-title">' + title + '</div>'));

        // If this is false then we use a click event instead of 
        if (menuSetupCallback === false) {
            control.addEventListener('click', clickCallback);
        } else {
            context = clickCallback;

            // Create our drop down menu element
            var menu = createElement('<div class="rsqv-control-menu"></div>');
            var container = createElement('<div class="rsqv-menu-content"></div>', menu);
            menuSetupCallback(container, menu );

            control.addEventListener('click', function(e) {
                var controlBounds = control.getBoundingClientRect();
                var containerBounds = context.container.getBoundingClientRect();

                var padding = parseInt(window.getComputedStyle(control, null).getPropertyValue('padding-left'));

                var rightOffset = (containerBounds.right - controlBounds.right + control.clientWidth / 2 - padding / 2);

                menu.style.left = menu.style.right = rightOffset + 'px';
                menu.style.top = (controlBounds.top - containerBounds.top + control.offsetHeight + 17) + 'px';

                var shouldShow = !hideAllMenus(menu);
                if (shouldShow) addClass(menu, 'show');

                e.stopPropagation();
            });

            menu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            context.container.appendChild(menu);
        }

        return control;
    }

    function getPaintSchemeId(scheme) {
        var id = scheme.VehiclePaintSchemeID;
        if (id === "00000000-0000-0000-0000-000000000000") id = scheme.SchemeName;
        return id;
    }

    function findPaintForId(options, id) {
        for(var i = 0; i < options.length; i++) {
            if (options[i].VehiclePaintSchemeID == id || options[i].SchemeName == id) {
                return options[i];
            }
        }

        return null;
    }

    function findModelForId(models, modelId) {
        // Attempt to lookup our model
        for(var i = 0; i < models.length; i++) {
            if (models[i].ConfigurationID == modelId) {
                return models[i];
            }
        }

        return null;
    }

    function createElement(html, parent) {
        builder.innerHTML = html;

        var newNode = builder.firstChild;
        if (parent) parent.appendChild(newNode);
        return newNode; 
    }

    function addClass(ele, className) {
        if (ele.className.indexOf(className) === -1) {
            ele.className += ' ' + className;
        }
    }

    function removeClass(ele, className) {
        if (ele.className.indexOf(className) !== -1) {
            ele.className = ele.className.replace(className, '');
        }
    }

    function hideAllMenus(activeMenuSearch) {
        var foundActiveMenu = false;
        var visibleMenus = document.querySelectorAll('.rsqv-control-menu.show')
        for(var i = 0; i < visibleMenus.length; i++) {
            removeClass(visibleMenus[i], 'show');

            // If our menu is already visible we don't need to show it
            if (visibleMenus[i] === activeMenuSearch) foundActiveMenu = true;
        }

        return foundActiveMenu;
    }
}();