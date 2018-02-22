import Vue from 'vue'
import axios from 'axios'
import VueSplit from 'vue-split-panel'
import VueMousetrap from './lib/vue-mousetrap'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(VueSplit)
Vue.use(VueMousetrap)

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  store,
  template: '<App/>',
  beforeCreate () {
    this.$store.commit('settingsLoad')
  }
}).$mount('#app')
