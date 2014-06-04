# RAML API Designer with spices

=======================

This is a modified version of the raml API Designer, so it can be hosted with a user authentication and filters with raml files owned by each user.


### Kicking it!!!

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

All RAML documents can only be edited by its owner, which is the user that created the RAML file.

Also I removed the restriction of the codemirror so you can pretty much name your RAML whatever you field (doesn't need to have the .raml extension), the codemirror will still look for the RAML header, withing each document and if its a RAML it will enable the the helpers.
