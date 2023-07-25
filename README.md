# About

Pinterest Clone backend in Express Typescript. You can access it by following this [API Pinterest](https://pinterest-clone-api.onrender.com/).

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

### User routes

```http
POST /user
```
```http
POST /user/token
```
```http
GET /user/:username
```
```http
GET /validate
```
```http
PUT /user
```
```http
PUT /follow
```
```http
PUT /unfollow
```
```http
DELETE /user/:id
```

### Pin routes

```http
POST /pin
```
```http
GET /pin/:id
```
```http
GET /pins?type=type&board=board&user=user
```
```http
PUT /pin/:id
```
```http
DELETE /pin/:id
```

### Board routes

```http
POST /board
```
```http
GET /boards/:username
```
```http
DELETE /board/:id
```

### Comment routes

```http
POST /pin/
```
```http
GET /pin/:id/comments
```
```http
DELETE /pin/:id/comment/:commentId
```

# Author

João Marcos C. Ferreira - Code and Documentation [Linkedin](https://www.linkedin.com/in/joao-mcf/)
