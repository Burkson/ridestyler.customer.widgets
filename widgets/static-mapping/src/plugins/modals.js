import Vue from 'vue'

class ModalPluginInstance {
    modalTarget;
    modals = [];

    registerModal (modalComponent) {
        this.modals.push(modalComponent);
    }

    deregisterModal (modalComponent) {
        const index = this.modals.indexOf(modalComponent);

        if (index >= 0) this.modals.splice(index, 1);
    }

    registerModalTarget(modalTargetComponent) {
        modalTargetComponent.modals = this.modals;

        this.modalTarget = modalTargetComponent;
    }
}

Vue.use({
    install(Vue) {
        Vue.prototype.$modal = new ModalPluginInstance()
    }
})