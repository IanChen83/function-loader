function getRequestStr(task, query) {
  const queryStr = query ? '?' + JSON.stringify(query) : ''
  return `${task}${queryStr}`
}

class LoaderProxy {
  constructor(loader) {
    this.isTask = true
    this._rawEmit = false
    this._loader = loader
    this.webpack = this._loader.webpack
    this._extraDependencies = []
    this._extraContextDependencies = []
  }

  emitError(obj) {
    const error = obj instanceof Error ? obj : new Error(String(obj))
    this._loader.emitError(error)
  }

  emitWarning(obj) {
    const error = obj instanceof Error ? obj : new Error(String(obj))
    this._loader.emitWarning(error)
  }

  raw(value = true) {
    this._rawEmit = value
  }

  cacheable(value) {
    this._loader.cacheable(value)
  }

  addDependency(path) {
    this._extraDependencies.push(path)
  }

  addContextDependency(path) {
    this._extraContextDependencies.push(path)
  }

  clearDependencies() {
    this._extraDependencies.length = 0
    this._extraContextDependencies.length = 0
    this._loader.clearDependencies()
  }

  loadModule(req, callback) {
    this._loader.loadModule(req, callback)
  }

  async loadModuleAsync(req) {
    return await new Promise((resolve, reject) => {
      this._loader.loadModule(req, (err, source) => {
        if (err) {
          reject(err)
        } else {
          resolve(source)
        }
      })
    })
  }

  run(task, query, callback) {
    const req = getRequestStr(task, query)
    this.loadModule(req, function(err, source) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, eval(source))
      }
    })
  }

  async runAsync(task, query) {
    const req = getRequestStr(task, query)

    return eval(await this.loadModuleAsync(req))
  }

  writeFile(name, content, sourceMap) {
    this._loader.emitFile(name, content, sourceMap)
  }
}

module.exports = LoaderProxy
