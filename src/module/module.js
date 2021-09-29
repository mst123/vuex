import { forEachValue } from '../util'

// Base data struct for store's module, package with some attribute and method
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    // module下的子模块 用path为key value为module
    this._children = Object.create(null)
    // Store the origin module object which passed by programmer
    // 模块配置
    this._rawModule = rawModule
    const rawState = rawModule.state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }
  // 是否开启命名空间
  get namespaced () {
    return !!this._rawModule.namespaced
  }
  // 记录子module
  addChild (key, module) {
    this._children[key] = module
  }

  removeChild (key) {
    delete this._children[key]
  }

  getChild (key) {
    return this._children[key]
  }

  hasChild (key) {
    return key in this._children
  }

  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }
  // 工具函数
  /* export function forEachValue (obj, fn) {
    Object.keys(obj).forEach(key => fn(obj[key], key))
  } */
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
