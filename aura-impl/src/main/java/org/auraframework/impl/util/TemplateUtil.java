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

public class TemplateUtil {

    private static final String HTML_STYLE = "        <link href=\"%s\" rel=\"stylesheet\" type=\"text/css\"/>\n";
    private static final String HTML_INLINE_SCRIPT = "       <script src=\"%s\"></script>\n";
    private static final String HTML_LAZY_SCRIPT = "       <script data-src=\"%s\" ></script>\n";
    private static final String HTML_DEFER_SCRIPT = "       <script src=\"%s\" defer ></script>\n";

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
            for (String script : scripts) {
                out.append(String.format(HTML_INLINE_SCRIPT, script));
            }
        }
    }

    public void writeHtmlScripts(AuraContext context, List<String> scripts, boolean canBeAsync, Appendable out)
            throws IOException {
        if (scripts != null) {
            String format = null;
            switch (context.getClient().getType()) {
            case IE9:
            case IE8:
            case IE7:
            case IE6:
                if (canBeAsync) {
                    format = HTML_LAZY_SCRIPT;
                } else {
                    format = HTML_INLINE_SCRIPT;
                }
                break;
            default:
                format = HTML_DEFER_SCRIPT;
                break;
            }
            for (String script : scripts) {
                out.append(String.format(format, script));
            }
        }
    }
}
