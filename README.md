# RAML

## Overview

This application provides a simple storage API plus a persistence plugin which enables you to run the [RAML API Designer](https://github.com/mulesoft/api-designer) locally (rather than use the APIHub cloud service) and still be able to manage and collaborate on your design.

Its basically a combo of the current [raml-store project](https://github.com/brianmc/raml-store) and the [RAML API Designer](https://github.com/mulesoft/api-designer) files from the dist folder served on one instance of express.

No need to configure any files or run any grunt tasks.

The beta mock service does not work yet.

## Requirements
The service is built with node.js, using express and mongodb.

### Installing Node.js
Go to [nodejs.org](http://nodejs.org), and click the Install button.

### Installing Node.js via package manager (Debian, Ubuntu, etc.)
View instructions [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

### Installing MongoDB
To install MongoDB on your specific platform, refer to the [MongoDB QuickStart](http://docs.mongodb.org/manual/installation/).

To start mongodb as background process:

`cd /usr/local/mongodb`  (mongodb installation directory)

`mongod --fork --logpath /var/log/mongodb.log`

### Installing Express and MongoDB Node.js Driver
From the top-level directory (e.g. raml-store-with-api-designer):

`npm install `

## Running the Service
From the top-level directory (e.g. raml-store-with-api-designer):

`node server.js`

If you prefer to run the server in the background [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever) is awesome. 

`npm install forever`

`forever start server.js`

## Testing the Service

```
$ curl -i -X POST -H 'Content-Type: application/json' -d 
'{"name":"test.raml","path":"/test.raml","contents":"#%25RAML%200.8%0Atitle:%20%20%20DONE!!!"}' 
http://localhost:3000/files
```

`$ curl -i -X GET http://localhost:3000/files`

## Running API Designer
After starting the express server you can see the API Designer here: http://localhost:3000

If you set a PORT environment variable to another value, the app will run on that port, i.e.:

`export PORT=80`

