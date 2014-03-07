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

public class CSP {
    public static enum Header {
        SECURE("Content-Security-Policy"),
        REPORT_ONLY("Content-Security-Policy-Report-Only");
        
        private String header;
        
        private Header(String header) {
            this.header = header;
        }

        @Override
        public String toString() {
            return header;
        }
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
    
    public static final String SELF = "'self'";
    public static final String NONE = "'none'";
    public static final String ALL = "*";
    public static final String UNSAFE_INLINE = "'unsafe-inline'";
    public static final String UNSAFE_EVAL = "'unsafe-eval'";
    
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
