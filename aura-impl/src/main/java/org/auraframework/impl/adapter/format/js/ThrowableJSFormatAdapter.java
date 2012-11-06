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
package org.auraframework.impl.adapter.format.js;

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class ThrowableJSFormatAdapter extends JSFormatAdapter<Throwable> {

    @Override
    public Class<Throwable> getType() {
        return Throwable.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException, QuickFixException {
        out.append("aura.error(");
        Aura.getSerializationService().write(value, attributes, getType(), out, "JSON");
        out.append(");");
    }

}
