import Vue from 'vue'
import Vuex from 'vuex'
// import Vuex from '../../../src/index.js'
import cart from './modules/cart'
import products from './modules/products'
import ceshi from './modules/ceishi'
import createLogger from '../../../src/plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    cart,
    products,
    ceshi
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
