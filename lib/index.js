const Module = require('module')
const loaderUtils = require('loader-utils')

const LoaderProxy = require('./proxy')

// Respect the shape of obj
async function resolveResult(loader, obj, query) {
  if (Array.isArray(obj)) {
    return await Promise.all(
      obj.map(prop => resolveResult(loader, prop, query)),
    )
  } else if (typeof obj === 'object') {
    const results = {}
    await Promise.all(
      Object.keys(obj).map(async key => {
        results[key] = await resolveResult(loader, obj[key], query)
      }),
    )
    return results
  } else if (typeof obj === 'function') {
    return await obj.bind(loader)(query)
  } else {
    return obj
  }
}

function exec(code, filename, context) {
  // Maybe we can use eval() here?
  const m = new Module(filename)

  m.paths = Module._nodeModulePaths(context || '.')
  m.filename = filename
  m._compile(code, filename)

  return m.exports
}

module.exports = async function(content) {
  const callback = this.async()
  let results
  let query

  if (this.resourceQuery) {
    query = loaderUtils.parseQuery(this.resourceQuery)
  }

  try {
    // Execute the module and get the exported value
    const exports = exec(content, this.resourcePath, this.context)
    results = await resolveResult(new LoaderProxy(this), exports, query)
  } catch (e) {
    this.callback(e)
    return
  }

  results = `module.exports = ${JSON.stringify(results)}`
  return callback(null, results)
}
