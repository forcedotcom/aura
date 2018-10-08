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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;

/**
 * Builds a source map file for a minified javascript group.
 * Each file in a javascript group are processed individually using different compression levels.
 * This source map format support post processing of individual files in a single js group.
 * <p/>
 * {
 * version : 3,
 * file: "group.js",
 * sections: [
 * { offset: {line:0, column:0}, url: "file1.js.map" },
 * { offset: {line:100, column:10}, map:
 * {
 * version : 3,
 * file: "file2.js",
 * sources: ["file2.js"],
 * names: ["src", "maps", "are", "fun"],
 * mappings: "AAAA,E;;ABCDE;"
 * }
 * }
 * ]
 * }
 *
 */
public class SourcemapWriter extends OutputStreamWriter {
    private static final String GROUP_BEGIN_ATTRIBUTES = "%s\n{\"version\":3,\"file\":\"%s\",\"sections\":[";
    private static final String GROUP_END_ATTRIBUTES = "]}";
    private static final String FILE_SECTION_BEGIN_ATTRIBUTES = "{\"offset\":{\"line\":%s,\"column\":%s}, \"map\":";
    private static final String FILE_SECTION_END_ATTRIBUTES = "}";
    private static final String SOURCEMAP_XSSI_GUARD = ")]}";

    public static final String SOURCEMAP_COMMENT = "\n//# sourceMappingURL=/auraFW/javascript/%s/%s\n";
    private int sectionCount = 0;

    public SourcemapWriter(File sourceMapFile) throws FileNotFoundException, UnsupportedEncodingException {
        this(new FileOutputStream(sourceMapFile), "UTF-8");
    }

    public SourcemapWriter(OutputStream out, String charsetName) throws UnsupportedEncodingException {
        super(out, charsetName);
    }

    public void writeSection(String sourceFileName, long lineNumber, long columnNumber, String map) throws IOException {
        if (sectionCount == 0) {
            this.write(String.format(GROUP_BEGIN_ATTRIBUTES, SOURCEMAP_XSSI_GUARD, sourceFileName));
        }
        if (sectionCount > 0) {
            this.write(",");
        }

        this.write(String.format(FILE_SECTION_BEGIN_ATTRIBUTES, lineNumber, columnNumber));
        this.write(map);
        this.write(FILE_SECTION_END_ATTRIBUTES);

        sectionCount++;
    }

    @Override
    public void close() throws IOException {
        if (sectionCount > 0) {
            this.write(GROUP_END_ATTRIBUTES);
        }

        super.close();
    }

    public static File getSourcemapFile(File javascriptOutputFile) {
        return new File(javascriptOutputFile.getParent(), javascriptOutputFile.getName() + ".map");
    }

    public static File getSourcContentFile(File javascriptOutputFile) {
        String outputFileName = javascriptOutputFile.getName();
        return new File(javascriptOutputFile.getParent(), outputFileName.substring(0, outputFileName.lastIndexOf(".")) + ".map.js");
    }
}
