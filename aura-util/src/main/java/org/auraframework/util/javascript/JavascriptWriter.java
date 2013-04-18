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

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

import com.google.common.collect.Lists;
import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.PropertyRenamingPolicy;
import com.google.javascript.jscomp.SourceFile;
import com.google.javascript.jscomp.VariableRenamingPolicy;

/**
 * Util for compressing and writing javascript.
 */
public class JavascriptWriter {

    private static final List<SourceFile> externs;

    static {
        try {
            externs = CommandLineRunner.getDefaultExterns();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public enum CompressionLevel {
        CLOSURE_SIMPLE {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
                return compressWithClosure(in, out, filename, CompilationLevel.SIMPLE_OPTIMIZATIONS);
            }
        },

        CLOSURE_WHITESPACE {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
                return compressWithClosure(in, out, filename, CompilationLevel.WHITESPACE_ONLY);
            }
        },

        CLOSURE_ADVANCED {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
                return compressWithClosure(in, out, filename, CompilationLevel.ADVANCED_OPTIMIZATIONS);
            }
        },

        /**
         * Closure Compiler using advanced optimizations, but avoids some
         * compiler-created global variables.
         * 
         * Closure does some optimizations that use global variables like so:
         * var b=false,f; Then it will use "b" in place of the "false" value. It
         * could also set "f" to the prototype of some object. It does all of
         * this to reduce the number of chars in the file. Unless accounted for,
         * this will cause issues since files are run through the compiler
         * individually. So it's possible that the global variable "b" is later
         * set to "true" as part of another file's compilation, which will
         * change the behavior of the previous files's compiled code.
         * 
         * Note: This doesn't prevent global functions from being renamed, i.e.,
         * it will still rename "function MyObject(){...}" to
         * "function b(){...}", leaving the "b" function in the global
         * namespace. This is true even if "b" is exported in the standard way
         * (window["MyObject"] = MyObject).
         * 
         * TODO the keyword renaming can cause issues, but would the prototype
         * renaming cause any code conflicts?
         */
        CLOSURE_ADVANCED_SAFER {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {

                CompilerOptions options = new CompilerOptions();
                CompilationLevel.ADVANCED_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
                options.aliasKeywords = false;
                options.extractPrototypeMemberDeclarations = false;

                return compressWithClosure(in, out, filename, options, true);
            }
        },
        CLOSURE_AURA_DEBUG {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
                // Encase the compressed output in a self-executing function to
                // scope everything.
                // Global APIs are exported explicitly in the code.
                out.append("(function(){");
                CompilerOptions options = new CompilerOptions();

                options.prettyPrint = true;
                options.generatePseudoNames = true;
                options.aliasKeywords = true;
                options.reserveRawExports = true;
                options.variableRenaming = VariableRenamingPolicy.OFF;
                options.propertyRenaming = PropertyRenamingPolicy.ALL_UNQUOTED;

                List<JavascriptProcessingError> ret = compressWithClosure(in, out, filename, options, false);
                out.append("})();");
                return ret;
            }
        },
        CLOSURE_AURA_PROD {
            @Override
            public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
                // Encase the compressed output in a self-executing function to
                // scope the generated vars.
                // Global APIs are exported explicitly in the code.
                out.append("(function(){");
                CompilerOptions options = new CompilerOptions();
                CompilationLevel.ADVANCED_OPTIMIZATIONS.setOptionsForCompilationLevel(options);

                options.aliasAllStrings = true;

                List<JavascriptProcessingError> ret = compressWithClosure(in, out, filename, options, false);
                out.append("})();");
                return ret;
            }
        };

        public static final CompressionLevel DEFAULT = CLOSURE_SIMPLE;

        public abstract List<JavascriptProcessingError> compress(Reader in, Writer out, String filename)
                throws IOException;
    }

    /**
     * Compresses and writes javascript. Uses the default Javascript compression
     * method.
     * 
     * @param in Javascript source.
     * @param out Write the compressed source to this Writer.
     * @param filename Name used for error reporting, etc...
     * @throws IOException
     */
    public static void writeCompressed(Reader in, Writer out, String filename) throws IOException {
        CompressionLevel.DEFAULT.compress(in, out, filename);
    }

    /**
     * Compresses a JavaScript file and returns the result of the compression as
     * a String. Does NOT save the results of the compression to the file
     * system.
     * 
     * @param filepath Get the compressed version of this file.
     * @return The compressed/minified source for the given file.
     * @throws IOException
     */
    public static String getCompressedSource(String filepath) throws IOException {
        StringWriter out = new StringWriter();
        Reader in = null;
        try {
            in = new FileReader(filepath);
            writeCompressed(in, out, filepath);
        } finally {
            if (in != null) {
                in.close();
            }
        }
        return out.toString();
    }

    /**
     * Compress using Closure Compiler using the given CompilationLevel.
     * 
     * @param in Javascript source.
     * @param out Write the compressed source to this Writer.
     * @param filename Name uised for error reporting, etc...
     * @param level Closure compiler compilation level to use.
     * @throws IOException
     */
    private static List<JavascriptProcessingError> compressWithClosure(Reader in, Writer out, String filename,
            CompilationLevel level) throws IOException {
        CompilerOptions options = new CompilerOptions();
        level.setOptionsForCompilationLevel(options);
        return compressWithClosure(in, out, filename, options, true);
    }

    /**
     * Compress using Closure Compiler using the given options.
     * 
     * @param in Javascript source.
     * @param out Write the compressed source to this Writer.
     * @param filename Name used for error reporting, etc...
     * @param options Options to use for compression.
     * @throws IOException
     * 
     * @TODO nmcwilliams: set externs file properly.
     */
    private static List<JavascriptProcessingError> compressWithClosure(Reader in, Writer out, String filename,
            CompilerOptions options, boolean useSeparateThread) throws IOException {
        Compiler c = new Compiler();
        if (!useSeparateThread) {
            c.disableThreads();
        }

        Compiler.setLoggingLevel(Level.WARNING);
        SourceFile input = SourceFile.fromReader(filename, in);

        c.compile(externs, Lists.<SourceFile> newArrayList(input), options);
        out.write(c.toSource());

        // errors and warnings
        List<JavascriptProcessingError> msgs = new ArrayList<JavascriptProcessingError>();
        for (JSError e : c.getErrors()) {
            JavascriptProcessingError.makeError(msgs, e.description, e.lineNumber, e.getCharno(), filename, null);
        }
        for (JSError e : c.getWarnings()) {
            JavascriptProcessingError.makeWarning(msgs, e.description, e.lineNumber, e.getCharno(), filename, null);
        }
        return msgs;
    }
}
