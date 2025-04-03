export default {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: false // Preserve ES modules
    }],
    '@babel/preset-react'
  ]
};