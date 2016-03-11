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
package org.auraframework.integration.test.http;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.integration.test.logging.AbstractLoggingHttpTest;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

/**
 * Automation to verify the functioning of AuraResourceServlet. AuraResourceServlet is used to preload definitions of
 * components in a given namespace. It is also used to load CSS
 */
@UnAdaptableTest("AbstractLoggingUITest has tag @ThreadHostileTest which is not supported in SFDC.")
public class AuraResourceServletLoggingHttpTest extends AbstractLoggingHttpTest {

    public AuraResourceServletLoggingHttpTest(String name) {
        super(name);
    }

    class Request implements Callable<Integer> {
        private CloseableHttpClient httpClient;
        private String url;
        public Request(CloseableHttpClient httpClient, String url) {
            this.httpClient = httpClient;
            this.url = url;
        }

        @Override
        public Integer call() throws Exception {
            HttpGet get = obtainGetMethod(url);
            HttpResponse httpResponse = httpClient.execute(get);
            int statusCode = getStatusCode(httpResponse);
            //for debug only
            //String response = getResponseBody(httpResponse);
            //System.out.println("Request(#"+this.name+") status:"+statusCode/*+", get response:"+response*/);
            //get.releaseConnection();
            return statusCode;
        }
    }

    /**
     * test add for W-2792895
       also since I ask cache to log something when hit miss, this kind of verify W-2105858 as well
     */
    @Test
    public void testConcurrentGetRequests() throws Exception {
        // I tried to use obtainGetMethod(url) then perform(HttpGet) , but
        // our default httpClient use BasicClientConnectionManager, which doesn't work well with MultiThread
        // let's use PoolingHttpClientConnectionManager instead.
        PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
        // Increase max total connection to 200 -- just some big number
        cm.setMaxTotal(200);
        // Increase default max connection per route to 20 -- again, just some big numer
        cm.setDefaultMaxPerRoute(20);
        CloseableHttpClient httpClient = HttpClients.custom()
                    .setConnectionManager(cm)
                    .build();

        String modeAndContext = getSimpleContext(Format.JS, false);
        String url = "/l/" + AuraTextUtil.urlencode(modeAndContext) + "/app.js";

        int numOfRequest = 5;
        List<Request> requests = new ArrayList<>();
        for(int i = 1; i <= numOfRequest; i++) {
            requests.add(new Request(httpClient, url));
        }

        ExecutorService excutor = Executors.newFixedThreadPool(numOfRequest);
        List<Future<Integer>> responses = new ArrayList<>();
        for(Request request : requests) {
            responses.add(excutor.submit(request));
        }
        for(Future<Integer> response : responses) {
            response.get();
        }

         int counter = 0;
         String message;
         List<LoggingEvent> logs = appender.getLog();
         for(LoggingEvent le : logs) {
             message = le.getMessage().toString();
             if(message.contains("StringsCache")){
                 counter++;
                 assertTrue("get unexpected logging message for cache miss:"+message, message.contains("cache miss for key: JS:DEV:"));
             }
         }
         //run this test right after server is up, we get one miss. second time, what we looking for is cached already, no miss.
         assertTrue("we should only have no more than one cache miss, instead we have "+counter, counter <= 1);
    }

    /**
     * This gets a simple context string that uses a single preload.
     */
    private String getSimpleContext(Format format, boolean modified) throws Exception {
        return getAuraTestingUtil().getContextURL(Mode.DEV, format,
                "auratest:test_SimpleServerRenderedPage", ApplicationDef.class,
                modified);
    }
}
