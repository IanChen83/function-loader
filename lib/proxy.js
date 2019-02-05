function getRequestStr(task, query) {
  const queryStr = query ? '?' + JSON.stringify(query) : ''
  return `${task}${queryStr}`
}

class LoaderProxy {
  constructor(loader) {
    this._loader = loader
  }

  cacheable(value) {
    this._loader.cacheable(value)
  }

  addDependency(path) {
    this._loader.addDependency(path)
  }

  clearDependencies() {
    this._loader.clearDependencies()
  }

  addContextDependency(path) {
    this._loader.addContextDependency(path)
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
}

module.exports = LoaderProxy
