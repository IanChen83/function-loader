module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: '8',
        },
        exclude: ['transform-regenerator'],
      },
    ],
  ],
}
