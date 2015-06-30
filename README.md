# Salesforce Aura (Lightning)  Autocomplete for Sublime Text 3 [![Build Status](https://travis-ci.org/synle/aura_autocomplete_sublime.svg?branch=master)](https://travis-ci.org/synle/aura_autocomplete_sublime)

## To Compile the autocomplete from Aura github
```
   #download and install node
   #if you use home brew
   brew install node

   #run this
   npm install 

   #make sure you sync up all the submodule (Salesforce Aura module)
   #might only be needed on the first run
   git submodule init
   #to pull latest and greatest
   git submodule update --recursive

   #to run in a guided mode
   npm start
   
   #to run in silent mode, please provide the base dir
   node generateJsAutoComplete.js /Users/sle/git/aura;
   node generateXmlAutoComplete.js /Users/sle/git/aura;

   #install it on local
   sh install.sublime.sh
```
![](images/generate.jpg)



## Installation:
+ [Sublime Text 3 Instruction](https://github.com/synle/aura_autocomplete_sublime/blob/master/README.sublime.md)

## Screenshots:
![](images/evt1.jpg)
![](images/evt2.jpg)
