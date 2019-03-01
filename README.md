<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# function-loader

A Webpack loader that executes tasks (modules exporting functions) and
transforms them into results at build time.

You can see this loader as [val-loader](https://github.com/webpack-contrib/val-loader/)
with APIs re-designed. We believe function-loader is much more useful when
there're shared functions in both frontend and backend. Moreover, if you want to load
assets but cannot find a proper loader, this loader allows you to quickly
prototype a custom loader.

## Requirements

- Node v8.0.0 or above
- Webpack v4.0.0 or above

## Getting Started

Add a new rule in webpack.config.js.

```
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.task.js$/,
      loader: 'function-loader',
      exclude: /node_modules/
    }]
  }
}
```

> Note that the rule `/\.task.js$/` is a subset of `/\.js$/`. Be careful if you use
> babel or similar loaders to transform your source code.

Then, modules with name matching `/\.task.js$/` will be loaded and transformed via function-loader.

```
// getMs.task.js
module.exports = ({ years }) => years * 365 * 24 * 60 * 60 * 1000

```

```
// app.js
import Ms from './getMs.task?years=2'  // Ms will be 63072000000

// ...
```

> Yon can also export an array or a plain object from the task module.
> function-loader will respect the shape of the exported value and only transform
> functions into results in-place.

## Loader Proxy API

The exported task functions will be executed under the context of loader
proxies. The `this` variable has the following properties/functions

> In order to allow `this` variable to work, don't use arrow function syntax.

###### `this.isTask`

only set to `true` when loaded by function-loader. Use this property to split
frontend/backend logic.

###### `this.webpack`

only set to `true` when loaded by Webpack. See [loader.webpack](https://webpack.js.org/api/loaders/#thiswebpack).

###### `raw(value)`

Calling this function with `value=true` will enable raw mode. In raw mode, your
target function should return a string, which should be a valid module source
passing down the loader chain.

###### `this.cacheable(value)`

This function directly call [loader.cacheable](https://webpack.js.org/api/loaders/#thiscacheable).

###### `this.addDependency(path)`

###### `this.addContextDependency(path)`

Like [loader.addDependency](https://webpack.js.org/api/loaders/#thisadddependency) but these functions can work with relative paths.

###### `this.clearDependencies()`

This function directly call [loader.clearDependencies](https://webpack.js.org/api/loaders/#thiscleardependencies).

###### `this.run(task, query, callback)`

This function allows you to run other tasks. Note that the target tasks will be
automatically added to dependencies.

- `task`: path of the target task, can be relative.
- `query`: a plain object or `null` served as parameters.
- `callback(err, value)`: callback function that will be called when the task
  is succefully executed.

###### `async this.runAsync(task, query)`

The async version of the `run` method.

###### `this.writeFile(path, cotent, sourceMap)`

This functions directly call [loader.emitFile](https://webpack.js.org/api/loaders/#thisemitfile).

## Limitations

- When or how much times task modules are loaded/executed depend on Webpack's caching mechanism. Make sure the side effects will not cause race conditions.
- The query values and output results of the task modules should be able to be JSON-stringified.

## TODO

- Cache compiled functions

## Similar Projects

- [value-loader](https://github.com/wikiwi/value-loader)
- [val-loader](https://github.com/webpack-contrib/val-loader/)
- [skeleton-loader](https://github.com/anseki/skeleton-loader)

## License

MIT
