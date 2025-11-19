const dns = require('dns');

function resolve(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { all: true }, (err, addresses) => {
      if (err) return reject(err);
      resolve(addresses.map(a => a.address));
    });
  });
}

module.exports = { resolve };
