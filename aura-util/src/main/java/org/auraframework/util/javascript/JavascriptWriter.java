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

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import com.google.common.collect.Lists;
import com.google.javascript.jscomp.*;
import com.google.javascript.jscomp.Compiler;

/**
 * Util for compressing and writing javascript.
 */
public enum JavascriptWriter {

    CLOSURE_SIMPLE {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
        }
    },

    CLOSURE_WHITESPACE {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(options);
        }
    },

    CLOSURE_ADVANCED {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
        }
    },

    /**
     * Closure Compiler using advanced optimizations, but avoids some compiler-created global variables.
     *
     * Closure does some optimizations that use global variables like so: var b=false,f; Then it will use "b" in place
     * of the "false" value. It could also set "f" to the prototype of some object. It does all of this to reduce the
     * number of chars in the file. Unless accounted for, this will cause issues since files are run through the
     * compiler individually. So it's possible that the global variable "b" is later set to "true" as part of another
     * file's compilation, which will change the behavior of the previous files's compiled code.
     *
     * Note: This doesn't prevent global functions from being renamed, i.e., it will still rename
     * "function MyObject(){...}" to "function b(){...}", leaving the "b" function in the global namespace. This is true
     * even if "b" is exported in the standard way (window["MyObject"] = MyObject).
     *
     * TODO the keyword renaming can cause issues, but would the prototype renaming cause any code conflicts?
     */
    CLOSURE_ADVANCED_SAFER {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
            options.aliasKeywords = false;
            options.extractPrototypeMemberDeclarations = false;
        }
    },

    CLOSURE_AURA_DEBUG {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            options.prettyPrint = true;
            options.generatePseudoNames = true;
            options.aliasKeywords = true;
            options.reserveRawExports = true;
            options.variableRenaming = VariableRenamingPolicy.OFF;
            options.propertyRenaming = PropertyRenamingPolicy.ALL_UNQUOTED;
        }

        @Override
        public boolean isSelfScoping() {
            return true;
        }
    },

    CLOSURE_AURA_PROD {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.ADVANCED_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
            options.aliasAllStrings = true;
        }

        @Override
        public boolean isSelfScoping() {
            return true;
        }
    },

    /**
     * This is a special corner case, to skip Closure entirely.
     */
    WITHOUT_CLOSURE {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            // This could be a no-op, but if you're even asking about closure
            // options here, you're in the wrong place, so it throws instead.
            throw new UnsupportedOperationException();
        }

        @Override
        public List<JavascriptProcessingError> compress(String in, Writer out, String filename) throws IOException {
            out.append(in);
            return new ArrayList<JavascriptProcessingError>();
        }
    };

    public static final JavascriptWriter DEFAULT = CLOSURE_SIMPLE;

    /** Gets the Closure CompilationLevel for this compression. */
    public abstract void setClosureOptions(CompilerOptions options);

    /**
     * I'm not sure this is exactly "compression level," but it's here for hysterical raisins: some of our closure runs
     * want to be run in an anonymous function, so they explicitly export anything that should survive.
     */
    public boolean isSelfScoping() {
        return false;
    }

    /**
     * Compress using Closure Compiler using the options for this compression level.
     *
     * @param in Javascript source.
     * @param out Write the compressed source to this Writer.
     * @param filename Name used for error reporting, etc...
     * @throws IOException
     *
     * @TODO nmcwilliams: set externs file properly.
     */
    public List<JavascriptProcessingError> compress(String in, Writer out, String filename) throws IOException {
        SourceFile input = SourceFile.fromCode(filename, in);
        return compress(input, out, null, filename, null);
    }

    /**
     * Reader-based compression.
     */
    public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
        SourceFile input = SourceFile.fromReader(filename, in);
        return compress(input, out, null, filename, null);
    }

    /**
     * Compress source file and generate associated sourcemap.
     * @param sourceFileReader source Javascrpt file reader
     * @param compressedFileWriter Compressed Javascript file writer
     * @param sourceMapWriter Source map writer
     * @param filename Source javascript file name
     * @param sourceMapLocationMapping Source file path mapping.
     * @return
     * @throws IOException
     */
    public List<JavascriptProcessingError> compress(Reader sourceFileReader, Writer compressedFileWriter, Writer sourceMapWriter,  String filename, Map<String, String> sourceMapLocationMapping) throws IOException {
        SourceFile input = SourceFile.fromReader(filename, sourceFileReader);
        return compress(input, compressedFileWriter, sourceMapWriter, filename, sourceMapLocationMapping);
    }

    /**
     * Does the actual compression work.
     */
    private List<JavascriptProcessingError> compress(SourceFile in, Writer out, Writer sourceMapWriter, String filename, Map<String, String> sourceMapLocationMapping) throws IOException {
        List<JavascriptProcessingError> msgs = new ArrayList<JavascriptProcessingError>();
        // Do some actual closure variation:
        Compiler c = new Compiler();

        Compiler.setLoggingLevel(Level.WARNING);
        CompilerOptions options = new CompilerOptions();
        options.sourceMapFormat = SourceMap.Format.V3;
        options.sourceMapOutputPath = filename;

        //Add source file mapping, useful for relocating source files on a server or removing repeated values in the “sources” entry
        if(sourceMapLocationMapping != null && !sourceMapLocationMapping.isEmpty()) {
            options.sourceMapLocationMappings = new ArrayList<SourceMap.LocationMapping>();
            for(Map.Entry<String, String> entry : sourceMapLocationMapping.entrySet()) {
                options.sourceMapLocationMappings.add(new SourceMap.LocationMapping(entry.getKey(), entry.getValue()));
            }
        }

        setClosureOptions(options);

        Result result = c.compile(externs, Lists.<SourceFile> newArrayList(in), options);

        if (isSelfScoping()) {
            // Encase the compressed output in a self-executing function to
            // scope everything.
            // Global APIs are exported explicitly in the code.
            out.append("(function(){");
        }
        out.write(c.toSource());
        if (isSelfScoping()) {
            // Encase the compressed output in a self-executing function to
            // scope everything.
            // Global APIs are exported explicitly in the code.
            out.append("})();");
        }

        //Write sourcemap
        if(result != null && sourceMapWriter != null) {
            StringBuilder sb = new StringBuilder();
            result.sourceMap.validate(true);
            result.sourceMap.appendTo(sb, filename);

            sourceMapWriter.write(sb.toString());
        }

        // errors and warnings
        for (JSError e : c.getErrors()) {
            JavascriptProcessingError.makeError(msgs, e.description, e.lineNumber, e.getCharno(), in.getName(), null);
        }
        for (JSError e : c.getWarnings()) {
            JavascriptProcessingError.makeWarning(msgs, e.description, e.lineNumber, e.getCharno(), in.getName(), null);
        }
        return msgs;
    }

    private static final List<SourceFile> externs;

    static {
        try {
            externs = CommandLineRunner.getDefaultExterns();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
