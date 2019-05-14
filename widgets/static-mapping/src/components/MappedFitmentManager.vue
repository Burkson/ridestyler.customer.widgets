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
                </div>

                <fitment-selector
                    id="add-fitment-selector"
                    :filters="addFitmentFilters"
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

export default {
    data: function () {
        return {
            isAdding: false,
            fitmentsToAdd: [],
            additionalFitments: [],
            matchedFitmentCount: 0,

            /** @type {string} */
            search: undefined,

            /** @type {ridestyler.Requests.WheelFilterModel} */
            addFitmentFilters: undefined,
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

            this.addFitmentFilters = {
                Count: 500
            };

            const partNumberSearchMatch = this.search && this.search.match(partNumberSearchExpression);
            const searchPartNumbers = partNumberSearchMatch ? [...new Set(partNumberSearchMatch[1].split(/\s*,\s*/).map(pn => pn.trim()).filter(pn => !!pn))] : [];
            
            this.searchPartNumberCount = searchPartNumbers.length;

            if (this.searchPartNumberCount > 0) {
                this.addFitmentFilters.PartNumbers = searchPartNumbers;
            } else {
                this.addFitmentFilters.Search = search;
            }
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
            else {
                alert('Not paste object!');
            }
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
</style>
