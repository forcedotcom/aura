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
package org.auraframework.impl.java.writer;

import java.io.Writer;

import org.auraframework.def.Definition;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * CSS theme writer.
 * 
 * 
 * @since 0.0.210
 */
public class ThemeWriter extends SourceWriterImpl {
    private static final ThemeWriter instance = new ThemeWriter();

    public static ThemeWriter getInstance() {
        return instance;
    }

    @Override
    public <D extends Definition> void write(D def, Source<?> source) {
        Writer writer = null;

        try {
            // FIXME: W-1242779 actually write something.
            writer = source.getWriter();
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        } finally {
            try {
                if (writer != null) {
                    writer.flush();
                    writer.close();
                }
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
        }
    }
}
