/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.test;

import java.io.File;

import org.auraframework.Aura;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.webapp.WebAppContext;
import org.openqa.selenium.net.PortProber;

/**
 * A Jetty server configured with default Aura descriptor and resources.
 * 
 * 
 * @since 0.0.302
 */
public class AuraJettyServer extends Server {
    private static Server instance = null;

    public static Server getInstance() {
        if (instance == null) {
            String possiblePort = System.getProperty("jetty.port");
            int port;
            try {
                port = Integer.parseInt(possiblePort);
            } catch (Throwable t) {
                port = PortProber.findFreePort();
            }
            String host = System.getProperty("jetty.host");
            instance = new AuraJettyServer(host, port, "/");
        }
        return instance;
    }

    private AuraJettyServer(String host, int port, String contextPath) {
        String tmpPath = System.getProperty("java.io.tmpdir") + "/webapp";
        File tmpDir = new File(tmpPath);
        if (!tmpDir.exists()) {
            tmpDir.mkdirs();
            tmpDir.deleteOnExit();
        }

        Connector connector = new SelectChannelConnector();
        if (host != null) {
            connector.setHost(host);
        }
        connector.setPort(port);
        setConnectors(new Connector[] { connector });

        WebAppContext context = new WebAppContext();
        context.setDefaultsDescriptor(Aura.class.getResource("/aura/http/WEB-INF/webdefault.xml").toString());
        context.setDescriptor(Aura.class.getResource("/aura/http/WEB-INF/web.xml").toString());
        context.setContextPath(contextPath);
        context.setParentLoaderPriority(true);
        context.setTempDirectory(tmpDir);

        String resources = System.getProperty("jetty.resources",
                AuraJettyServer.class.getResource("/org/auraframework/test").toString());
        context.setResourceBase(resources);

        setHandler(context);
    }

    public static void main(String... args) throws Exception {
        Server server = AuraJettyServer.getInstance();
        server.start();
        server.join();
    }
}
