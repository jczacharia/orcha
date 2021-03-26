<h1 align="center">OrchaJS - A Typescript-Native Client-Server Facilitator</h1>
<p align="center">
  <i>OrchaJS provides a toolkit to safely, securely, and efficiently build scalable web apps requiring real-world domain modeling such as highly-relational data, user authentication, file uploading, pagination, and real-time updates. All while providing an unprecedented developer-experience.</i>
</p>

<hr>

## Features

- ✅ Type-safety between Client and Server
- ✅ Easy querying of highly-relational data
- ✅ Secure Endpoints and Queries
- ✅ Build-in pagination
- ✅ Singular and Multiple File Uploads
- ✅ Integration Testing
- ✅ Customizable User Authentication
- 🟩 <i>Realtime Subscriptions via WebSockets (Pending https://github.com/nestjs/nest/pull/5975)</i>

### Limitations

Since OrchaJS is written in Typescript, this means that only Typescript libraries and frameworks can be used. Also, since OrchaJS is a framework, it is best suited for new projects, and the current compatible technologies are limited to:

- Angular (Client)
- NestJS (Server)
- TypeORM (ORM)
- Nx (monorepository)

However, the essence of this framework is to share code between the frontend and backend thusly allowing for a robust code-base and auspicious developer-experience.

#### Creating an Orcha Query:

<img width="100%" height="100%" src="https://i.imgur.com/pteYMU4.gif">

# Todo Example App

## Steps to get setup:

1. Clone repository:

   ```sh
   https://github.com/jczacharia/orcha
   ```

2. Install Dependencies:

   ```sh
   cd orcha && npm install
   ```

3. Have a PostgreSQL instance running on `localhost:5432` (Environment variables found here: `libs/todo-example-app/shared/domain/src/lib/environments/environment.ts`)

   - Username: `postgres`
   - Password: `1Qazxsw2`
   - DB Name: `orcha-todo-example-app`

4. Open 2 terminals:

5. In Terminal 1, run the client (Angular):

   ```sh
   npx ng serve todo-example-app
   ```

6. In Terminal 2 run the server (Nestjs):

   ```sh
   npx ng serve api
   ```

7. Visit: http://localhost:4200
