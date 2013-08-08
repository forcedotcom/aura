## What is Aura?

Aura is a UI framework for developing dynamic web apps for mobile and desktop 
devices, while providing a scalable long-lived lifecycle to support building apps
engineered for growth. It supports partitioned multi-tier component development 
that bridges the client and server.
 
To find out more about Aura, see the instructions at the end of this README for 
accessing the documentation on your localhost after you build the project. 

## How Do I Develop with Aura?

You can build your user interface at a granular level and easily integrate with
popular toolkits and libraries, such as jQuery. Aura's lightweight and scalable 
architecture uses two key building blocks: components and events.
 
Components use markup that looks similar to HTML. You can also use HTML or any other code that can
execute within an HTML page. Components are encapsulated and their internals stay 
private. You can extend existing components to customize their behavior. 
   
The robust event model enables you to develop loosely coupled components. Once 
you define the events that interact with your components, your team can work on 
the components in parallel to quickly build a powerful app.

Aura also supports a powerful expression language, embedded testing, performance, and security features.

## How Do I Start?

The easiest way to get up and running is from the command line, but you can easily use Aura
with your favorite IDE too.

### Prerequisites

You need:

* Java Development Kit (JDK) 1.6
* Apache Maven 3

### Step 1: Generate a Template from the Aura Archetype

1. Open a command line window.
2. Navigate to the directory where you want to create your project template and run:

    `mvn archetype:generate -DarchetypeCatalog=http://repo.auraframework.org/libs-release-local/archetype-catalog.xml`
       
3. When prompted to choose an archetype, enter `1`.
4. Select the latest archetype version, or press enter for the default version.
       The archetype is downloaded to your machine.
5. Enter these values:
<pre><code>
    Define value for property 'groupId': org.myGroup
    Define value for property 'artifactId': helloWorld
    Define value for property 'version': 1.0-SNAPSHOT
    Define value for property 'package': org.myGroup
</code></pre>
    **Note**: The artifactId can only contain alphanumeric characters.
6. When prompted to confirm properties configuration, enter `Y`.
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

### Step 2: Build and Run Your Project
   
1. On the command line, navigate to the directory for your new app.

    `cd helloWorld` 
    
2. As a temporary fix, you'll need to edit the `pom.xml` file in the current directory. Find the `<repositories>` section and add this to it - and yes, we're working on fixing this right now:
<pre><code>
    &lt;repository>
        &lt;id>libs-external&lt;/id>
        &lt;url>http://repo.auraframework.org/libs-release&lt;/url>
    &lt;/repository>    
</code></pre>
3. Start the Jetty server on port 8080.

    `mvn jetty:run`
    
    To use another port, append: `-Djetty.port=portNumber. For example, mvn jetty:run -Djetty.port=9877`.
4. Test your app in a browser.
       `http://localhost:8080/helloWorld/helloWorld.app`       
You should see a simple greeting in your browser.
5. To stop the Jetty server and free up the port when you are finished, press `CTRL+C` on the command line.
    
    **Note**: the `helloWorld/pom.xml` file has a `<dependencies>` section, which lists the `<version>` of each Aura 
artifact in your project. They define the version of Aura that your project is using and each artifact 
<dependency> should use the same version.

To find out more about Aura, start up your Jetty server and type `http://localhost:8080/auradocs/docs.app` into your browser
to access the documentation.
