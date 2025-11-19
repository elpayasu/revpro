function sanitize(req) {
  const remove = ['proxy-authorization', 'x-aws-ec2-metadata-token', 'x-amzn-trace-id'];
  remove.forEach(h => { if (req.headers[h]) delete req.headers[h]; });
}
module.exports = { sanitize };
