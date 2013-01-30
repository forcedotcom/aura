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

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.util.Arrays;
import java.util.Collection;

import org.auraframework.util.text.Hash;

/**
 * A Reader to (implicitly) concatenate multiple file or resource streams.
 * 
 * This is used to generate a {@link Hash} for a group of files without needing
 * to take the time to actually compile them.
 */
public class MultiStreamReader extends Reader {

    Reader current;
    int index;
    URL[] urls;

    public MultiStreamReader(URL[] urls) {
        current = null;
        index = -1;
        this.urls = Arrays.copyOf(urls, urls.length);
    }

    public MultiStreamReader(Collection<URL> urls) {
        current = null;
        index = -1;
        this.urls = urls.toArray(new URL[urls.size()]);
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
    public int read(char[] buffer, int start, int maxRead) throws IOException {
        int readSoFar = 0;
        if (index == urls.length || urls.length == 0) {
            // If we're empty, there can't be anything to read
            return -1;
        }

        while (readSoFar < maxRead) {
            if (current == null) {
                index++;
                if (index == urls.length) {
                    // We're done. If we read nothing so far, it's EOF, else
                    // return
                    // what we got.
                    return readSoFar > 0 ? readSoFar : -1;
                }
                current = new InputStreamReader(urls[index].openStream());
            }
            // Read from current until EOF (read() returns -1), current stalls
            // (read() returns 0), or buffer is full.
            int thisRead = current.read(buffer, start, maxRead);
            while (thisRead > 0 && readSoFar + start < maxRead) {
                readSoFar += thisRead;
                maxRead -= thisRead;
                start += thisRead;
                thisRead = current.read(buffer, start, maxRead);
            }
            if (thisRead == 0 || maxRead == 0) {
                return readSoFar; // Full, or stalling: done for now
            } else if (thisRead < 0) {
                current.close();
                current = null;
            }
        }
        return readSoFar;
    }
}
