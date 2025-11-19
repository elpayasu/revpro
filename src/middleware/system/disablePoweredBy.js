module.exports = function (app) {
  if (app && typeof app.disable === 'function') app.disable('x-powered-by');
};
