<template>
    <div>
        <template v-if="vehicles.length === 0">
            Select a vehicle to map fitments
        </template>
        <template v-else>
            <header class="tool-bar">
                <div style="width: 100%">
                    <span
                        v-if="unsavedChangeCount > 0"
                        class="text-warning"
                    >
                        <icon icon="exclamation-triangle"></icon>

                        <template v-if="unsavedChangeCount === 1">
                            1 Unsaved Change
                        </template>
                        <template v-else>
                            {{unsavedChangeCount}} Unsaved Changes
                        </template>
                    </span>
                </div>
                <div class="text-right">
                    <button
                        v-if="!readonly"
                        @click="isAdding = true"
                    >
                        <icon icon="plus"></icon>
                    </button>
                </div>
            </header>

            <fitment-selector
                @selection="selectedFitments => $emit('selection', selectedFitments)"
                @update:unsavedChangeCount="newCount => unsavedChangeCount = newCount"
                @update:hasUserChanges="newHasUserChanges => hasUserChanges = newHasUserChanges"
                :vehicles="vehicles"
                :readonly="readonly"
                :additional-fitments="additionalFitments"
                auto-select-all
                load-initially
            />

            <modal
                id="add-fitment-modal"
                v-if="isAdding"

                @close="isAdding = false"
            >
                <button
                    class="unstyled close"
                    @click="isAdding = false"
                >
                    <icon icon="times" />
                </button>

                <div class="tool-bar">
                    <form
                        class="input-group"
                        @submit.prevent="performSearch"
                    >
                        <input
                            type="search"
                            placeholder="Search for a fitment to add..."
                            autofocus
                            v-model="search"
                            @paste="onAddInputPaste"
                        >

                        <div class="input-group-addon" v-if="searchPartNumberCount > 0" style="padding: 0 10px;">
                            Found {{matchedFitmentCount}} of {{searchPartNumberCount}} PNs
                        </div>

                        <div class="input-group-addon">
                            <button type="submit">
                                <icon icon="search" />
                            </button>

                            <button
                                class="success"
                                type="button"
                                :disabled="fitmentsToAdd.length === 0"
                                @click="addFitment"
                            >
                                <icon icon="plus" />
                            </button>
                        </div>
                    </form>

                    <form class="filter-bar" @submit.prevent="performSearch">
                        <label v-for="filter in addFitmentFilters" :key="filter.key">
                            {{ filter.name }} 
                            <input v-if="filter.type === 'text'" class="inline" type="text" :name="filter.key" v-model="filter.value">
                            <select v-else-if="filter.type === 'select'" class="inline" :name="filter.key" v-model="filter.value" :disabled="filter.loading">
                                <option v-if="filter.loading">Loading...</option>

                                <template v-else>
                                    <option value="">None</option>
                                    <option disabled>─────────────</option>
                                    <option v-for="option in filter.options" :value="option.value" v-text="option.name" :key="option.value"></option>
                                </template>
                            </select>
                        </label>

                        <div class="right-buttons">
                            <button class="secondary" type="button" @click="copyFitmentValuesToAddFitment" :disabled="fitmentProfileLoading">
                                <icon :icon="fitmentProfileLoading ? 'compact-disc' : 'car'" :spin="fitmentProfileLoading"></icon>
                            </button>

                            <button class="secondary" type="submit">
                                <icon icon="filter"></icon>
                            </button>
                        </div>
                    </form>
                </div>

                <fitment-selector
                    id="add-fitment-selector"
                    :filters="addFitmentRequest"
                    @selection="fitments => fitmentsToAdd = fitments"
                    @update:numberOfRows="rowCount => matchedFitmentCount = rowCount"
                />
            </modal>
        </template>
    </div>
</template>

<script>
import FitmentSelector from './FitmentSelector'
import Modal from './Modal'

const partNumberSearchExpression = /Part ?Numbers\s*:?\s*(.*,?)+/i;

/**
 * @typedef AddFitmentFilter
 * @prop {string} key
 * @prop {string} name
 * @prop {'text'|'select'} type
 * @prop {(value:string, filters:ridestyler.Requests.WheelFilterModel)=>void} apply
 * @prop {()=>Promise<AddFitmentFilterOption[]>} [getOptions]
 */
/**
 * @typedef AddFitmentFilterOption
 * @prop {string} name
 * @prop {string} value
 */

const rangeMatchExpression = /^\s*\+?(-?[0-9.]+)\s*[a-z-]*\s*\+?(-?[0-9.]+)?\s*[a-z]*$/i;
const fitmentFilterGroupKey = 'fitment-filters';

/**
 * @param {string} string
 * @returns {[number, number]}
 */
function getRange(string) {
    const match = string && string.match(rangeMatchExpression);

    return match ? match.slice(1) : [];
}

/**
 * @param {ridestyler.Requests.WheelFilterModel} filters
 */
function getFitmentFilter(filters) {
    let fitmentFilter = filters.FitmentFilters && filters.FitmentFilters.find(ff => ff.GroupKey === fitmentFilterGroupKey);

    if (!fitmentFilter) {
        fitmentFilter = {
            GroupKey: fitmentFilterGroupKey
        };

        if (!filters.FitmentFilters) filters.FitmentFilters = [];

        filters.FitmentFilters.push(fitmentFilter);
    }

    return fitmentFilter;
}

/**
 * @param {string} value
 * @param {ridestyler.Requests.WheelFilterModel} filters
 * @param {string} key
 */
function applyRangeFitmentFilter(value, filters, key) {
    const [min, max] = getRange(value);
    const fitmentFilter = getFitmentFilter(filters);

    delete fitmentFilter[key], fitmentFilter[key + 'Min'], fitmentFilter[key + 'Max'];

    if (max && min) {
        fitmentFilter[key + 'Min'] = min;
        fitmentFilter[key + 'Max'] = max;
    } else if (min) {
        fitmentFilter[key] = min;
    }
}

/**
 * @param {string} key
 */
function createRangeFilter(name, key) {
    if (typeof key === 'undefined') key = name;

    return {
        key: key,
        name: name,
        type: 'text',
        apply: (value, filters) =>  applyRangeFitmentFilter(value, filters, key)
    };
} 

export default {
    created() {
        /** 
         * @type {AddFitmentFilter[]}
         */
        this.addFitmentFilters = [
            createRangeFilter("Offset"),
            createRangeFilter("Width"),
            createRangeFilter("Diameter"),
            createRangeFilter("Centerbore", "Hub"),
            {
                key: 'BoltPattern',
                name: 'Bolt Pattern',
                type: 'select',
                getOptions() {
                    return new Promise((resolve, reject) => {
                        ridestyler.ajax.send({
                            action: 'wheel/getboltpatterns',
                            callback: response => {
                                if (!response.Success) return reject(response.Message);

                                resolve(response.BoltPatterns.map(bp => {
                                    return {
                                        name: bp.BoltPatternDescription,
                                        value: bp.BoltPatternID
                                    };
                                }))
                            }
                        });
                    });
                },
                apply(value, filters) {
                    const fitmentFilters = getFitmentFilter(filters);

                    if (value) fitmentFilters.BoltPattern = value;
                    else delete fitmentFilters.BoltPattern;
                }
            }
        ];

        this.addFitmentFilters.forEach((/** @type {AddFitmentFilter} */ filter) => {
            if (filter.type === 'select') {
                filter.loading = true;
                filter.value = '';

                filter.getOptions().then(options => {
                    filter.loading = false;
                    filter.options = options;
                });
            }
        });
    },
    data: function () {
        return {
            isAdding: false,
            fitmentsToAdd: [],
            additionalFitments: [],
            matchedFitmentCount: 0,
            fitmentProfileLoading: false,

            /** @type {string} */
            search: undefined,

            /** @type {ridestyler.Requests.WheelFilterModel} */
            addFitmentRequest: undefined,
            unsavedChangeCount: 0,
            hasUserChanges: false,
            searchPartNumberCount: 0
        };
    },

    computed: {
        requiresSave () {
            return this.hasUserChanges && this.unsavedChangeCount > 0;
        }
    },

    methods: {
        performSearch () {
            const search = this.search;

            this.addFitmentRequest = {
                Count: 500
            };

            const partNumberSearchMatch = this.search && this.search.match(partNumberSearchExpression);
            const searchPartNumbers = partNumberSearchMatch ? [...new Set(partNumberSearchMatch[1].split(/\s*,\s*/).map(pn => pn.trim()).filter(pn => !!pn))] : [];
            
            this.searchPartNumberCount = searchPartNumbers.length;

            if (this.searchPartNumberCount > 0) {
                this.addFitmentRequest.PartNumbers = searchPartNumbers;
            } else if (search) {
                this.addFitmentRequest.Search = search;
            }

            this.addFitmentFilters.forEach(filter => filter.apply(filter.value, this.addFitmentRequest));
        },

        addFitment () {
            this.$root.addMessage(`The ${this.fitmentsToAdd.length > 1 ? 'fitments have' : 'fitment has'} been added to the list.`)
            this.additionalFitments = this.additionalFitments.concat(this.fitmentsToAdd);
            this.isAdding = false;
            this.hasUserChanges = true;
        },
        
        /**
         * @param {ClipboardEvent} e
         */
        onAddInputPaste (e) {
            if (e.clipboardData && e.clipboardData.getData) {
                /** @type {DataTransfer} */
                const clipboardData = (window.clipboardData && window.clipboardData.getData) ? window.clipboardData : e.clipboardData;
                const clipboardString = clipboardData.getData('text/plain');
                const separatorMatch = /\s*[\r\n\t]\s*/g;

                if (clipboardString && separatorMatch.test(clipboardString)) {
                    e.preventDefault();

                    const partNumbers = clipboardString.trim().split(separatorMatch);

                    this.search = "Part Numbers: " + partNumbers.join(', ');
                    this.performSearch();
                }
            }
        },

        copyFitmentValuesToAddFitment() {
            this.fitmentProfileLoading = true;

            new Promise((resolve, reject) => {
                ridestyler.ajax.send({
                    action: 'vehicle/getfitments',
                    data: {
                        VehicleConfigurations: this.vehicles.map(v => v.id)
                    },
                    callback(response) {
                        if (response.Success) resolve(response.Fitments);
                        else reject(response.Message);
                    }
                });
            }).then(fitments => {
                const profileFitmentRanges = {};
                const NOT_MATCHING = {};

                const addRange = (fitment, key, singleValue) => {
                    const minKey = key + 'Min';
                    const maxKey = key + 'Max';

                    const currentMin = profileFitmentRanges[minKey];
                    const currentMax = profileFitmentRanges[maxKey];

                    const min = fitment[singleValue ? key : minKey];
                    const max = fitment[singleValue ? key : maxKey];

                    if (typeof currentMin === 'undefined' || min < currentMin) profileFitmentRanges[minKey] = min;
                    if (typeof currentMax === 'undefined' || max < currentMax) profileFitmentRanges[maxKey] = max;
                };

                const addValue = (fitment, key) => {
                    const value = fitment[key];
                    const currentValue = profileFitmentRanges[key];

                    if (typeof currentValue === 'undefined') profileFitmentRanges[key] = value;
                    else if (currentValue !== value) profileFitmentRanges[key] = NOT_MATCHING;
                };

                fitments.forEach(fitment => {
                    addValue(fitment, "VehicleFitment_BoltPatternID");
                    addRange(fitment, "VehicleFitmentOffset", false);
                    addRange(fitment, "VehicleFitmentDiameter", false);
                    addRange(fitment, "VehicleFitmentWidth", false);
                    addRange(fitment, "VehicleFitmentHub", true);
                });

                for (const key in profileFitmentRanges) {
                    if (!profileFitmentRanges.hasOwnProperty(key)) continue;

                    if (profileFitmentRanges[key] === NOT_MATCHING) delete profileFitmentRanges[key];
                }

                const getProfileRangeString = key => {
                    const min = profileFitmentRanges[key + 'Min'];
                    const max = profileFitmentRanges[key + 'Max'];
                    
                    if (!min && !max) return '';

                    if (min === max) return min.toString();
                    
                    return min + ' to ' + max;
                };

                this.addFitmentFilters.forEach((/** @type {AddFitmentFilter} */ filter) => {
                    switch (filter.key) {
                        case "Offset": filter.value = getProfileRangeString('VehicleFitmentOffset'); break;
                        case "Width": filter.value = getProfileRangeString('VehicleFitmentWidth'); break;
                        case "Diameter": filter.value = getProfileRangeString('VehicleFitmentDiameter'); break;
                        case "BoltPattern":  filter.value = 'VehicleFitment_BoltPatternID' in profileFitmentRanges ? profileFitmentRanges['VehicleFitment_BoltPatternID'] : ''; break;
                        case "Hub": filter.value = getProfileRangeString('VehicleFitmentHub'); break;
                    }
                });

                this.fitmentProfileLoading = false;
                this.performSearch();
            });
        }
    },

    watch: {
        vehicles () {
            this.additionalFitments = [];
            this.hasUserChanges = false;
        },
        requiresSave () {
            this.$emit('update:requiresSave', this.requiresSave);
        },
        unsavedChangeCount() {
            this.$emit('update:unsavedChangeCount', this.unsavedChangeCount);
        },
        isAdding() {
            if (!this.isAdding) {
                this.fitmentsToAdd = [];
                this.search = undefined;
            }
        }
    },

    components: {
        FitmentSelector,
        Modal
    },

    props: {
        vehicles: {
            type: Array,
            required: true
        },
        readonly: Boolean
    }
}
</script>

<style lang="scss">
#add-fitment-modal {
    padding: 1em;
    border: 1px solid;
    background-color: #eee;
    border-radius: 5px;

    max-height: 100%;
    box-sizing: border-box;
    overflow: auto;

    .tool-bar {
        padding: 10px 0;
        background-color: #eee;
        margin-bottom: 20px;

        position: -webkit-sticky;
        position: sticky;
        top: 0;

        z-index: 1;
    }
}

#add-fitment-selector {
    margin: 1em 0;
}

.filter-bar {
    $padding: 10px;

    background-color: #ddd;
    padding: $padding;
    margin-top: 10px;
    position: relative;

    input {
        margin-right: 5px;
    }

    .right-buttons {
        position: absolute;
        right: $padding;
        top: $padding;
        bottom: $padding;
    }
}
</style>
