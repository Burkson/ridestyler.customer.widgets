<template>
    <data-table
        class="main-table"
        :columns="columns"
        :data="rows"
        :loading="loading"

        :rowClass="rowClass"

        :sort="defaultSort"
        
        v-model="selectedFitments"

        @user-selection="hasUserChanges = true"
        @update:numberOfRows="numberOfRows => $emit('update:numberOfRows', numberOfRows)"

        :single-select="singleSelect"

        :selectable="!readonly"
        :click-rows-to-select="!readonly">

        <template v-slot:loading>
            <loading-indicator />
        </template>

    </data-table>
</template>

<script>
import LoadingIndicator from './LoadingIndicator';
import DataTable from './DataTable'

export default {
    model: {
        prop: 'selectedFitments',
        event: 'selection'
    },
    components: {
        DataTable,
        LoadingIndicator
    },
    data() {
        return {
            columns: [
                {
                    name: 'Brand',
                    field: 'WheelBrandName'
                },
                {
                    name: 'Model',
                    field: 'WheelModelName'
                },
                {
                    name: 'Finish',
                    field: 'WheelModelFinishDescription'
                },
                {
                    name: 'Bolt Pattern',
                    field: 'BoltPattern',
                    format(row) {
                        if (!row.BoltPatterns || !row.BoltPatterns.length) return '';
                        
                        if (row.BoltPatterns.length > 2) return row.BoltPatterns.length + ' Bolt Patterns';

                        return row.BoltPatterns.map(bp => bp.BoltPatternDescription).join(' and ');
                    },
                    tooltip: r => r.BoltPatterns ? r.BoltPatterns.map(bp => bp.BoltPatternDescription).join("\n") : ''
                },
                {
                    name: 'Part Number',
                    field: 'PartNumber'
                },
                {
                    name: 'Size',
                    field: ['DiameterMin', 'WidthMin'],
                    format(row) {
                        return row.DiameterMin + '" x ' + row.WidthMin + '"';
                    }
                },
                {
                    name: 'Offset',
                    field: 'OffsetMin',
                    format(row) {
                        const offset = row.OffsetMin;

                        let sign = offset > 0 ? '+' : '';

                        return sign + offset + 'mm';
                    }
                },
                {
                    name: 'Centerbore',
                    field: 'CenterboreMM'
                },
            ],

            hasUserChanges: false,
            loading: false,

            fitments: [],
            selectedFitments: this.selection || [],

            /** 
             * A list of the original fitments loaded from the server. Keys are vehicle configuration IDs
             * and the values are an array of originally mapped fitment IDs
             * 
             * @type {{[vehicleConfigurationID:string]:string[]}} 
             */
            originalVehicleFitments: {}
        };
    },

    computed: {
        unsavedChangeCount() {
            const count = this.rows.reduce((count, row) => {
                return this.rowIsUnsaved(row) ? count + 1 : count;
            }, 0);

            this.$emit('update:unsavedChangeCount', count);

            return count;
        },
        rows() {
            var seenIDs = new Set();
            const fitments = [];
            
            this.fitments.forEach(fitment => {
                seenIDs.add(fitment.id);
                fitments.push(fitment);
            });

            this.additionalFitments.forEach(fitment => {
                if (seenIDs.has(fitment.id)) return;
                fitments.push(fitment);
            });

            return fitments;
        }
    },

    created() {
        this.defaultSort = [
            {
                column: 'WheelBrandName'
            },
            {
                column: 'WheelModelName'
            },
            {
                column: 'WheelModelFinishDescription'
            }
        ]

        this.rowClass = {
            'unsaved': row => this.rowIsUnsaved(row)
        };

        if (this.loadInitially) this.reloadFitments();
    },

    methods: {
        /** 
         * @param {{id: string}} [vehicle]
         */
        loadFitments(vehicle) {
            const filters = Object.assign({
                NoCache: true
            }, this.filters);

            if (vehicle) filters.VehicleConfiguration = vehicle.id;
            else if (this.vehicles) {
                this.fitments = [];

                if (!this.vehicles.length) return Promise.resolve();

                return Promise.all(this.vehicles.map(vehicle => this.loadFitments(vehicle))).then(vehicleFitmentSets => {
                    const seenIDs = new Set();
                    const fitments = [];

                    vehicleFitmentSets.forEach(vehicleFitments => vehicleFitments.forEach(fitment => {
                        const id = fitment.id;

                        if (seenIDs.has(id)) return;
                        
                        fitments.push(fitment);
                        seenIDs.add(id);
                    }));

                    return fitments;
                });
            }

            return new Promise((resolve, reject) => {
                ridestyler.ajax.send({
                    action: 'wheel/getfitmentdescriptions',
                    data: filters,
                    callback: response => {
                        if (!response.Success) {
                            return reject("Failed to load fitments: " + response.Message);
                        }

                        const mappedFitmentIDs = [];

                        response.Fitments.forEach(fitment => {
                            const id = fitment.WheelFitmentID;

                            fitment.id = id;
                            mappedFitmentIDs.push(id);
                        });

                        if (vehicle) {
                            this.$set(this.originalVehicleFitments, vehicle.id, mappedFitmentIDs);
                        }

                        resolve(response.Fitments);
                    }
                });    
            });
        },

        reloadFitments() {
            this.fitments = [];
            this.selectedFitments = [];
            this.loading = true;
            this.originalVehicleFitments = {};
            this.hasUserChanges = false;

            let promise = this.loadFitments().then(fitments => {
                this.fitments = fitments;

                if (this.autoSelectAll) {
                    this.selectedFitments = fitments.concat();
                }

                return fitments;
            });

            promise.finally(() => this.loading = false);

            return promise;
        },

        fitmentMappedToAllVehicles(fitmentID) {
            for (const vehicleConfigurationID in this.originalVehicleFitments) {
                if (!this.originalVehicleFitments.hasOwnProperty(vehicleConfigurationID)) continue;
                
                const mappedFitmentIDs = this.originalVehicleFitments[vehicleConfigurationID];

                if (!mappedFitmentIDs.includes(fitmentID)) return false;
            }

            return true;
        },

        fitmentMappedToAnyVehicle(fitmentID) {
            for (const vehicleConfigurationID in this.originalVehicleFitments) {
                if (!this.originalVehicleFitments.hasOwnProperty(vehicleConfigurationID)) continue;
                
                const mappedFitmentIDs = this.originalVehicleFitments[vehicleConfigurationID];

                if (mappedFitmentIDs.includes(fitmentID)) return true;
            }

            return false;
        },

        fitmentSelected(fitmentID) {
            return this.selectedFitments.some(fitment => fitment.id === fitmentID);
        },

        rowIsUnsaved(row) {
            const id = row.id;
            const isAdditional = this.additionalFitments.some(fitment => fitment.id === id);
            const selected     = this.fitmentSelected(id);

            return isAdditional ?
                selected : 
                selected ? 
                    !this.fitmentMappedToAllVehicles(id) : 
                    this.fitmentMappedToAnyVehicle(id);
        }
    },
    watch: {
        vehicles() {
            this.reloadFitments();
        },
        filters() {
            this.reloadFitments();
        },
        selectedFitments() {
            this.$emit('selection', this.selectedFitments);
        },
        additionalFitments() {
            this.selectedFitments = this.selectedFitments.concat(this.additionalFitments);
        },
        unsavedChangeCount() {
            },
        hasUserChanges() {
            this.$emit('update:hasUserChanges', this.hasUserChanges);
        }
    },
    props: {
        vehicles: Array,
        filters: Object,
        readonly: Boolean,
        selection: Array,
        autoSelectAll: Boolean,
        singleSelect: Boolean,
        loadInitially: Boolean,
        additionalFitments: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="scss">
@import '../style/ridestyler/_variables.scss';

tr.unsaved, tr.selected.unsaved {
    background-color: goldenrod;
}

tr.selected td:first-child {
    background-color: $primary-color;
}
</style>
