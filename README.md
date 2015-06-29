# Salesforce Aura (Lightning)  Autocomplete for Sublime Text 3


## To Compile the autocomplete from Aura githu
```
   #download and install node
   #if you use home brew
   brew install node

   #run this
   npm install 
   npm start	
```

## Install on Sublime Text 
```
	sh install.sublime.sh
```


## Instruction Sublime Text 
You can hit tab to select the completion as well as navigate through parameters


## To autocomplete an Aura event type
![](images/evt1.jpg)
![](images/evt2.jpg)
```
	evt-{EVENT_NAME}
	Example:
	evt-search
	You should get 
		//component=inputSearch
        //evtName=search
        //evtType=ui:searchEvent
        //The event fired when the user runs a search.
        var e = cmp.find("inputSearch").get("e.search");
        e.setParams({
            type: "String",// The type of search event that was fired.
            context: "Object",// Context relevant to the search event that was fired.
            searchTerm: "String",// The term that was specified to search.
        });
        e.fire();
```

## To autocomplete an Aura Test js method
![](images/test1.jpg)
![](images/test2.jpg)
```
	$a-test-{TEST_METHOD_NAME}
	Example:
	$A.test.assertTru
	You should get this
		$A.test.assertTruthy(condition,assertMessage)
```


## To autocomplete an Util Test js method
![](images/util1.jpg)
![](images/util2.jpg)
```
	$a-util-{UTIL_METHOD_NAME}
	Example:
	$A-util-getbool
	You should get this
		$A.util.getBooleanValue(val)
```


## To autocomplete an aura attribute
![](images/attribute1.jpg)
![](images/attribute2.jpg)
```
	inside a tag
	attr-{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}
	Example
		<a attr-ui-menuitem-select
	You should get: this will show which component is suggested along with its value
		<a menuItem="ui:menuItem(Boolean)"
```	




## To autocomplete an aura attribute
![](images/tag1.jpg)
![](images/tag2.jpg)
```
	inside a tag
	tag-{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}
	Example
		
	You should get: this will show which component is suggested along with its value
		
```	




## Install on Atom (WIP): for now this plugin only supports Sublime Text 3
```
  CMD + SHIFT + P
  Type in "snippet"
  Copy and paste aura.snippet.cson to the file and save.
```
