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

async function resolve(loader, obj, query) {
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map(prop => resolve(loader, prop, query)))
  } else if (typeof obj === 'object') {
    const results = {}
    await Promise.all(
      Object.keys(obj).map(async key => {
        results[key] = await resolve(loader, obj[key], query)
      }),
    )
    return results
  } else if (typeof obj === 'function') {
    return await obj.bind(loader)(query)
  }

  return obj
}

module.exports = async function(content) {
  let query
  if (this.resourceQuery) {
    query = loaderUtils.parseQuery(this.resourceQuery)
  }

  try {
    const proxy = new LoaderProxy(this)
    const mod = compile(content, this.resourcePath, this.context)

    const results = await resolve(proxy, mod.exports, query)

    this.callback(null, `module.exports = ${JSON.stringify(results)}`)
  } catch (e) {
    this.callback(e)
  }
}
