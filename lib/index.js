const Module = require('module')
const pathUtils = require('path')
const loaderUtils = require('loader-utils')

const LoaderProxy = require('./proxy')

function compile(code, filename, context) {
  const m = new Module(filename)

  m.paths = Module._nodeModulePaths(context || '.')
  m.filename = filename
  m._compile(code, filename)

  return m
}

function resolve(loader, path) {
  return pathUtils.resolve(loader.context, path)
}

async function exec(proxy, exports, query) {
  if (Array.isArray(exports)) {
    return await Promise.all(exports.map(prop => exec(proxy, prop, query)))
  } else if (typeof exports === 'object') {
    const results = {}
    await Promise.all(
      Object.keys(exports).map(async key => {
        results[key] = await exec(proxy, exports[key], query)
      }),
    )
    return results
  } else if (typeof exports === 'function') {
    return await exports.bind(proxy)(query)
  }

  return exports
}

module.exports = async function(content) {
  const callback = this.async()

  let query
  if (this.resourceQuery) {
    query = loaderUtils.parseQuery(this.resourceQuery)
  }

  try {
    const proxy = new LoaderProxy(this)
    const mod = compile(content, this.resourcePath, this.context)

    const results = await exec(proxy, mod.exports, query)

    await Promise.all(
      proxy._extraDependencies.map(async dep => {
        this.addDependency(resolve(this, dep))
      }),
    )
    await Promise.all(
      proxy._extraContextDependencies.map(async dep => {
        this.addContextDependency(resolve(this, dep))
      }),
    )

    if (proxy._rawEmit) {
      callback(null, results)
    } else {
      callback(null, `module.exports = ${JSON.stringify(results)}`)
    }
  } catch (e) {
    callback(e)
  }
}
