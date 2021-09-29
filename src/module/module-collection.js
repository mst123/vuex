import Module from './module'
import { assert, forEachValue } from '../util'

export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    // 注册函数 首先注册根模块 后续递归运行
    this.register([], rawRootModule, false)
  }

  get(path) {
    // TODO 这操作好骚，如果path是空数组 直接返回this.root
    // 一级一级的取module，优秀
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

  update (rawRootModule) {
    update([], this.root, rawRootModule)
  }
  /**
   * @description: 
   * @param {*} path 路径
   * @param {*} rawModule 模块配置
   * @param {*} runtime 是否是运行时创建的模块
   * @return {*}
   */  
  register(path, rawModule, runtime = true) {
    debugger
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }
    // Module 是用来描述单个模块的类
    const newModule = new Module(rawModule, runtime)
    console.log("🚀 ~ file: module-collection.js ~ line 43 ~ ModuleCollection ~ register ~ newModule", newModule)
    // 根module
    if (path.length === 0) {
      this.root = newModule
    } else {
      // 查找上一级的path ["avv","aaa", "afafff"].slice(0,-1)  ['avv', 'aaa']
      // this.get 重要函数 获取对应的 path module
      const parent = this.get(path.slice(0, -1))
      // 建立层级关系
      /* addChild (key, module) {
        this._children[key] = module
      } */
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules
    // 注册嵌套module
    if (rawModule.modules) {
      /* function forEachValue (obj, fn) {
        Object.keys(obj).forEach(key => fn(obj[key], key))
      } */
      // key 是模块名称  rawChildModule是模块配置
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        // path.concat(key) 把下级路径 添加进去
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }

  unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    const child = parent.getChild(key)

    if (!child) {
      if (__DEV__) {
        console.warn(
          `[vuex] trying to unregister module '${key}', which is ` +
          `not registered`
        )
      }
      return
    }

    if (!child.runtime) {
      return
    }

    parent.removeChild(key)
  }

  isRegistered (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]

    if (parent) {
      return parent.hasChild(key)
    }

    return false
  }
}

function update (path, targetModule, newModule) {
  if (__DEV__) {
    assertRawModule(path, newModule)
  }

  // update target module
  targetModule.update(newModule)

  // update nested modules
  if (newModule.modules) {
    for (const key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (__DEV__) {
          console.warn(
            `[vuex] trying to add a new module '${key}' on hot reloading, ` +
            'manual reload is needed'
          )
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      )
    }
  }
}

const functionAssert = {
  assert: value => typeof value === 'function',
  expected: 'function'
}

const objectAssert = {
  assert: value => typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'),
  expected: 'function or object with "handler" function'
}

const assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
}

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(key => {
    if (!rawModule[key]) return

    const assertOptions = assertTypes[key]

    forEachValue(rawModule[key], (value, type) => {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      )
    })
  })
}

function makeAssertionMessage (path, key, type, value, expected) {
  let buf = `${key} should be ${expected} but "${key}.${type}"`
  if (path.length > 0) {
    buf += ` in module "${path.join('.')}"`
  }
  buf += ` is ${JSON.stringify(value)}.`
  return buf
}
