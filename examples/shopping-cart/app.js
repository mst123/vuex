import Vue from 'vue'
import App from './components/App.vue'
import store from './store'
console.log("🚀 ~ file: app.js ~ line 4 ~ store", store)
import { currency } from './currency'

Vue.filter('currency', currency)

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
