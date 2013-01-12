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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.Collection;

import org.auraframework.util.text.Hash;

/**
 * A Reader to (implicitly) concatenate multiple files.
 * 
 * This is used to generate a {@link Hash} for a group of files without needing
 * to take the time to actually compile them.
 */
public class MultiFileReader extends Reader {

    Reader current;
    int index;
    File[] files;

    public MultiFileReader(Collection<File> names) {
        current = null;
        index = -1;
        this.files = names.toArray(new File[names.size()]);
    }

    @Override
    public void close() throws IOException {
        if (current != null) {
            current.close();
        }
    }

    // FIXME: check 3rd arg; array size >= 3rdarg or array size >= start +
    // 3rdarg?
    @Override
    public int read(char[] buffer, int start, int capacity) throws IOException {
        int readSoFar = 0;
        while (readSoFar + start < capacity) {
            if (current == null) {
                if (index++ == files.length) {
                    // We're done. If we read nothing so far, it's EOF, else
                    // return
                    // what we got.
                    return readSoFar > 0 ? readSoFar : -1;
                }
                current = new FileReader(files[index]);
            }
            // Read from current until EOF (read() returns -1), current stalls
            // (read() returns 0), or buffer is full.
            int thisRead = current.read(buffer, start + readSoFar, capacity);
            while (thisRead > 0 && readSoFar + start < capacity) {
                readSoFar += thisRead;
                thisRead = current.read(buffer, start + readSoFar, capacity);
            }
            if (thisRead == 0 || start + readSoFar >= capacity) {
                return readSoFar; // Full, or stalling: done for now
            } else if (thisRead < 0) {
                current.close();
                current = null;
            }
        }
        return readSoFar;
    }
}
