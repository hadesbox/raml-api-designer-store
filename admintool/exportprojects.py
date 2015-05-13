#!/usr/bin/python
# demo.py - CMD Args Demo By nixCraft
import sys
import pymongo
import html.parser
import os
import urllib

html_parser = html.parser.HTMLParser()

from pymongo import MongoClient

client = MongoClient()

db = client.ramldb

#files = db.files.find({"path" : "/ovr/inversion-calc/1.raml"})
files = db.files.find({})
counter=0

print("exporting files",end="")
for doc in files:
    print(".",end="")
    doc["path"]
    directory = "/tmp/projects/"+doc["project"]+os.path.dirname(doc["path"])
    if not os.path.exists(directory):
        os.makedirs(directory)
    #print(doc["path"])
    try:
        with open("/tmp/projects/"+doc["project"]+doc["path"],'w+') as f:
            f.write(urllib.parse.unquote(doc["content"]))
            counter+=1
    except:
        print("\nERROR: failed to write file ","/tmp/projects/"+doc["project"]+doc["path"])

print("\nall done, create a total of", counter, "files")