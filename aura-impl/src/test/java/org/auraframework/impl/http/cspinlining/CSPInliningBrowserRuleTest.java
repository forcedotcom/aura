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
package org.auraframework.impl.http.cspinlining;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.NONCE;
import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.http.cspinlining.CSPInliningCriteria;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.junit.Test;

public class CSPInliningBrowserRuleTest {
     @Test
    public void testIsRelevant(){
        AuraContext context = mock(AuraContext.class);
        CSPInliningCriteria criteria = new CSPInliningCriteria(context);
        CSPInliningBrowserRule target = new CSPInliningBrowserRule();

        criteria.setMode(NONCE);

        boolean expected = true;
        boolean actual = target.isRelevant(criteria);

        assertEquals("CSPInliningBrowserRule should not have been relevant since it wasnt already unsupported", expected, actual);
    }

    @Test
    public void testIsRelevantAlreadyUnsupported(){
        AuraContext context = mock(AuraContext.class);
        CSPInliningBrowserRule target = new CSPInliningBrowserRule();
        CSPInliningCriteria criteria = new CSPInliningCriteria(context);

        criteria.setMode(UNSUPPORTED);

        boolean expected = false;
        boolean actual = target.isRelevant(criteria);

        assertEquals("CSPInliningBrowserRule should not have been relevant as it is already unsupported", expected, actual);
    }

    @Test
    public void testProcessUnsupported() throws Exception{
        AuraContext context = mock(AuraContext.class);
        CSPInliningBrowserRule target = new CSPInliningBrowserRule();
        Client client = mock(Client.class);

        when(context.getClient()).thenReturn(client);

        CSPInliningCriteria criteria = new CSPInliningCriteria(context);

        List<UserAgentResult> uaTestEntries = new ArrayList<>();
        uaTestEntries.add(new UserAgentResult("Safari 10.1.2", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.1 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.1", true));
        uaTestEntries.add(new UserAgentResult("Safari 9.1", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/9.1 Safari/602.4.8", false));
        uaTestEntries.add(new UserAgentResult("Chrome 58", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", true));
        uaTestEntries.add(new UserAgentResult("Chrome 39", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2883.95 Safari/537.36", false));
        uaTestEntries.add(new UserAgentResult("IE 11", "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko", false));
        uaTestEntries.add(new UserAgentResult("IE 9", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)", false));
        uaTestEntries.add(new UserAgentResult("MS Edge 15", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986", true));
        uaTestEntries.add(new UserAgentResult("MS Edge 14", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/14.14986", false));
        uaTestEntries.add(new UserAgentResult("Firefox 53", "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.16.5; rv:53.0) Gecko/20100101 Firefox/53.0", true));


        for (UserAgentResult uar : uaTestEntries) {
            when(client.getUserAgent()).thenReturn(uar.ua);
            criteria.setMode(NONCE);
            target.process(criteria);

            boolean actual = criteria.getMode() != UNSUPPORTED;
            boolean expected = uar.compatible;

            assertEquals(uar.name + ": expected " + expected + ", actual " + actual, expected, actual);
        }

    }


    public static class UserAgentResult {
        public String name;
        public String ua;
        public boolean compatible;
        public UserAgentResult(String name, String ua, boolean compatible) {
            this.name = name;
            this.ua = ua;
            this.compatible = compatible;
        }
    }
}
