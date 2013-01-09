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

import java.io.IOException;
import java.io.Writer;
import java.util.Calendar;

import org.auraframework.system.SourceWriter;

/**
 * Basic helper functions for SourceWriter.
 * 
 * 
 * @since 0.0.210
 */
public abstract class SourceWriterImpl implements SourceWriter {
    protected static final String NL = System.getProperty("line.separator");
    protected static final int year = Calendar.getInstance().get(Calendar.YEAR);

    /**
     * Write out a simple copyright.
     * 
     * @param writer a writer for output
     * @throws IOException if the writer throws IOException
     */
    protected void writeCopyright(Writer writer) throws IOException {
        writer.write("Copyright, " + year + ", salesforce.com");
    }

    /**
     * Write out a specific number of line breaks.
     * 
     * @param writer the output writer.
     * @param count how many line breaks to write.
     * @throws IOException if the writer throws IOException
     */
    protected void writeLineBreaks(Writer writer, int count) throws IOException {
        for (int i = 0; i < count; i++) {
            writer.write(NL);
        }
    }

    /**
     * Format a template and write it out.
     * 
     * @param writer the output writer.
     * @param template the string format to fill
     * @param values the values for filling the template
     * @throws IOException if the writer throws IOException
     */
    protected void write(Writer writer, String template, Object... values) throws IOException {
        writer.write(String.format(template, values));
    }

}
