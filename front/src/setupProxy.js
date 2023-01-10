const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/login',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_SERVER_URL}`,
      changeOrigin: true,
    }),
  );
  app.use(
    '/postgres',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_SERVER_URL}/postgres`,
      changeOrigin: true,
    }),
  );
};
