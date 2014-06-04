# RAML API Designer with spices

This is a modified version of the raml API Designer, so it can be hosted with a user authentication and filters with raml files owned by each user.


### Kicking it!!!

remember you must have a runing mongodb in the same machine, so the whole project works.

to install simply do a __npm install__ after you have cloned the repo.

to start the API Designer you must __node server.js__, this will launch 2 services.


#### API Designer (http://localhost:3000)

In port 3000 you will have the API Designer, with user login. This version of the API Designer uses Mongo, to persist all RAML Documents and other data rather than the browser's local storage. This means that you need to insert a new user into the "users collection" to be able to login.

To do this you must first manually generate your unsalted password hash with SHA1:
```
luis@boxita:~$ echo -n mypass | openssl sha1
(stdin)= e727d1464ae12436e899a726da5b2f11d8381b26
```

and then insert it into mongo "users" collection
```
luis@boxita:~$ mongo
MongoDB shell version: 2.4.10
connecting to: test
> use ramldb;
switched to db ramldb
> db.users.insert({"mail":"hadesbox@gmail.com", "pass":"e727d1464ae12436e899a726da5b2f11d8381b26"});
> db.users.find()
{ "_id" : ObjectId("538ee9ff9707c7c00bc7d50c"), "mail" : "hadesbox@gmail.com", "pass" : "e727d1464ae12436e899a726da5b2f11d8381b26" }
> 
```

Then you will be able to login and create RAML documents as normal

![API Designer login page](http://i.imgur.com/HQwtye2.png)

All RAML documents can only be edited by its owner, which is the user that created the RAML file.

Also I removed the restriction of the codemirror so you can pretty much name your RAML whatever you feel (doesn't need to have the .raml extension anymore), the codemirror will still look for the RAML header in the __content__ of each document and if its a RAML it will enable the the side bar helpers.


#### RestAPI Publisher with CORS (http://localhost:10000/YOURAPI)

This service will publish all the Raml files in an easy to access rest format, so they can be referenced in the API Notebook, API Console etc... the reason for making them public, is that we WANT everyone to know our RAML API implementations, there is no need to have hidden RAML so if the APIs integrators want to have access to the RAML source file, they can do it!

Lets say your raml file in the API Designer its called __myapi__, 

![RAML Rest service with CORS](http://i.imgur.com/rsWPtgz.png)

this means you will have your Raml file publicly available at http://localhost:10000/myapi

![RAML Rest service with CORS](http://i.imgur.com/pY15BWO.png)


This is very convenient also to extract JSON/XML examples or schemas into separate files, lets say you want extract this schema

![RAML Rest service with CORS](http://i.imgur.com/s0brwb8.png)

into a separate file called __myapi/song.schema.son__ (for convention we use this structure for naming schemas and examples, so we know later on to which RAML spec file it belongs).

![RAML Rest service with CORS](http://i.imgur.com/VrEiyEa.png)

And then you can use the __!include localhost:10000/myapi/song.schema.json__ on the schema property, this will make your RAML files more tidy.

![RAML Rest service with CORS](http://i.imgur.com/cmP4Fnj.png)


#### Installing on a server

You will need to have a mongo running on the server, and it can be easly daemonized with __forever start server.js__.
