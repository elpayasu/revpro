const patterns = [ /\b(select|union|insert|delete|update|drop)\b/i, /<script\b/i, /\b(eval|system|exec)\b/i, /\.\./i ];

function inspect(req) {
  const ua = req.headers['user-agent'] || '';
  if (/curl|nikto|sqlmap/i.test(ua)) return true;
  const raw = (req.rawBody && req.rawBody.toString('utf8')) || '';
  const target = `${req.url} ${raw} ${ua}`;
  for (const p of patterns) if (p.test(target)) return true;
  return false;
}

module.exports = { inspect };
