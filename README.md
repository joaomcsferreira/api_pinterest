# About

```
Pinterest Clone backend in Express Typescript.
```

<img alt="express-typescript" src="https://geekyants.github.io/express-typescript/public/images/express-typescript.png" height="50%" width="60%">

# Contents

- [Global requisites](#global-requisites)
- [Getting started](#getting-started)
- [Installation and configuration](#installation-and-configuration)
- [List of routes](#list-of-routes)
- [Author](#author)

# Global requisites

- node
- tsc
- mongodb

# Getting started

Below mentioned are the steps to install, configure and run this app.

## Installation and configuration

```bash
# clone the project.
https://github.com/Joao-MCF/api_pinterest.git

# enter the cloned directory.
cd api_pinterest
```

```bash
# You need have MongoDB running in the background and you have created the database.
npm install

# You need edit you archive .env using any editor.
# You Should add all the configurations details or else default values will be used.
vim .env

# compile the app and run.
npm run compile
npm start
```

## List of routes

```bash
# user routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /api/v1/user
  POST   | /api/v1/user/token
  GET    | /api/v1/user/:username
  GET    | /api/v1/validate
  PUT    | /api/v1/user
  DELETE | /api/v1/user/:id
+--------+-------------------------+

# pin routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /api/v1/pin
  GET    | /api/v1/pin/:id
  GET    | /api/v1/pins
  PUT    | /api/v1/pin/:id
  DELETE | /api/v1/pin/:id
+--------+-------------------------+

# board routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /api/v1/board
  GET    | /api/v1/user/:id/boards
  DELETE | /api/v1/board/:id
+--------+-------------------------+

# comment routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /api/v1/pin/:id/comments
  GET    | /api/v1/pin/:id/comments
  DELETE | /api/v1/pin/:id/comments
+--------+-------------------------+

```

# Author

João Marcos C. Ferreira - Code and Documentation [Linkedin](https://www.linkedin.com/in/joao-mcf/)
