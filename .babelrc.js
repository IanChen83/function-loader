module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: '6.11.5',
        },
        exclude: ['transform-regenerator'],
      },
    ],
  ],
}
