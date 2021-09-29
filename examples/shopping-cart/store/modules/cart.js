import shop from '../../api/shop'

// initial state
// shape: [{ id, quantity }]
const state = () => ({
  items: [],
  checkoutStatus: null
})

// getters
const getters = {
  cartProducts: (state, getters, rootState) => {
    return state.items.map(({ id, quantity }) => {
      const product = rootState.products.all.find(product => product.id === id)
      return {
        title: product.title,
        price: product.price,
        quantity
      }
    })
  },
  // 计算总价格
  cartTotalPrice: (state, getters) => {
    return getters.cartProducts.reduce((total, product) => {
      return total + product.price * product.quantity
    }, 0)
  }
}

// actions
const actions = {
  checkout ({ commit, state }, products) {
    const savedCartItems = [...state.items]
    commit('setCheckoutStatus', null)
    // empty cart
    commit('setCartItems', { items: [] })
    shop.buyProducts(
      products,
      () => commit('setCheckoutStatus', 'successful'),
      () => {
        commit('setCheckoutStatus', 'failed')
        // rollback to the cart saved before sending the request
        commit('setCartItems', { items: savedCartItems })
      }
    )
  },

  addProductToCart ({ state, commit }, product) {
    commit('setCheckoutStatus', null)
    // 库存
    if (product.inventory > 0) {
      const cartItem = state.items.find(item => item.id === product.id)
      if (!cartItem) {
        // 添加产品
        commit('pushProductToCart', { id: product.id })
      } else {
        // 增加数量
        commit('incrementItemQuantity', cartItem)
      }
      // remove 1 item from stock
      // 减库存
      commit('products/decrementProductInventory', { id: product.id }, { root: true })
    }
  }
}

// mutations
const mutations = {
  pushProductToCart (state, { id }) {
    state.items.push({
      id,
      quantity: 1
    })
  },

  incrementItemQuantity (state, { id }) {
    const cartItem = state.items.find(item => item.id === id)
    cartItem.quantity++
  },

  setCartItems (state, { items }) {
    state.items = items
  },

  setCheckoutStatus (state, status) {
    state.checkoutStatus = status
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
