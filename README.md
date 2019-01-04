# Component Markup language

CML is a markup language for describing Single Page Applications.

See __[Here](https://nocturn.io/doc)__ for more information.

## Goals

* make frontend development easier and accessible to all manner of programmers
* make UI creation standardized
* Be in between frameworks and wordpress in complexity
* consolidate UI libraries
* reduce duplication of code

## Design

* process model
    * instance based: append to container, ie Card
    * singleton based: replace in container, ie Modal, NavBar, SideNav
* dependency injection
* erlang inspired runtime
* qml inspired syntax
* works with any javascript library via plugins

## How to contribute

* help out with documentation
* help with tests
* help with commenting and code cleanliness
* contact me allen@nocturn.io


## Getting Started

* with the CLI, noct
* with the online editor nocturn.io
* as a npm module

## Components
* components are the building blocks of your Application
* components encapsulate reusable UI concepts
* examples are Button, Chart, TextField

## Modules
* Modules are containers for your components
* Examples are Card, Modal, NavBar
* Modules also serve as contexts for context specific components

## Events and Refresh
* Refreshing properties
* manual refresh cycle
* module events
* component events

## API

### JS context

* for adding new components and modules to CML

| Name | Description |
| ----- | ------- |
| cml.extract | |
| cml.addComponent(component) | |
| cml.addModule(module) | |
| cml.addTest(componentTest) | |
| cml.addTestModule(moduleTest) | |
| cml.getModule(moduleName) | |
| cml.getComponent(componentName, moduleName) | |
| cml.getTest(componentName, moduleName) | |
| cml.getTestModule(moduleName) | |
| cml.getTestResults() | |
| cml.createComponent(p, parent, componentName, moduleName) | |
| cml.createMapItems(p, parent, el, componentName, moduleName) | |
| cml.logTestResults() | |


### CML context

| Name | Description |
| ------ | ----------- |
| cml.new(name, param, ...) | Load a new Module into memory and UI. Parameters determined by Module definition |
| cml.modules() | Get an array of all currently loaded modules. |
| cml.get(moduleName) | Get an array of modules of moduleName. |
| cml.getFirst(moduleName)  | Get first matching module of moduleName. |
| cml.say(message) | Display a toast with message on it |
| cml.error(message) | Display an error toast with message on it |
| cml.refresh() | Refresh UI. All refreshable properties will set to newest state. |
| cml.setLocation(url) | Set url location. If url does not match a Router, a page load will occur. |
| cml.show(pageName) | Show specified page. All other pages will be hidden. |
| cml.currentPage | Last page shown using cml.show |
| cml.init({ loader: animation }) | Initializes cml runtime. Must be called in load of start module. |
