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
                matches: [],
                links: [],
                render: {},
                partLookup: {}
            }

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
                link.ele.className += ' ' + link.loadingClass;
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
                action: 'Vehicle/Search',
                data: searchRequest,
                callback: function (response) {
                    if (response.Success) {

                        // Store our configuration maps
                        for(var i = 0; i < response.Results.length; i++) {
                            var result = response.Results[i];
                            var index = parseInt(result.ID);

                            map.matches[index].models = result.Descriptions;
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
                showModal(models, partNumbers[0]);
            });
        } else {
            lnk.ele.className += ' rsqv-button-disabled';
        }

        // Make sure we restore visibility to the button
        lnk.ele.className = lnk.ele.className.replace(lnk.loadingClass, '');
    }

    function showModal(models, partNumber) {
        if (typeof models === 'string') models = [ models ];
        var modal = createModalElement(models, partNumber);

        document.body.appendChild(modal);

        // Small delay to trigger transition
        setTimeout(function() {
            modal.className += ' show';
        }, 10);
    }

    function createModalElement(models, partNumber) {
        var height = 0.416666667;
        var selectedModel = sessionStorage.getItem('last-vehicle-id') || models[0].ConfigurationID;
        var options = [];

        var wrapper = createElement('<div class="rsqv-modal-wrapper"></div>');
        wrapper.addEventListener('click', function() {
            if (wrapper.className.indexOf('show') !== -1) {
                wrapper.className = wrapper.className.replace(' show', '');

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

        var modelSelect = createElement('<select class="rsqv-model-selection"></div>');
        header.appendChild(modelSelect);

        var body = createElement('<div class="rsqv-modal-body"></div>');
        container.appendChild(body);

        var viewport = createElement('<div class="rsqv-modal-viewport"></div>');
        body.appendChild(viewport);

        var renderer = new RideStylerViewport(viewport, { containerAspectRatio: 0.42 });

        // Create our render window update routine
        function updateRenderWindow(id) {
            // Store our selected vehicle
            sessionStorage.setItem('last-vehicle-id', id);

            // Make sure the correct option is selected
            for(var i = 0; i < options.length; i++) {
                var option = options[i];
                if (option.value === id) {
                    option.setAttribute('selected', 'selected');
                } else {
                    option.removeAttribute('selected');
                }
            }

            // Update our renderer
            renderer.Update({
                PositionX: 1,
                PositionY: 2,
                VehicleConfiguration: id,
                WheelPartNumber: partNumber,
                ExcludeDiscontinuedWheels: true
            });
        }

        modelSelect.addEventListener("change", function() {
            updateRenderWindow(modelSelect.options[modelSelect.selectedIndex].value);
        });

        var foundVehicle = false;
        for(var i = 0; i < models.length; i++) {
            var m = models[i];
            var option = createElement('<option></option>');
            option.value = m.ConfigurationID;
            option.innerHTML = m.FullDescription;

            if (m.ConfigurationID == selectedModel) {
                option.setAttribute('selected', 'selected');
                foundVehicle = true;
            }

            modelSelect.appendChild(option);
            options.push(option);
        }

        console.log(models);

        // Handle the event that we had a different vehicle selected before
        if (foundVehicle === false) {
            selectedModel = models[0].ConfigurationID;
        }

        // Trigger a drawing for initial vehicle
        updateRenderWindow(selectedModel);

        return wrapper;
    }

    function createElement(html) {
        builder.innerHTML = html;
        return builder.firstChild; 
    }

    
}();