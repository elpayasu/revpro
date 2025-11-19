const blockedSignatures = [
  'x-malicious-signature',
  'evil-header',
  /^x-bad-.*$/i
];

function blocked(req) {
  const headers = req.headers || {};

  for (const sig of blockedSignatures) {
    if (typeof sig === 'string') {
      if (headers[sig]) return true;
    } else if (sig instanceof RegExp) {
      for (const h of Object.keys(headers)) {
        if (sig.test(h)) return true;
      }
    }
  }

  return false;
}

module.exports = { blocked };
