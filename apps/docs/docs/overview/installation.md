---
title: Installation & Usage
---

First install the module via `yarn` or `npm` and do not forget to install the 
driver package as well:

> Since v4, we should install the driver package, but not the db connector itself,
> e.g. install `@mikro-orm/sqlite`, but not `sqlite3` as that is already included
> in the driver package.
```sh
yarn add @mikro-orm/core @mikro-orm/mongodb     # for mongo
yarn add @mikro-orm/core @mikro-orm/mysql       # for mysql/mariadb
yarn add @mikro-orm/core @mikro-orm/mariadb     # for mysql/mariadb
yarn add @mikro-orm/core @mikro-orm/postgresql  # for postgresql
yarn add @mikro-orm/core @mikro-orm/sqlite      # for sqlite
```

or

```sh
npm i -s @mikro-orm/core @mikro-orm/mongodb     # for mongo
npm i -s @mikro-orm/core @mikro-orm/mysql       # for mysql/mariadb
npm i -s @mikro-orm/core @mikro-orm/mariadb     # for mysql/mariadb
npm i -s @mikro-orm/core @mikro-orm/postgresql  # for postgresql
npm i -s @mikro-orm/core @mikro-orm/sqlite      # for sqlite
```

Next we will need to enable support for [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
as well as `esModuleInterop` in `tsconfig.json` via:

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true,
"esModuleInterop": true,
```