# Logging & Debugging

> You are reading the documentation for version 2 of FoalTS. Instructions for upgrading to this version are available [here](../upgrade-to-v2/README.md). The old documentation can be found [here](https://github.com/FoalTS/foal/tree/v1.x/docs).

## HTTP Request Logging

FoalTS uses [morgan](https://www.npmjs.com/package/morgan) to log the HTTP requests. You can specify the output format using the environment variable `SETTINGS_LOGGER_FORMAT` or the `config/default.json` file:

{% code-tabs %}
{% code-tabs-item title="YAML" %}
```yaml
settings:
  loggerFormat: tiny
```
{% endcode-tabs-item %}
{% code-tabs-item title="JSON" %}
```json
{
  "settings": {
    "loggerFormat": "tiny"
  }
}
```
{% endcode-tabs-item %}
{% code-tabs-item title="JS" %}
```javascript
module.exports = {
  settings: {
    loggerFormat: "tiny"
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Disabling HTTP Request Logging

In some scenarios and environments, you might want to disable http request logging. You can achieve this by setting the `loggerFormat` configuration option to `none`. 

{% code-tabs %}
{% code-tabs-item title="YAML" %}
```yaml
settings:
  loggerFormat: none
```
{% endcode-tabs-item %}
{% code-tabs-item title="JSON" %}
```json
{
  "settings": {
    "loggerFormat": "none"
  }
}
```
{% endcode-tabs-item %}
{% code-tabs-item title="JS" %}
```javascript
module.exports = {
  settings: {
    loggerFormat: "none"
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Disabling Error Logging

In some scenarios, you might want to disable error logging (error stack traces that are displayed when an error is thrown in a controller or hook). You can achieve this by setting the `allErrors` configuration option to false. 

{% code-tabs %}
{% code-tabs-item title="YAML" %}
```yaml
settings:
  allErrors: false
```
{% endcode-tabs-item %}
{% code-tabs-item title="JSON" %}
```json
{
  "settings": {
    "allErrors": false
  }
}
```
{% endcode-tabs-item %}
{% code-tabs-item title="JS" %}
```javascript
module.exports = {
  settings: {
    allErrors: false
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Logging Hook

FoalTS provides a convenient hook for logging debug messages: `Log(message: string, options: LogOptions = {})`.

```typescript
interface LogOptions {
  body?: boolean;
  params?: boolean;
  headers?: string[]|boolean;
  query?: boolean;
}
```

*Example:*
```typescript
import { Get, HttpResponseOK, Log } from '@foal/core';

@Log('AppController', {
  body: true,
  headers: [ 'X-CSRF-Token' ],
  params: true,
  query: true
})
export class AppController {
  @Get()
  index() {
    return new HttpResponseOK();
  }
}
```

## Advanced Logging

If you need advanced logging, you might be interested in using [winston](https://www.npmjs.com/package/winston), a popular logger in the Node.js ecosystem.

Here's an example on how to use it with Foal:

*LoggerService*
```typescript
import * as winston from 'winston';

export class LoggerService {
  private logger: any;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs.txt'
        })
      ]
    });
  }

  info(msg: string) {
    this.logger.info(msg);
  }

  warn(msg: string) {
    this.logger.warn(msg);
  }

  error(msg: string) {
    this.logger.error(msg);
  }

}

```

*LogUserId hook*
```typescript
import { Hook } from '@foal/core';
// LoggerService import.

export function LogUserId() {
  return Hook((ctx, services) => {
    const logger = services.get(LoggerService);
    logger.info(`UserId is: ${ctx.user.id}`);
  });
}

```

*ProductController*
```typescript
import { Get } from '@foal/core';
// LogUserId import.

export class ProductController {

  @Get('/')
  @LogUserId()
  readProducts() {
    ...
  }

}

```

*AuthController*
```typescript
import { dependency, Post } from '@foal/core';
// LoggerService import.

export class AuthController {
  @dependency
  logger: LoggerService;

  @Post('/signup')
  signup() {
    ...
    this.logger.info('Someone signed up!');
  }

}

```