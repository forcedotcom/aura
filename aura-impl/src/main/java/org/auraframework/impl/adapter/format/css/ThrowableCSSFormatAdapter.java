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
package org.auraframework.impl.adapter.format.css;

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraExceptionUtil;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class ThrowableCSSFormatAdapter extends CSSFormatAdapter<Throwable> {

    @Override
    public Class<Throwable> getType() {
        return Throwable.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException {
        Throwable t = (Throwable) value;

        out.append("/** \nAN EXCEPTION OCCURRED WHILE PROCESSING CSS\n");
        // FIXME: this is pretty ugly.
        Mode mode = Aura.getContextService().getCurrentContext().getMode();
        if (mode != Mode.PROD && mode != Mode.PRODDEBUG && !Aura.getConfigAdapter().isProduction()) {
            out.append(AuraExceptionUtil.getStackTrace(t));
        }

        String message = "\\A\\A" + t.getMessage().replaceAll("\n", "\\\\A");

        out.append("\n**/\n");
        out.append(".auraErrorBox,.auraMsgMask{display:block;}\n");

        out.append("#auraErrorMessage {background-color:gainsboro; margin:0 10px 10px; padding:10px; color:#333;");
        out.append("min-height:200px; max-height:300px; overflow:auto; font-family:monospace;");
        out.append("box-shadow:inset 0 0 10px rgba(0,0,0,.4); border:1px solid #666}\n");

        out.append(String.format("#auraErrorMessage:after{white-space: pre; content:\"%s\";}\n", message));
    }

}
