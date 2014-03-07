package org.auraframework.http;

import java.util.List;

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
    
    public static final String SELF = "self";
    public static final String NONE = "none";
    public static final String ALL = "*";
    public static final String UNSAFE_INLINE = "unsafe-inline";
    public static final String UNSAFE_EVAL = "unsafe-eval";
    
    public static class PolicyBuilder {
        public PolicyBuilder() {}
        
        private static List<String> default_src = Lists.newArrayList();
        private static List<String> script_src = Lists.newArrayList();
        private static List<String> object_src = Lists.newArrayList();
        private static List<String> style_src = Lists.newArrayList();
        private static List<String> img_src = Lists.newArrayList();
        private static List<String> media_src = Lists.newArrayList();
        private static List<String> frame_src = Lists.newArrayList();
        private static List<String> font_src = Lists.newArrayList();
        private static List<String> connect_src = Lists.newArrayList();
        private static List<String> sandbox = Lists.newArrayList();
        private static List<String> report_uri = Lists.newArrayList();

        public String build() {
            // TODO
            return null;
        }
        
        public PolicyBuilder default_src(String... sources) {
            default_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder script_src(String... sources) {
            script_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder object_src(String... sources) {
            object_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder style_src(String... sources) {
            style_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder img_src(String... sources) {
            img_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder media_src(String... sources) {
            media_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder frame_src(String... sources) {
            frame_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder font_src(String... sources) {
            font_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder connect_src(String... sources) {
            connect_src.addAll(Lists.newArrayList(sources));
            return this;
        }
        
        public PolicyBuilder sandbox(String... flags) {
            sandbox.addAll(Lists.newArrayList(flags));
            return this;
        }
        
        public PolicyBuilder report_uri(String... uris) {
            report_uri.addAll(Lists.newArrayList(uris));
            return this;
        }
    }
}
