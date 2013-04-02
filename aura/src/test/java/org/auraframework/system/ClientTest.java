/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.Map;

import org.auraframework.system.Client.Type;
import org.auraframework.test.UnitTestCase;

import com.google.common.collect.Maps;

public class ClientTest extends UnitTestCase {
    
    public ClientTest(String name){
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
    
}
