# React POC using Babel with Gulp

Starter code for transpiling ES2015 (including modules) with Babel, Gulp and Browserify.
POC app using React with basic patterns.
Gulp is used to bundle the files.


## Installing

1. Clone the repo
2. `npm install -g gulp` to install Gulp globally.
3. `npm install` to resolve project dependencies or use `npm rebuild` if
dependencies break.
4. install `bower`, `npm i bower` for front-end dependencies.

## Using

### Development
Run `npm start` from the command line and you are good to go!</br>
Opens up on port `:3001`
The project is currently setup to transpile code under the _/src_ folder using the _/src/app.js_ file as an entry point.
Our resulting code ends up in the `public` directory.

### Serving static assets
Run `gulp serve` to bundle the assets.

## Deploy

Static app is deployed [Robot-App](loose-bite.surge.sh/)

## Improvements
 - Add npm scripts for building and deploying the app
 - Add unit tests
