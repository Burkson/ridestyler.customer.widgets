<template>
    <div id="app">
        <header class="main dark">
            <div>
                <h1 class="inline">Static Mapping Tool</h1>
                
                <div class="inline-block align-middle" style="margin-left: 10px; color: #aaa">
                    <div>{{emailAddress}}</div>
                    <div>{{organizationName}}</div>
                </div>
            </div>

            <div class="text-right">
                <span v-if="readonly">
                    Read Only
                </span>

                <button v-else-if="vehicles.length > 0" @click="saveLinkages" :disabled="saving">
                    Save
                    <icon icon="save"></icon>
                </button>
            </div>
        </header>
        <div v-if="initializing">
            <loading-indicator />
        </div>
        <div v-else>
            <div id="left">
                <vehicle-selector @selection="onNewVehiclesSelected" />
            </div>
            <div id="right">
                <mapped-fitment-manager
                    @selection="selectedFitments => fitments = selectedFitments"
                    @update:requiresSave="doesRequireSave => saveNeeded = doesRequireSave"
                    :vehicles="vehicles"
                    :readonly="readonly" />
            </div>
        </div>
        
        <div id="global-alert-overlay" v-if="globalAlert">
            <div :class="['alert', 'alert-' + globalAlert.type ]">
                {{ globalAlert.message }}

                <button class="alert-dismiss" @click="globalAlert = undefined">
                    <icon icon="times" />
                </button>
            </div>
        </div>

        <transition-group id="toast-container" name="toast">
            <div v-for="message of messages" :class="['alert', 'alert-' + message.type ]" :key="message.text">
                {{ message.text }}

                <button class="alert-dismiss" @click="$root.removeMessage(message)">
                    <icon icon="times" />
                </button>
            </div>
        </transition-group>

        <modal-target />
    </div>
</template>

<script>

import LoadingIndicator from './components/LoadingIndicator';
import VehicleSelector from './components/VehicleSelector';
import MappedFitmentManager from './components/MappedFitmentManager';
import ModalTarget from './components/ModalTarget';

export default {
    name: 'app',
    data() {
        return {
            initializing: true,
            vehicles: [],
            fitments: [],
            
            readonly: false,
            saving: false,
            saveNeeded: false,

            emailAddress: undefined,
            organizationName: undefined,
            globalAlert: undefined,
            messages: this.$root.messages
        }
    },
    computed: {
        savePrompt() {
            const vehicles = this.vehicles.length > 1 ? 'vehicles' : 'vehicle';

            return `You have not saved the mapping for the currently selected ${vehicles}. `;
        }
    },
    components: {
        VehicleSelector,
        MappedFitmentManager,
        LoadingIndicator,
        ModalTarget
    },
    methods: {
        saveLinkages() {
            this.saving = true;

            ridestyler.ajax.send({
                action: 'wheel/savelinkages',
                data: {
                    VehicleConfigurations: this.vehicles.map(vehicle => vehicle.id),
                    Linkages: this.fitments.map(fitment => {
                        return {
                            ID: fitment.id
                        }
                    })
                },
                callback: response => {
                    this.saving = false;

                    let vehicleDescription = '';

                    for (let i = 0; i < this.vehicles.length; i++) {
                        const vehicle = this.vehicles[i];

                        if (i > 2) {
                            vehicleDescription += ` and ${this.vehicles.length - i} more`
                            break;
                        }

                        if (i > 0) {
                            if (i < this.vehicles.length - 1)  vehicleDescription += ', ';
                            else vehicleDescription += ' and ';
                        }

                        vehicleDescription += vehicle.FullDescription;
                    }

                    if (response.Success) {
                        this.$root.addMessage(`The linkages for ${vehicleDescription} have been saved.`, 'success');

                        // hack to cause the vehicle fitment list to reload
                        this.vehicles = this.vehicles.slice();
                    } else {
                        this.$root.addMessage(`There was an error saving your linkages: ${response.Message}`, 'error');
                    }
                }
            })
        },
        onNewVehiclesSelected(newVehicles) {
            if (this.saveNeeded && window.confirm(this.savePrompt + " Would you like to save it before continuing?")) {
                this.saveLinkages();
            }

            this.vehicles = newVehicles;
        }
    },
    created() {
        ridestyler.user.ready.done(() => {
            const authStatus = new Promise((resolve, reject) => {
                ridestyler.ajax.send({
                    action: 'auth/status',
                    data: {},
                    callback: response => {
                        this.emailAddress = response.User.UserEmail;
                        this.organizationName = response.ActiveOrganization.OrganizationName;

                        response.Success ? resolve(response) : reject(response);
                    }
                })
            });

            const getLinkageMode = new Promise((resolve, reject) => {
                ridestyler.ajax.send({
                    action: 'organization/getmeta',
                    data: {
                        IncludeActiveOrganization: true,
                        MetaKey: "VehicleWheelLinkageMode"
                    },
                    callback: response => {
                        response.Success ? resolve(response) : reject(response);
                    }
                })
            });

            Promise.all([authStatus, getLinkageMode])
                .then(responses => {
                    const authStatusResponse = responses[0];
                    const getLinkageModeResponse = responses[1];

                    const hasManageWheelsRole = authStatusResponse.User.Roles.includes("Manage Wheels");
                    const staticMappingEnabled = getLinkageModeResponse.OrganizationMeta.length > 0 && getLinkageModeResponse.OrganizationMeta[0].OrganizationMetaValue === '1';

                    if (!hasManageWheelsRole) console.info("User is missing Manage Wheels role.")
                    if (!staticMappingEnabled) console.info("Static mapping is not enabled for the organization.")

                    this.readonly = !(hasManageWheelsRole && staticMappingEnabled);

                    if (this.readonly) console.info("Tool is in readonly mode");
                    
                    this.initializing = false;
                });
        });

        window.addEventListener('beforeunload', e => {
            if (this.saveNeeded) {
                e.preventDefault();
                e.returnValue = this.savePrompt + "The changes will be lost if you navigate away from the page.";
            }
        });
    }
}
</script>

<style lang="scss">
@import "./style/ridestyler/index.scss";

#left, #right {
    position: absolute;
    top: 80px;
    bottom: 0;
    width: 50%;

    padding: 1rem;
    box-sizing: border-box;

    overflow: auto;
}

#left {
    left: 0;
}

#right {
    right: 0;
}

#global-alert-overlay {
    position: absolute;
    top: 70px; left: 0; right: 0; bottom: 0;

    background-color: rgba(0,0,0,0.65);

    .alert {
        position: absolute;

        left: 20%; right: 20%;
        top: 40px;
    }
}

#toast-container {
    position: absolute;
    left: 0; bottom: 0; right: 0;
    padding: 1rem;
}

.tool-bar {
    margin-bottom: 5px;

    button + button {
        margin-left: 5px;
    }
}

.modal-target {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background-color: rgba(0,0,0,0.65);

    padding: 80px;
}

.modal {
    .close {
        position: absolute;
        top: 0;
        right: 0;

        font-size: 2rem;
    }
}

.toast-enter-active, .toast-leave-active {
  transition: opacity .3s ease;
}
.toast-move {
  transition: transform 1s;
}
.toast-enter, .toast-leave-to {
  opacity: 0;
}
</style>
