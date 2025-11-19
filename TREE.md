## Folder Structure

```
RevPro/
│
├── package.json
├── README.md
├── index.js
├── cli.js
├── config/
│   ├── default.js
│   ├── production.js
│   └── development.js
│
├── src/
│   ├── core/
│   │   ├── ProxyEngine.js
│   │   ├── ServerEngine.js
│   │   ├── UpstreamManager.js
│   │   ├── SecurityManager.js
│   │   ├── MiddlewareLoader.js
│   │   ├── ErrorHandler.js
│   │   └── PluginSystem.js
│   │
│   ├── middleware/
│   │   ├── security/
│   │   │   ├── rateLimiter.js
│   │   │   ├── ipFilter.js
│   │   │   ├── basicAuth.js
│   │   │   ├── cors.js
│   │   │   └── bodyLimit.js
│   │   ├── logging/
│   │   │   └── requestLogger.js
│   │   └── system/
│   │       ├── trustProxy.js
│   │       └── disablePoweredBy.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── ip.js
│   │   ├── parseOptions.js
│   │   ├── validator.js
│   │   └── events.js
│   │
│   ├── network/
│   │   ├── healthChecker.js
│   │   ├── upstreamProbe.js
│   │   └── dnsResolver.js
│   │
│   ├── security/
│   │   ├── waf.js
│   │   ├── signatureBlocker.js
│   │   └── headerSanitizer.js
│   │
│   ├── types/
│   │   ├── options.d.ts
│   │   └── internal.d.ts
│   │
│   └── index.js
│
└── examples/
    ├── simple.js
    ├── multi-upstream.js
    ├── with-security.js
    └── plugin-example.js
```