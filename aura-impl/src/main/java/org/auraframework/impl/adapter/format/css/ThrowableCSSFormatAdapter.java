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
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraExceptionUtil;

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
        if (Aura.getContextService().getCurrentContext().getMode() != Mode.PROD
                && !Aura.getConfigAdapter().isProduction()) {
            out.append(AuraExceptionUtil.getStackTrace(t));
        }
        out.append("\n**/\n");
        out.append(".auraErrorBox{display:block;}\n");
        out.append(String.format("#auraErrorMessage:after{content:\" %s\";}\n", t.getMessage()));
    }

}
