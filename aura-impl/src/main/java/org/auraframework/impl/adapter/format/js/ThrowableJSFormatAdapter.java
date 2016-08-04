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
package org.auraframework.impl.adapter.format.js;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.SerializationService;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.io.IOException;
import java.util.Map;

@ServiceComponent
public class ThrowableJSFormatAdapter extends JSFormatAdapter<Throwable> {
    @Inject
    private SerializationService serializationService;

    @Override
    public Class<Throwable> getType() {
        return Throwable.class;
    }

    @Override
    public void write(Throwable value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        out.append("aura.error(");
        serializationService.write(value, attributes, getType(), out, "JSON");
        out.append(");");
    }
}
