import Vue from 'vue'

import App from './App.vue'

import "./plugins/icons"
import "./plugins/modals"


Vue.config.productionTip = process.env.NODE_ENV !== 'development';
Vue.config.performance = process.env.NODE_ENV === 'development';

new Vue({
    render: h => h(App),
    data: {
        messages: []
    },
    methods: {
        addMessage (text, type, timeout) {
            type = type || 'success';

            if (typeof timeout === 'undefined' || typeof timeout !== 'number') timeout = 6000;

            const message = {
                text,
                type
            };

            this.messages.push(message);

            if (timeout > 0) {
                setTimeout(() => {
                    this.removeMessage(message);
                }, timeout);
            }
        },
        removeMessage (message) {
            const index = this.messages.indexOf(message);

            if (index < 0) return;

            this.messages.splice(index, 1);
        }
    }
}).$mount('#app')
