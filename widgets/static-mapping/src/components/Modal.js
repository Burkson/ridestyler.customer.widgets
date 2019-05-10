/**
 *  @type {Vue.ComponentOptions}
 */

const ModalComponent = {
    render() {
        return undefined;
    },

    beforeCreate() {
        this.$modal.registerModal(this)
    },

    destroyed() {
        this.$modal.deregisterModal(this)
    }
}

export default ModalComponent;