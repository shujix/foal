# Limit Repeated Requests

> You are reading the documentation for version 2 of FoalTS. Instructions for upgrading to this version are available [here](../upgrade-to-v2/README.md). The old documentation can be found [here](https://github.com/FoalTS/foal/tree/v1.x/docs).

To prevent brute force attacks or overloads on your application, you need to implement a rate limiter to limit the number of requests a user is able to send to your application.

In FoalTS you can implement a rate limiter like the [express-rate-limit](https://github.com/nfriedly/express-rate-limit) package by creating a customized `express` object and passing it as a parameter to the FoalTS `createApp` function.

> Note: Because the rate limiter response for rate limited requests does not get handled by FoalTS and its hooks, you need to manually set the default FoalTS headers to the response object of the rate limiter in its `handle` function.
> If you don't manually set any headers only the default Express.js headers will be set in the response.

*src/index.ts*
```typescript
// std
import * as http from 'http';

// 3p
import { Config, createApp } from '@foal/core';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';

// App
import { AppController } from './app/app.controller';

async function main() {
  // Connection to the database(s)...
    
  const expressApp = express();
  expressApp.use(rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    handler: function (req, res, next) {
      // Set default FoalTS headers to the response of limited requests
      res.removeHeader('X-Powered-By');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
      
      // Send the response with the default statusCode and message from rateLimit
      res.status(this.statusCode).send(this.message);
    }
  }));
    
  const app = await createApp(AppController, { expressInstance: expressApp });
    
  const httpServer = http.createServer(app);
  const port = Config.get('port', 'number', 3001);
  httpServer.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
}

main();
```


## Rate limiting with CORS

If you need CORS headers in a rate limited response, you will need to manually add the headers in the rate limiter `handler` function accordingly.

```typescript
expressApp.use(rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  handler: function (req, res, next) {
    // Set default FoalTS headers to the response of limited requests
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      // You may want to allow other headers depending on what you need.
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, PATCH, DELETE');
    }

    // Send the response with the default statusCode and message from rateLimit
    res.status(this.statusCode).send(this.message);
  }
}));
```

You can find more options for [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) in the [documentation](https://github.com/nfriedly/express-rate-limit).
