const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/videomaker',
    createProxyMiddleware({
      target: 'http://127.0.0.1:9000',
      changeOrigin: true,
      pathRewrite: {
        '^/videomaker': '',
      },
    }),
  )
}
