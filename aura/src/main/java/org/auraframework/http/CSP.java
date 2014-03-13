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
package org.auraframework.http;

import java.util.*;

import com.google.common.collect.Lists;

/**
 * This class provides functionality for building Content Security Policy 1.0
 * (CSP) HTTP response headers as described in <a href="http://www.w3.org/TR/CSP/">
 * the W3C Content Security Policy 1.0 spec</a>.
 * 
 * Use PolicyBuilder to build a header value to attach to an HTTP response.
 * 
 * Example Usage:
 * 
 * To set a header that <em>only reports</em> all resource loading:
 * <code>
   PolicyBuilder p = new PolicyBuilder();
   p
   .default_src(CSP.NONE)
   .report_uri(CSPReporterServlet.URL);
   
   response.setHeader(CSP.Header.REPORT_ONLY, p.build());
 * </code>
 *
 * To set a header that <em>disallows</em> loading of scripts <em>except</em>
 * from social network widgets:
 * <code>
   PolicyBuilder p = new PolicyBuilder();
   p
   .script_src(
       "https://apis.google.com",
       "https://platform.twitter.com")
   .frame_src(
       "https://plusone.google.com",
       "https://facebook.com",
       "https://platform.twitter.com");
       
   response.setHeader(CSP.Header.SECURE, p.build());
 * </code>
 */
public class CSP {
    public static final class Header {
        public static final String SECURE = "Content-Security-Policy";
        public static final String REPORT_ONLY = "Content-Security-Policy-Report-Only";
    }
    
    public static enum Directive {
        DEFAULT("default-src"),
        SCRIPT("script-src"),
        OBJECT("object-src"),
        STYLE("style-src"),
        IMG("img-src"),
        MEDIA("media-src"),
        FRAME("frame-src"),
        FONT("font-src"),
        CONNECT("connect-src"),
        SANDBOX("sandbox"),
        REPORT_URI("report-uri");
        
        private String directive;
        
        private Directive(String directive) {
            this.directive = directive;
        }

        @Override
        public String toString() {
            return directive;
        }
    }
    
    /**
     * Special value for allowing a resource type from the same domain as
     * served the initial response.
     */
    public static final String SELF = "'self'";
    
    /**
     * Special value for disallowing a resource type from any domain.
     */
    public static final String NONE = "'none'";
    
    /**
     * Special value for allowing a resource type from any domain.
     */
    public static final String ALL = "*";
    
    /**
     * Special value for allowing inline resource inclusion (such as
     * &lt;style&gt; or &lt;script&gt;).
     * 
     * Not recommended. 
     */
    public static final String UNSAFE_INLINE = "'unsafe-inline'";
    
    /**
     * Special value for allowing <code>eval()</code> of JavaScript.
     * 
     * Not recommended. 
     */
    public static final String UNSAFE_EVAL = "'unsafe-eval'";
    
    /**
     * Fluent interface for building Content Security Policy headers.
     * 
     * See {@link CSP} for example usage.
     */
    public static class PolicyBuilder {
        public PolicyBuilder() {}
        
        private static EnumMap<Directive, List<String>> directives = new EnumMap<Directive, List<String>>(Directive.class);
        
        public PolicyBuilder default_src(String... sources) {
            directives.put(Directive.DEFAULT, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder script_src(String... sources) {
            directives.put(Directive.SCRIPT, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder object_src(String... sources) {
            directives.put(Directive.OBJECT, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder style_src(String... sources) {
            directives.put(Directive.STYLE, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder img_src(String... sources) {
            directives.put(Directive.IMG, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder media_src(String... sources) {
            directives.put(Directive.MEDIA, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder frame_src(String... sources) {
            directives.put(Directive.FRAME, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder font_src(String... sources) {
            directives.put(Directive.FONT, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder connect_src(String... sources) {
            directives.put(Directive.CONNECT, Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder sandbox(String... flags) {
            directives.put(Directive.SANDBOX, Lists.newArrayList(flags));
            return this;
        }
        
        public PolicyBuilder report_uri(String... uris) {
            directives.put(Directive.REPORT_URI, Lists.newArrayList(uris));
            return this;
        }
        
        public String build() {
            StringBuilder sb = new StringBuilder();
            
            Iterator<Directive> keys = directives.keySet().iterator();
            
            while(keys.hasNext()) {
                Directive dir = keys.next();
                List<String> values = directives.get(dir);
                if (!values.isEmpty()) {
                    if (sb.length() > 0) {
                        sb.append("; ");
                    }
                    
                    sb.append(dir);
                    
                    for (String value : values) {
                        sb.append(" ").append(value);
                    }
                    
                }
            }
            return sb.toString();
        }
    }
}
