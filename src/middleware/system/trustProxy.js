module.exports = function (app) {
  if (app && typeof app.set === 'function') app.set('trust proxy', true);
};
