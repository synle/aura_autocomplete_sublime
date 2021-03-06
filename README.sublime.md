### Salesforce Aura (Lightning)  Autocomplete for Sublime Text 3 [![Build Status](https://travis-ci.org/synle/aura_autocomplete_sublime.svg?branch=master)](https://travis-ci.org/synle/aura_autocomplete_sublime)

#### Install on Sublime Text 3
```
	sh install.sublime.sh
```

#### Instruction Sublime Text 3
You can hit tab to select the completion as well as navigate through parameters


#### Cheatsheet
Please note that anything in {} and - is optional. Instead of attr-ui-menuitem-select, you can simply replace it with attruimenuitemselect. Also you can also skip the component name and type it as attr-menuitem.

Trigger | Example | Description
------- | ------- | -----------
`evt-{COMPONENT_NAME}-{EVENT_NAME}` | **`evt-search`** | Autocomplete for events
`helper-{COMPONENT_NAME}-{HELPER_METHODS}` | **`helper-ui-panel-show`** | Autocomplete for component helpers
`$a-test-{TEST_METHOD_NAME}` | **`$A.test.assertTru`** | All Test.js functions
`$a-util-{UTIL_METHOD_NAME}` | **`$A-util-getbool`** | All Util.js functions
`{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}` | <a **`attr-ui-menuitem-select`** | all Aura tag attributes
`{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}` |  <**`tag-ui-inputtext`** | All Aura tag names





#### To autocomplete an Aura event type
```
	Trigger:
	evt-{COMPONENT_NAME}-{EVENT_NAME}

	Example:
	evt-search


	Outcome:
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
![](images/evt1.jpg)
![](images/evt2.jpg)


#### To autocomplete an Aura Test js method
```
	Trigger:
	$a-test-{TEST_METHOD_NAME}

	Example:
	$A.test.assertTru

	Output:
		You should get this
			$A.test.assertTruthy(condition,assertMessage)
```


#### To autocomplete an Util Test js method
```
	Trigger:
	$a-util-{UTIL_METHOD_NAME}

	Example:
	$A-util-getbool

	Output:
		You should get this
			$A.util.getBooleanValue(val)
```
![](images/util1.jpg)
![](images/util2.jpg)


#### To autocomplete an aura attribute
```
	Trigger:
	inside a tag
	attr-{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}


	Example:
		<a attr-ui-menuitem-select

	Output:
		You should get: this will show which component is suggested along with its value
			<a menuItem="ui:menuItem(Boolean)"
```	
![](images/attribute1.jpg)
![](images/attribute2.jpg)




#### To autocomplete an aura attribute
```
	Trigger:
	inside a tag
	tag-{NAMESPACE}-{COMPONENT_NAME}-{ATTRIBUTE_NAME}

	Example:
	<tag-ui-inputtext

	Output:
		You should get: this will show which component is suggested along with its value
			<ui:inputText>
				Implements ui:inputTextComponent.
				Represents an input field suitable for entering a single line of free-form text.
			</ui:inputText>
```	
![](images/tag1.jpg)
![](images/tag2.jpg)
