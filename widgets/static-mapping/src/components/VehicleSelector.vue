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

        </data-table>
    </div>
</template>

<script>

import LoadingIndicator from './LoadingIndicator';
import DataTable from './DataTable'

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
                }
            ],
            vehicles: [],
            selection: []
        }
    },
    methods: {
        performSearch() {
            this.hasPerformedSearch = true;
            this.loading = true;
            this.vehicles = [];
            this.selection = [];
            this.errorMessage = undefined;

            ridestyler.ajax.send({
                action: 'vehicle/getdescriptions',
                data: {
                    Search: this.search,
                    NoCache: true
                },
                callback: response => {
                    if (response.Success) {
                        this.vehicles = response.Descriptions.map(description => {
                            return {
                                id: description.ConfigurationID,
                                FullDescription: description.FullDescription
                            }
                        });
                    } else {
                        this.errorMessage = response.Message;
                        this.vehicles = [];
                    }

                    this.loading = false;
                }
            })
        }
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
