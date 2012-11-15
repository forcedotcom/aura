This is a Maven project using Aura.  To start jetty on port 8080, compiling
anything needed, run this:

  mvn jetty:run

Once running, to see the app browse to:

  http://localhost:8080

which should redirect you to 

  http://localhost:8080/<myartifactId>/<myartifactId>.app

To edit the app, open:

  src/main/webapp/WEB-INF/components/<myartifactId>/<myartifactId>/<myartifactId>.app
