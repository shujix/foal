# MongoDB (noSQL)

> You are reading the documentation for version 2 of FoalTS. Instructions for upgrading to this version are available [here](../upgrade-to-v2/README.md). The old documentation can be found [here](https://github.com/FoalTS/foal/tree/v1.x/docs).

## Creating a new project

To generate a new project that uses MongoDB, run the command `createapp` with the flag `--mongodb`.

```
foal createapp my-app --mongodb
```

## Configuration

```
npm install mongodb
```

{% code-tabs %}
{% code-tabs-item title="YAML" %}
```yaml
database:
  type: mongodb
  url: mongodb://localhost:27017/test-foo-bar
```
{% endcode-tabs-item %}
{% code-tabs-item title="JSON" %}
```json
{
  "database": {
    "type": "mongodb",
    "url": "mongodb://localhost:27017/test-foo-bar"
  }
}
```
{% endcode-tabs-item %}
{% code-tabs-item title="JS" %}
```javascript
module.exports = {
  database: {
    type: "mongodb",
    url: "mongodb://localhost:27017/test-foo-bar"
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Defining Entities and Columns

> More documentation here: https://github.com/typeorm/typeorm/blob/master/docs/mongodb.md.

The definition of entities and columns is the same as in relational databases, except that the ID type must be an `ObjectID` and the column decorator must be `@ObjectIdColumn`.

```typescript
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class User {
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column()
    firstName: string;
    
    @Column()
    lastName: string;
    
}
```

*Example*
```typescript
import { getMongoRepository } from 'typeorm';

const user = await getMongoRepository(User).findOne('xxxx');
```

## Authentication

### The `fetchMongoDBUser` function

*user.entity.ts*
```typescript
import { Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {

  @ObjectIdColumn()
  id: ObjectID;

}
```

*Example with JSON Web Tokens*:
```typescript
import { JWTRequired } from '@foal/jwt';
import { fetchMongoDBUser } from '@foal/typeorm';

import { User } from '../entities';

@JWTRequired({ user: fetchMongoDBUser(User) })
class MyController {}
```


### The `MongoDBStore`

```
npm install @foal/mongodb
```

If you use sessions with `@UseSessions`, you must use the `MongoDBStore` from `@foal/mongodb`. **The `TypeORMStore` does not work with noSQL databases.**

## Limitations

When using MongoDB, there are some features that are not available:
- the `foal g rest-api <name>` command,
- and the *Groups & Permissions* system.

