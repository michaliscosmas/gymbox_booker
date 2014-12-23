# -*- coding: utf-8 -*-
"""
Created on Fri Dec 12 16:30:42 2014

@author: michalis_RAVN
"""
import urllib2
import json 
import uuid
import csv
import HTMLParser
import re

#inputFile = "Segment.csv"
inputFile = "Segment - test.csv"



def camelCase(s):
    if len(s) != 0:
        allCaps = re.compile(r'([A-Z][a-z]+)')
        tokens = allCaps.split(str(s))
        out=''
        for token in tokens:
            out = out + str(token).title()
        s = out[0].lower() + out[1:]
    return s

def CreateKeyString(field, value):
    #print "FIELD1:"+field
    if value == "":
        return "\"" + unicode(field) + "\"" + ":" + "\"\""
    elif isinstance(value, str):
        return "\"" + unicode(field) + "\"" + ":" + "\"" + unicode(value) + "\""    
    elif isinstance(value, int):
        return "\"" + unicode(field) + "\"" + ":" + unicode(value)
    elif isinstance(value, float):
        return "\"" + unicode(field) + "\"" + ":" + unicode(value)
    elif(isinstance(value, list)):
        return "\"" + unicode(field) + "\"" + ":" + "\"" + unicode(value[0]) + "\""
    else:
        return "\"" + unicode(field) + "\"" + ":" + "\"" + unicode(value) + "\""
    
coreURL = "http://localhost:11040/rest/api/v1_1/databases/ravn/items/"
pageSize = 10000000

def buildUuid(name):
    return str(uuid.uuid3(uuid.NAMESPACE_X500,name.encode("utf-8")))

def post(url, postData):
    print url + postData
    headers = { 'Content-Type' : 'application/json' }
    req = urllib2.Request(url, postData, headers)
    req.get_method = lambda: 'PUT'
    
    try:
        urllib2.urlopen(req)
    except urllib2.HTTPError as e:
        print e.code
        print e.read() 

def cleanValue(v):
    return v.encode('utf-8').strip()

def createItem(item_id,values):   
    global coreURL
    data =  "{" + ",".join(values) + "}"
    url = coreURL + item_id
    print url, data
    post(url, data)
    
def keyMap(key):
    map = {"product":"fullName",
           "productUrl":"msds"}
    if key in map:
        return map[key]
    return key
    
def addCustomFields(data):
    # copy product to full name
    
    return data 
    
with open(inputFile, 'rb') as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    h = HTMLParser.HTMLParser()
        
    for row in reader:
        data = []
        for key in row:
            currentKey = keyMap(camelCase(key))
            data.append(CreateKeyString( currentKey, h.unescape(row[key])  ))
                        
            if currentKey in "product":
                #calculate an ID for this product
                item_id = buildUuid(row[key])
                # get Grade/Brand (only from BRAND.csv)
        
        data = addCustomFields(data)
        print data,item_id
        createItem(item_id,data)
        
        
        