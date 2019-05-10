import Vue from 'vue'
import { library as iconLibrary } from "@fortawesome/fontawesome-svg-core"
import { faSearch, faPlus, faCheck, faSave, faTimes, faSortUp, faSortDown, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

[
    faSearch,
    faPlus,
    faCheck,
    faSave,
    faTimes,
    faSortUp,
    faSortDown,
    faExclamationTriangle
].forEach(icon => iconLibrary.add(icon))

Vue.component('icon', FontAwesomeIcon)