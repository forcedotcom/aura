## What is Aura?

Aura is an open-source UI framework built by Salesforce for developing dynamic web apps for mobile and desktop 
devices. You can use open-source Aura to build apps independent of Salesforce.

Salesforce uses Aura to build apps, such as Lightning Experience and Salesforce1. 

Salesforce customers use the Lightning Component framework to build Lightning components. The Lightning Component framework is built on the open-source Aura framework. However, the open-source Aura framework has some features that aren't available to Salesforce customers.

If you're a Salesforce customer, you'll get more relevant information and learn more by starting with the [Lightning Components Basics](https://trailhead.salesforce.com/en/modules/lex_dev_lc_basics) module in Trailhead. 

If you're interested in how Aura is architected, all the code is in this repo. Feel free to poke around.

## How Do I Develop with Aura?

Aura's architecture uses two key building blocks: components and events.
 
**Components** are the self-contained and reusable units of an app. They represent a reusable section of the UI, and can range in granularity from a single line of text to an entire app.

The framework includes a set of prebuilt components in the <code>aura</code> and <code>ui</code> namespaces. You can assemble and configure components to form new components in an app. Components are rendered to produce HTML DOM elements within the browser. 

Components communicate with other components by firing and handling **events**. The robust event model enables you to develop loosely coupled components. Once you define the events that interact with your components, your team can work on the components in parallel to quickly build a powerful app.

Aura also supports a powerful expression language, embedded testing, performance, and security features.

## How Do I Start?

The easiest way to build your first Aura app is from the command line, but you can easily use Aura
with your favorite IDE too.

**Note**: If you’re a Salesforce customer, we recommend that you build Lightning components or application as opposed to building an open-source Aura app. You'll greatly benefit from a lot of foundational architecture that makes it easy to customize Lightning Experience, Salesforce1, or other Lightning apps. If you're a Salesforce customer, you'll get more relevant information and learn more by starting with the [Lightning Components Basics](https://trailhead.salesforce.com/en/modules/lex_dev_lc_basics) module in Trailhead.

### Prerequisites

You need:

* JDK 1.8
* Apache Maven 3

### Step 1: Clone Aura git repo and build Archetype

1. Open a command line window.
2. Clone or download Aura maven project using the above github button.
3. Navigate to root `aura` directory
4. Build Aura

    `mvn clean install`

### Step 2: Generate a Template from the Aura Archetype

1. Open a command line window.
2. Navigate to the directory where you want to create your project template and run:

    `mvn archetype:generate -DarchetypeCatalog=local`
       
3. When prompted to choose an archetype, type the number that corresponds with Aura archetype.

    `Choose archetype:
     1: local -> org.auraframework:simple-aura-archetype (archetype for Aura-based "hello, world")`
     
4 Enter these values:
<pre><code>
    Define value for property 'groupId': org.myGroup
    Define value for property 'artifactId': helloWorld
    Define value for property 'version': 1.0-SNAPSHOT
    Define value for property 'package': org.myGroup
</code></pre>
    **Note**: The artifactId can only contain alphanumeric characters.
5. When prompted to confirm properties configuration, enter `Y`.
The following output confirms that your template has been generated successfully.
<pre><code>
    [INFO] ----------------------------------------------------------------------------
    [INFO] Using following parameters for creating project from Archetype: aura-archetype:0.0.1-SNAPSHOT
    [INFO] ----------------------------------------------------------------------------
    [INFO] Parameter: groupId, Value: org.myGroup
    [INFO] Parameter: artifactId, Value: helloWorld
    [INFO] Parameter: version, Value: 1.0-SNAPSHOT
    [INFO] Parameter: package, Value: org.myGroup
    [INFO] Parameter: packageInPathFormat, Value: org.myGroup
    [INFO] Parameter: package, Value: org.myGroup
    [INFO] Parameter: version, Value: 1.0-SNAPSHOT
    [INFO] Parameter: groupId, Value: org.myGroup
    [INFO] Parameter: artifactId, Value: foo
    [INFO] project created from Archetype in dir: /home/<project-path>
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time: 33.656s
    [INFO] Finished at: Tue Jul 16 14:39:07 PST 2013
    [INFO] Final Memory: 10M/180M
    [INFO] ------------------------------------------------------------------------
</code></pre>

### Step 3: Build and Run Your Project
   
1. On the command line, navigate to the directory for your new app.

    `cd helloWorld` 
    
2. Build the app.

    `mvn clean install`
    
3. Start the Jetty server on port 8080.

    `mvn jetty:run`
    
    To use another port, append: `-Djetty.port=portNumber. For example, mvn jetty:run -Djetty.port=9877`.
4. Test your app in a browser by navigating to:

    `http://localhost:8080/example/helloWorld.app`       
You should see a simple greeting in your browser.
5. To stop the Jetty server and free up the port when you are finished, press `CTRL+C` on the command line.
    
    **Note**: the `helloWorld/pom.xml` file has a `<dependencies>` section, which lists the `<version>` of each Aura 
artifact in your project. They define the version of Aura that your project is using and each artifact 
<dependency> should use the same version.

## Next Steps

Now that you've created your first app, you might be wondering where do I go from here? There is much more to learn about Aura. Here are a few ideas for next steps.

### Read the Documentation

See the [Aura Documentation](http://documentation.auraframework.org/auradocs) site.

The Reference tab gives you details about out-of-the-box components and the JavaScript API. For components specific to Salesforce customers, refer to the [Lightning Components Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/).

Alternatively, you can start up your Jetty server and navigate to `http://localhost:8080/auradocs/docs.app` 
to access the documentation on your localhost.

**Note**: If you're a Salesforce customer:

+ You'll get more relevant information and learn more by starting with the [Lightning Components Basics](https://trailhead.salesforce.com/en/modules/lex_dev_lc_basics) module in Trailhead.
+ The [Lightning Components Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/) is a comprehensive guide to Lightning component development.

### Getting Help
If you're a Salesforce customer, ask a question on [StackExchange](https://salesforce.stackexchange.com/questions/tagged/lightning-components), which has a great community of Lightning component developers.

If you find an issue with open-source Aura, use the Issues tab in this repo to let us know.


