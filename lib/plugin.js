const defaultOptions = {
  test: /\.task.js$/,
  loader: require.resolve('./index.js'),
  exclude: /node_modules/,
}

class TaskPlugin {
  constructor(options) {
    this.options = {
      ...defaultOptions,
      options,
    }
  }

  apply(compiler) {
    compiler.hooks.afterEnvironment.tap('InstallTaskLoader', () => {
      compiler.options.module.rules.push(defaultOptions)
    })
  }
}

module.exports = TaskPlugin
