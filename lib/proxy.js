function getRequestStr(task, query) {
  const queryStr = query ? '?' + JSON.stringify(query) : ''
  return `${task}${queryStr}`
}

class LoaderProxy {
  constructor(loader) {
    this.isTask = true
    this._loader = loader
    this.webpack = this._loader.webpack
    this._extraDependencies = []
    this._extraContextDependencies = []
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
    this._loader.clearDependencies()
  }

  run(task, query, callback) {
    const req = getRequestStr(task, query)

    this._loader.loadModule(req, function(err, source) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, eval(source))
      }
    })
  }

  async runAsync(task, query) {
    const req = getRequestStr(task, query)

    return await new Promise((resolve, reject) => {
      this._loader.loadModule(req, (err, source) => {
        if (err) {
          reject(err)
        } else {
          resolve(eval(source))
        }
      })
    })
  }

  writeFile(name, content, sourceMap) {
    this._loader.emitFile(name, content, sourceMap)
  }
}

module.exports = LoaderProxy
