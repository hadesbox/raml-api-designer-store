# RAML API Designer with spices

This is a modified version of the raml API Designer Store (https://github.com/brianmc/raml-store) which is a modified version of the official API Designer by Mulesoft, so it can be hosted with a user authentication and filters with raml files owned by each user.


### Kicking it!!!

remember you must have a runing mongodb in the same machine, so the whole project works.

to install simply do a __npm install__ after you have cloned the repo.

to start the API Designer you must __node server.js__,
to start the REST RAML service (to serve file thru HTTP) you must __node http-mongo.js__, (which also works as proxy to your final API).


#### API Designer (http://localhost:3000)

In port 3000 you will have the API Designer, with user login. This version of the API Designer uses Mongo to persist all RAML Documents and other data rather than the browser's local storage. This means that you need to insert a new user into the "users collection" to be able to login.

To do this you must first manually generate your unsalted password hash with SHA1:
```
luis@boxita:~$ echo -n mypass | openssl sha1
(stdin)= e727d1464ae12436e899a726da5b2f11d8381b26
```

and then insert it into mongo "users" collection, remember to set the "admin" flag to true and the "team". If you are admin you will see all documents in the files collection regarless of ownership, if you are not admin, you will see documents which you own plus documents that share the "team" value with you, so its important to set the team property to a single string (currently only single teams its supported... to not complicate the management of teams)

```
luis@boxita:~$ mongo
MongoDB shell version: 2.4.10
connecting to: test
> use ramldb;
switched to db ramldb
> db.users.insert({"mail":"hadesbox", "pass":"e727d1464ae12436e899a726da5b2f11d8381b26"}, "admin": true, "team": "blue", "projects": ["project1", project2]);
> db.users.find()
{ "_id" : ObjectId("1111111111111111"), "mail" : "hadesbox@gmail.com", "pass" : "e727d1464ae12436e899a726da5b2f11d8381b26", "admin": true, "team": "blue", "projects": ["project1", project2] }

> db.users.insert({"mail":"plancton", "pass":"e727d1464ae12436e899a726da5b2f11d8381b26"}, "admin": false, "team": "blue", "projects": ["project1", project2]);
> db.users.find()
{ "_id" : ObjectId("2222222222222222"), "mail" : "hadesbox@gmail.com", "pass" : "e727d1464ae12436e899a726da5b2f11d8381b26", "admin": false, "team": "blue", "projects": ["project1", project2] }

> 
```

On the current version you will  have a combobox on the top of your API Designer, so you can select and switch between projects. The projects are just natural way to group several files that are related to a single API, if you create a file (RAML, JSON, XML, YAML) inside a a particular project of the designer, then it will be editable to users that have that project on the "projects" array in the mongo users collection.

![API Designer login page](http://i.imgur.com/HQwtye2.png)

By default the user "user" with pass "admin" is created. It has 3 projects, you should edit/change this password and add any projects you need.

I removed the restriction of the codemirror so you can pretty much name your RAML whatever you feel (doesn't need to have the .raml extension anymore), the codemirror will still look for the RAML header in the __content__ of each document and if its a RAML it will enable the the side bar helpers.

You should include (if you want) the JSON/XML examples, YAML files for documentation etc on this Designer so all files rest in your mongodb, and can be served on the same REST interface (see bellow).


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

To start the Api Designer you can __forever start server.js__.

The mongo REST publisher (for the API Console and the proxy) is not started automatically so if you want it you should __forever start mongo-http.js__.


#### HTTPS

If you want to (you should) deploy this app over HTTPS use Apache as proxyReverse with your certs.


#### Admin Tool.

The way to administrate the users in the mongodb "users" collection is thru the admin tool provided in the admintool/ramladmin. This tool is a python CLI tool, so first we need to install its dependencies.

'''
$ sudo pip install -r admintool/requirements.txt
'''

then we will be able to use the tool which has the 8 most frequent operations you will need to do with users.
'''

[luix@boxita admintool]$ ./ramladmin 
usage: ramladmin [-h] {copy,list,clear,add,rm,show,changepass,setadmin} ...

positional arguments:
  {copy,list,clear,add,rm,show,changepass,setadmin}
                        sub-command help
    copy                copy a user
    list                list users currently in the Api Designer DB.
    clear               deletes all projects from a user.
    add                 adds a project to one or serveral users.
    rm                  removes a project from one or several users.
    show                shows user details.
    changepass          change the password for a existing user.
    setadmin            change the password for a existing user.

optional arguments:
  -h, --help            show this help message and exit
[luix@boxita admintool]$
'''

this tool will take care of connecting to the local mongo and make all proper changes to the documents in the users collection, if you want it to be a global command just add it to your $PATH.