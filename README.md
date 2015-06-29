Salesforce Aura (Lightning)  Autocomplete for Sublime Text 3
====

To Compile the autocomplete from Aura github
```
   #download and install node
   #if you use home brew
   brew install node

   #run this
   npm install 
   npm start	
```

Install on Sublime Text 3
```
	sh install.sublime.sh
```


Instruction Sublime Text 3
You can hit tab to select the completion as well as navigate through parameters
```
To autocomplete an Aura event type in
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


To autocomplete an Aura Test js methods
	$a-test-{TEST_METHOD_NAME}
	Example:
	$A.test.assertTru
	You should get this
		$A.test.assertTruthy(condition,assertMessage)


To autocomplete an Util Test js methods
	$a-util-{UTIL_METHOD_NAME}
	Example:
	$A-util-getbool
	You should get this
		$A.util.getBooleanValue(val)



To autocomplete an aura attribute
	inside a tag
	attr-{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}
	Example
		<a attr-ui-menuitem-select
	You should get: this will show which component is suggested along with its value
		<a menuItem="ui:menuItem(Boolean)"
```	




Install on Atom (WIP): for now this plugin supports Sublime Text 3
```
  CMD + SHIFT + P
  Type in "snippet"
  Copy and paste aura.snippet.cson to the file and save.
```
