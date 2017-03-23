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
package org.auraframework.integration.test.configuration;

import org.apache.http.client.CookieStore;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.integration.test.util.AuraJettyServer;
import org.auraframework.test.util.SauceUtil;
import org.auraframework.util.test.configuration.TestServletConfig;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;

import javax.inject.Inject;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @since 0.0.59
 */
@SuppressWarnings("deprecation")
@ServiceComponent
public class JettyTestServletConfig implements TestServletConfig {

    @Inject
    ConfigAdapter configAdapter;

    private static final Logger LOG = Logger.getLogger(JettyTestServletConfig.class.getSimpleName());

    private final URL baseUrl;

    public JettyTestServletConfig() throws Exception {
        String host;
        int port;
        boolean spawnJetty = Boolean.parseBoolean(System.getProperty("jetty.spawn", "false"));
        if (spawnJetty) {
            Server server = AuraJettyServer.getInstance();
            Connector connector = server.getConnectors()[0];
            port = connector.getPort();
            host = connector.getHost();
            if (host == null) {
                try {
                    host = getHost();
                } catch (UnknownHostException e) {
                    LOG.log(Level.WARNING, e.toString(), e);
                    host = "localhost";
                }
            }
            LOG.info(String.format("Starting Jetty on %s:%s", host, port));
            server.start();
        } else {
            port = Integer.parseInt(System.getProperty("jetty.port", "9090"));
            host = System.getProperty("jetty.host");
            if (host == null) {
                try {
                    host = getHost();
                } catch (UnknownHostException e) {
                    LOG.log(Level.WARNING, e.toString(), e);
                    host = "localhost";
                }
            }
        }
        baseUrl = new URL("http", host, port, "/");
        LOG.info("BaseUrl: " + baseUrl);
    }

    private String getHost() throws UnknownHostException {
        if (SauceUtil.areTestsRunningOnSauce()) {
            return InetAddress.getLocalHost().getCanonicalHostName();
        }
        return "localhost";
    }

    @Override
    public URL getBaseUrl() {
        return baseUrl;
    }

    @Override
    public HttpClient getHttpClient() {
        /*
         * 10 minute timeout for making a connection and for waiting for data on the connection. This prevents tests
         * from hanging in the http code, which in turn can prevent the server from exiting.
         */
        int timeout = 10 * 60 * 1000;

        CookieStore cookieStore = new BasicCookieStore();

        HttpParams params = new BasicHttpParams();
        HttpConnectionParams.setConnectionTimeout(params, timeout);
        HttpConnectionParams.setSoTimeout(params, timeout);

        DefaultHttpClient http = new DefaultHttpClient(params);
        http.setCookieStore(cookieStore);

        return http;
    }
}
