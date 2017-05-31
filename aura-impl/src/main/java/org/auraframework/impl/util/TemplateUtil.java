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
package org.auraframework.impl.util;

import java.io.IOException;
import java.util.List;

import org.auraframework.system.AuraContext;
import org.auraframework.system.Client.Type;

public class TemplateUtil {
    public enum Script {
        SYNC("<script src=\"%s\"></script>"),
        ASYNC("<script src=\"%s\" async defer></script>"),
        DEFER("<script src=\"%s\" defer></script>"),
        LAZY("<script data-src=\"%s\"></script>");

        private final String tag;

        Script(String tag) {
            this.tag = tag;
        }

        public String toHTML(String url) {
            return String.format(tag, url);
        }
    }

    private static final String PREFETCH_TAG = "<link rel=\"prefetch\" href=\"%s\" as=\"script\"/>\n";

    private static final String HTML_STYLE = "<link href=\"%s\" rel=\"stylesheet\" type=\"text/css\"/>\n";

    public void writeHtmlStyle(String url, Appendable out) throws IOException {
        if (url != null) {
            out.append(String.format(HTML_STYLE, url));
        }
    }

    public void writeHtmlStyles(List<String> styles, Appendable out) throws IOException {
        if (styles != null) {
            for (String style : styles) {
                out.append(String.format(HTML_STYLE, style));
            }
        }
    }

    public void writeInlineHtmlScripts(AuraContext context, List<String> scripts, Appendable out) throws IOException {
        if (scripts != null) {
            for (String src : scripts) {
                out.append(Script.SYNC.toHTML(src));
            }
        }
    }

    public void writeHtmlScript(AuraContext context, String scriptUrl, Script scriptLoadingType, Appendable out)
            throws IOException {
        if (scriptUrl != null) {
            Type type = context.getClient().getType();
            if (type == Type.IE9 || type == Type.IE8 || type == Type.IE7 || type == Type.IE6) {
                scriptLoadingType = Script.DEFER;
            }
            out.append(scriptLoadingType.toHTML(scriptUrl));
        }
    }

    public void writeHtmlScripts(AuraContext context, List <String> scripts, Script scriptLoadingType, Appendable out)
            throws IOException {
        if (scripts != null && !scripts.isEmpty()) {
            Type type = context.getClient().getType();
            if (type == Type.IE9 || type == Type.IE8 || type == Type.IE7 || type == Type.IE6) {
                scriptLoadingType = Script.DEFER;
            }
            for (String src : scripts) {
                out.append(scriptLoadingType.toHTML(src));
            }
        }
    }

    public void writePrefetchScriptTags(List <String> scriptUrls, Appendable out) throws IOException {
        if (scriptUrls != null) {
            for (String url : scriptUrls) {
                out.append(String.format(PREFETCH_TAG, url));
            }
        }
    }
}
