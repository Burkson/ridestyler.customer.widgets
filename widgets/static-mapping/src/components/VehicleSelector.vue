<template>
    <div>
        <form class="tool-bar input-group" @submit.prevent="performSearch">
            <input type="search" v-model="search" autofocus>

            <div class="input-group-addon">
                <button type="submit">
                    <icon icon="search" />
                </button>
            </div>
        </form>

        <div v-if="!hasPerformedSearch">
            Search for a Vehicle above
        </div>

        <data-table
            class="main-table"

            :columns="columns"
            :data="vehicles"
            :loading="loading"
            :message="errorMessage"

            v-model="selection"

            selectable
            click-rows-to-select
            v-else>

            <template v-slot:loading>
                <loading-indicator />
            </template>

            <!-- <template v-slot:header:approved>
                <div class="header-buttons" v-if="savingApprovalStatus">
                    <icon icon="compact-disc" spin ></icon>
                </div>
                <div class="header-buttons" v-else>
                    <button title="Approve Selected" :disabled="!selection.some(vehicle => !vehicle.IsApproved)" @click="setSelectedVehicleApprovalStatus(true)">
                        <icon icon="check" />
                    </button>
                    
                    <button title="Unapprove Selected" :disabled="!selection.some(vehicle => vehicle.IsApproved)" @click="setSelectedVehicleApprovalStatus(false)">
                        <icon icon="times" />
                    </button>
                </div>
            </template> -->

            <template v-slot:column:approved="{ row }" class="text-center">
                <icon :icon="row.IsApproved ? 'check' : 'times'" />
            </template>

        </data-table>
    </div>
</template>

<script>
import LoadingIndicator from './LoadingIndicator';
import DataTable from './DataTable'

import {formatMultipleVehicleDescriptions} from '../format'

function getSearchFromHash() {
    return decodeURIComponent(location.hash.slice(1));
}

export default {
    components: {
        DataTable,
        LoadingIndicator
    },
    data() {

        return {
            search: '',
            errorMessage: '',

            loading: false,
            hasPerformedSearch: false,

            columns: [
                {
                    name: "Vehicle",
                    field: "FullDescription"
                },
                {
                    name: "Approved",
                    field: "IsApproved"
                }
            ],
            vehicles: [],
            selection: [],
            savingApprovalStatus: false
        }
    },
    methods: {
        performSearch() {
            this.hasPerformedSearch = true;
            this.loading = true;
            this.vehicles = [];
            this.selection = [];
            this.errorMessage = undefined;

            location.hash = '#' + encodeURIComponent(this.search);

            ridestyler.ajax.send({
                action: 'vehicle/getdescriptions',
                data: {
                    Search: this.search,
                    ApprovalStatus: 'All',
                    NoCache: true,
                    SearchOptions: 0
                },
                callback: response => {
                    if (response.Success) {
                        response.Descriptions.forEach(description => {
                            description.id = description.ConfigurationID;
                        });

                        this.vehicles = response.Descriptions;
                    } else {
                        this.errorMessage = response.Message;
                        this.vehicles = [];
                    }

                    this.loading = false;
                }
            })
        },
        setSelectedVehicleApprovalStatus(approved) {
            this.savingApprovalStatus = true;

            const vehicleDescription = formatMultipleVehicleDescriptions(this.selection);
           
            ridestyler.ajax.send({
                action: 'vehicle/setapproved',
                data: {
                    VehicleConfigurations: this.selection.map(vehicle => vehicle.id),
                    Approved: approved
                },
                callback: response => {
                    if (response.Success) {
                        this.$root.addMessage(`These vehicles have been marked as ${approved ? 'approved' : 'not approved'}: ${vehicleDescription}`, 'success');
                        this.selection.forEach(vehicle => vehicle.IsApproved = approved);
                    } else {
                        this.$root.addMessage(`There was an error saving the approval status: ${response.Message}`, 'error');
                    }

                    this.savingApprovalStatus = false;
                }
            })
        }
    },
    created() {
        const checkHashSearch = () => {
            const hashSearch = getSearchFromHash();

            if (hashSearch && hashSearch !== this.search) {
                this.search = hashSearch;
                this.performSearch();
            }
        };

        checkHashSearch();

        window.addEventListener('hashchange', checkHashSearch)
    },
    watch: {
        selection () {
            this.$emit('selection', this.selection);
        }
    }
}
</script>

<style lang="scss">
</style>
