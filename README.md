What is Aura?
   Aura is a UI framework for developing dynamic web apps for mobile and desktop 
 devices, while providing a scalable long-lived lifecycle to support building apps
 engineered for growth. It supports partitioned multi-tier component development 
 that bridges the client and server. To find out more about Aura Documentation, scroll
 to the bottom of the page for the the AuraDocs page. 

How Do I develop with Aura?
   You can build your user interface at a granular level and easily integrate with
 popular toolkits and libraries, such as jQuery. Aura's lightweight and scalable 
 architecture uses two key building blocks: components and events. Components use 
 markup that looks similar to HTML. You can also use HTML or any other code that can
 execute within an HTML page. Components are encapsulated and their internals stay 
 private. You can extend existing components to customize their behavior. 
   The robust event model enables you to develop loosely coupled components. Once 
 you define the events that interact with your components, your team can work on 
 the components in parallel to quickly build a powerful app. Aura also supports 
 a powerful expression language, embedded testing, performance, and security features.

How do I start?
 First choose whether you want to run Aura from command line or from eclipse.
 Note: for aura to work, you will need Java Development Kit (JDK) 1.6, Apache Maven 3, 
       and Eclipse 3.7 for Java EE Developers with m2eclipse plugin

 Command line:
  Step 1: Generate a Template from the Aura Archetype
   1. Open a command line window.
   2. Navigate to the directory where you want to create your project template and run:
       mvn archetype:generate -DarchetypeCatalog=http://maven.auraframework.org/libs-release-local/archetype-catalog.xml
   3. When prompted to choose an archetype, enter 1.
   4. Select the latest archetype version, or press enter for the default version.
       The archetype is downloaded to your machine.
   5. Enter these values:
       Define value for property 'groupId': org.myGroup
       Define value for property 'artifactId': helloWorld
       Define value for property 'version': 1.0-SNAPSHOT
       Define value for property 'package': org.myGroup
       Note: The artifactId is also the name of the project as it appears in the Package
             Explorer. It can only contain alphanumeric characters.
   6. When prompted to confirm properties configuration, enter Y.
 
       The following output confirms that your template has been generated successfully.
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
        [INFO] Finished at: Mon Feb 27 14:39:07 PST 2012
        [INFO] Final Memory: 10M/180M
        [INFO] ------------------------------------------------------------------------
  Step 2: Build and Run Your Project
   1. On the command line, navigate to the directory for your new app.
       cd helloWorld
   2. Start the Jetty server on port 8080.
       mvn jetty:run
       To use another port, append: -Djetty.port=portNumber. For example, mvn jetty:run -Djetty.port=9877.
   3. Test your app in a browser.
       http://localhost:8080/helloWorld/helloWorld.app
       You should see a simple greeting in your browser.
   4. To stop the Jetty server and free up the port when you are finished, press CTRL+C on the command line.
   Note: the helloWorld/pom.xml file has a <dependencies> section, which lists the <version> of each Aura 
         artifact in your project. They define the version of Aura that your project is using and each artifact 
         <dependency> should use the same version.

 Eclipse IDE:
  - Getting the Aura Assist plugin
     1. In Eclipse, click Help > Install New Software....
     2. Enter the value:
         Work with: http://download.auraframework.org/update/
     3. Select the Aura Assist Feature checkbox.
     4. Click Next.
         The plugin will be installed.
  - Using Aura Assist:
     To use auto-complete, follow the usage guidelines below.
      Elements	 |  Usage/Shortcut
      ______________________________________________________________________________________________________________________________________
      Namespace	 |  Ctrl + Space
      Components |  Triggered when you type <NAMESPACE:, or Ctrl + Space. Make sure you are within an aura:application or aura:component tag.
      Attributes |  Triggered when you type <NAMESPACE:COMPONENT, or Ctrl + Space.
  - Create An Aura app in Eclipse
     Step 1: Specify the Remote Archetype
      1. In Eclipse, add the remote catalog.
          On Linux or Windows: Click Window > Preferences > Maven > Archetypes > Add Remote Catalog...
          On Mac: Click Eclipse > Preferences > Maven > Archetypes > Add Remote Catalog...
      2. In the Remote Archetype Catalog window, enter these values:
          Catalog File: http://maven.auraframework.org/libs-release-local/archetype-catalog.xml
          Description: Aura Archetype
      3. Click OK.
     Step 2: Create a New Project
      1. Click File > New > Other... and select Maven > Maven Project. 
      2. Click Next twice.
      3. In the Catalog drop-down menu, select Aura Archetype.
      4. Select the archetype with Artifact Id of simple-aura-archetype, and click Next.
      5. Enter org.myGroup for Group Id and helloWorldEclipse for Artifact Id.
      6. Click Finish.

     Note:The Artifact Id is also the name of your project as it appears in the Package Explorer. See Guide to naming 
          conventions for examples of Group Id and Artifact Id naming conventions.
          You should now have a new project called helloWorldEclipse in the Package Explorer.

     Step 3: Build and Run Your Project
      1. Click Run > Debug Configurations... and double click Maven Build.
      2. Enter these values:
          Name: HelloWorld Server
          Base directory: ${workspace_loc:/helloWorldEclipse} (where helloWorldEclipse is the same as your Artifact Id)
          Goals: jetty:run

          To use another port, such as port 8080, append -Djetty.port=8080 to jetty:run.
      3. Click Debug.
          You should see this message in the Eclipse Console window indicating that the Jetty server has started. 
          [INFO] Started Jetty Server

     Step 4: Test Your App
      1. Navigate to http://localhost:8080 to test your app.
          You will be directed to http://localhost:8080/helloWorldEclipse/helloWorldEclipse.app.
      2. Validate that your app is working by looking for "hello web" in the browser page.

To Find out more information about Aura, start up your jetty server and type http://localhost:9090/auradocs into your browser.
