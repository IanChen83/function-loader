const Module = require('module')
const loaderUtils = require('loader-utils')

const LoaderProxy = require('./proxy')

function compile(code, filename, context) {
  const m = new Module(filename)

  m.paths = Module._nodeModulePaths(context || '.')
  m.filename = filename
  m._compile(code, filename)

  return m
}

async function resolve(loader, path) {
  return await new Promise((resFunc, rejFunc) => {
    loader.resolve(loader.context, path, (err, result) => {
      if (err) {
        rejFunc(err)
      } else {
        resFunc(result)
      }
    })
  })
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
        this.addDependency(await resolve(this, dep))
      }),
    )
    await Promise.all(
      proxy._extraContextDependencies.map(async dep => {
        this.addContextDependency(await resolve(this, dep))
      }),
    )

    callback(null, `module.exports = ${JSON.stringify(results)}`)
  } catch (e) {
    callback(e)
  }
}
