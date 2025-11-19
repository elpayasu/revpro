function blocked(req) {
  const sig = req.headers['x-malicious-signature'];
  return !!sig;
}
module.exports = { blocked };
