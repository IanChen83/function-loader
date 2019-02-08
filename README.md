<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# task-loader

A Webpack loader that transforms modules (tasks) into results at build time

You can see this loader as val-loader with APIs re-designed.

## Requirements

- Node v8.0.0 or above
- Webpack v4.0.0 or above

## Getting Started

Add a new rule at the bottom of `options.modules.rules` in webpack.config.js.

```
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.task.js$/,
      loader: 'task-loader',
      exclude: /node_modules/
    }]
  }
}
```

Then, modules with name matching `/\.task.js$/` will be loaded via task-loader.

```
// getTime.task.js
module.exports = () => new Date().getTime()

```

```
// app.task.js
import buildTime from './getTime.task'  // buildTime will be an integer

// ...
```

## Exported Values

TODO

## Loader Proxy API

TODO

## TODO

- Cache compiled functions

## License

MIT
