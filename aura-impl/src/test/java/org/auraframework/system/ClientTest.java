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
package org.auraframework.system;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.system.Client.Type;
import org.auraframework.impl.AuraImplTestCase;

import com.google.common.collect.Maps;

public class ClientTest extends AuraImplTestCase {
    public ClientTest(String name) {
        super(name);
    }

    /**
     * Verify that useragent string is parsed out to obtain right ClientType
     */
    public void testGetType(){
         Map<String, Type>pairs = Maps.newHashMap();
         pairs.put("Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)", Type.IE6 ); 
         pairs.put("Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)", Type.IE7);
         pairs.put("Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 5.2; Trident/4.0; Media Center PC 4.0; SLCC1; .NET CLR 3.0.04320)",Type.IE8);
         pairs.put("Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)",Type.IE9);
         pairs.put("Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)",Type.IE10);
         pairs.put("Mozilla/6.0 (Windows NT 6.2; WOW64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1",Type.FIREFOX);
         pairs.put("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.162 Safari/535.19",Type.WEBKIT);
         pairs.put("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",Type.WEBKIT);
         pairs.put("Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",Type.WEBKIT);
         pairs.put("",Type.OTHER);
         pairs.put("Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00",Type.OTHER);
         
         for(String userAgent : pairs.keySet()){
             assertEquals("Unexpected ClientType from userAgent string:", 
                     pairs.get(userAgent), new Client(userAgent).getType());
         }
         assertEquals("Unexpected ClientType from userAgent string:", Type.OTHER, new Client().getType());
         assertEquals("Unexpected ClientType from userAgent string:", Type.OTHER, new Client(null).getType());
        
    }

    public String[] userAgentsWEBKIT = {
            "mozilla/5.0 (x11; linux x86_64) applewebkit/535.19 (khtml, like gecko) ubuntu/10.04 chromium/18.0.1025.151 chrome/18.0.1025.151 safari/535.19",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10",
            "Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3",
            "Mozilla/5.0 (Windows; U; Windows NT 6.1; tr-TR) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27",
            // Android WebKit
            "Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
            // Mobile Safari
            "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+" };
    public String[] userAgentsFF = { "mozilla/5.0 (x11; ubuntu; linux x86_64; rv:13.0) gecko/20100101 firefox/13.0.1",
            "Mozilla/6.0 (Macintosh; I; Intel Mac OS X 11_7_9; de-LI; rv:1.9b4) Gecko/2012010317 Firefox/10.0a4" };
    public String[] userAgentsIE6 = {
            "mozilla/4.0 (compatible; msie 6.0; windows nt 5.1; sv1) chromeframe/8.0.552.224",
            "mozilla/4.0 (compatible; msie 6.0; windows nt 5.1; sv1)" };
    public String[] userAgentsIE7 = { "mozilla/4.0 (compatible; msie 7.0; windows nt 5.1; .net clr 1.1.4322; .net clr 2.0.50727; .net clr 3.0.4506.2152; .net clr 3.5.30729)" };
    public String[] userAgentsIE8 = { "mozilla/4.0 (compatible; msie 8.0; windows nt 6.1; wow64; trident/4.0; slcc2; .net clr 2.0.50727; .net clr 3.5.30729; .net clr 3.0.30729; media center pc 6.0; .net4.0c)" };
    public String[] userAgentsIE9 = { "mozilla/5.0 (compatible; msie 9.0; windows nt 6.1; trident/5.0)",
            // IE mobile - should this be other?
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)" };
    public String[] userAgentsIE10 = { "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)" };
    public String[] userAgentsOTHER = {
            "Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.00",
            // Opera mini
            "Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54",
            "Mozilla/5.0 (Windows; U; Win 9x 4.90; SG; rv:1.9.2.4) Gecko/20101104 Netscape/9.1.0285" };

    public void testClientTypes() throws Exception {
        Map<Enum<Type>, String[]> clientToUserAgent = new HashMap<Enum<Type>, String[]>();
        clientToUserAgent.put(Type.FIREFOX, userAgentsFF);
        clientToUserAgent.put(Type.IE8, userAgentsIE8);
        clientToUserAgent.put(Type.WEBKIT, userAgentsWEBKIT);
        clientToUserAgent.put(Type.OTHER, userAgentsOTHER);

        for (Enum<Type> c : clientToUserAgent.keySet()) {

            for (String userAgentString : clientToUserAgent.get(c)) {
                assertEquals("Incorrect client type returned for user-agent string:" + userAgentString, new Client(
                        userAgentString).getType(), c);
            }
        }
    }

    public void testDefaultClientType() throws Exception {
        Client client = new Client();
        assertEquals("Incorrect default client type.", client.getType().name(), "OTHER");
    }
}
