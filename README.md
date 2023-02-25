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
  POST   | /user
  POST   | /user/token
  GET    | /user/:username
  GET    | /validate
  PUT    | /user
  DELETE | /user/:id
+--------+-------------------------+

# pin routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /pin
  GET    | /pin/:id
  GET    | /pins
  PUT    | /pin/:id
  DELETE | /pin/:id
+--------+-------------------------+

# board routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /board
  GET    | /boards/:username
  DELETE | /board/:id
+--------+-------------------------+

# comment routes
+--------+-------------------------+
  Method | URI
+--------+-------------------------+
  POST   | /pin/
  GET    | /pin/:id/comments
  DELETE | /pin/:id/comment/:commentId
+--------+-------------------------+

```

# Author

João Marcos C. Ferreira - Code and Documentation [Linkedin](https://www.linkedin.com/in/joao-mcf/)
