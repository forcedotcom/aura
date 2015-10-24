Aura Performance Framework
==========================

The Aura Performance Framework will allow you to measure and analyze the performance of your Aura components and applications in an automated, modular and scalable way.

You will be able to programatically obtain all metrics available from Aura, the browser and the server side.

How it works
------------

In a nutshell, the framework uses `Selenium` to run a given component in a *special* application that will instrument and collect all the metrics both on the client and on the server. Once it finishes, all collected data is parsed, analyzed and stored for further analysis.

We will go into more details about how everything works in the followings sections.


### The perf runner - *performance:runner.app*

We will use `runner.app` as a sandbox, to load an arbitrary component, isolate execution, and prepare everything before and after running the component logic.

In Aura, you can programatically load any application or component just typing its namespace and name in the URL, then we can pass any attribute as regular parameters and even a `#` string for more parametrization.

Let's see an example of a URL for running the perf framework:

```
http://localhost:9090/performance/runner.app?aura.mode=STATS#{"componentDef":"markup://performanceTest:runnerExample"}
```

Now we will see in detail what happens when we load that URL and what's the app and component lifecycle.


#### Perf Runner execution flow

Once the browser loads the application, this is what the `runner.app` will try do:

 + Parse the URL
    + Get the configuration and options
    + Get the component definition to load
 + **Load** the component def from the server
 + **Setup** the component and do the necesary preparation logic.
    + Creates the component
    + Setup the environment variables and data on the component.
 + **Run** the component test and its logic
    + Start metric collection
    + Run component logic
    + End metric collection
 + **Postprocess** the results, send them to the server and finish the test

The **words highlighted** previously represent the lifecycle phases of the test. 

In order for you to have control over what happens and when, your component will have to implement certain interface and methods, which we will cover in the next section. 

It's important to note that normally, the component that you will load into this application, will be a wrapper for the real component you want to test, precisely because of this lifecycle hooking points. Let's dive into this with some real examples.

### Component performance test

The runner will load, create, render and execute some actions on a given component via URL. Let's say for example we want to test the performance of `ui:autocomplete`. 

It could seem obvious at first, that we just need to pass the autocomplete definition in the URL with some parameters so the runner will load it, but what if we want to pass some data to it? What if we need to do some preparation or go to the server before creating or rendering the component? 

Most of the time, loading the component itself won't be enough for your testing, and that why we need to create a wrapper component, following an interface with some specific methods that the runner can call.

#### Creating a component perf test

There are two basic rules to make a component available to the performance framework:

- Components must be under a namespace which ends in `*PerformanceNamespace`
    - Namespace examples: 
        - auraPerformanceTest
        - forcePerformanceTest


- Components must extend from `performance:perfTest`

```
<aura:component extends="performance:perfTest">
    ...
</aura:component>
```

Once you create your new component in its corresponding perf namespace, you are ready to run it. The next step will be implementing the methods for the runner to hook into.

#### Component lifecycle

When your component extends from `performance:perfTest` what really is doing is implementing the interface `performance:test` (the reason we use extension is because by want all the methods to have a default implementation.

This is the interface of `performance:test` and te methods and signatures we will need:

```
<aura:interface>

    <aura:method name="setup">
        <aura:attribute name="done" type="Object"/>
    </aura:method>

    <aura:method name="run">
        <aura:attribute name="done" type="Object"/>
    </aura:method>

    <aura:method name="postProcessing">
        <aura:attribute name="results" type="Object"/>
    </aura:method>

    <aura:registerEvent name="finish" type="performance:testFinish"/>

</aura:interface>

```

#### Setup

The setup phase is for your component to load any set any attribute or configuration it needs.

Once the `perfRunner.app` creates your component, it will call setup on your component passing a done object.

Because the setup may contain asyncronous code, you need to explicily tell the framework when the setup is done.

Asyncronous setup:
```
setup: function (cmp, event, helper) {
    // Get the done arguments passed by the perf framework
    var done = event.getParam('arguments').done;

    // Tell the framework setup will be async
    var finishSetup = done.async(); //function to call once setup is done

    MyAsyncCall(function () {
        finishSetup(); // We are done with setup
    });
}

```

Syncronous setup:

```
setup: function (cmp, event, helper) {
    // Get the done arguments passed by the perfFramework
    var done = event.getParam('arguments').done;

    // Do something syncronously
    cmp.set('v.foo', 'bar');

    done.immediate(); // We are done with the setup
}
```

#### Run

...