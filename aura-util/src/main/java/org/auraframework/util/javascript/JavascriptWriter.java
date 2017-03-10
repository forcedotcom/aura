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
import java.util.*;

import org.auraframework.util.IOUtil;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
import com.google.javascript.jscomp.*;
import com.google.javascript.jscomp.CompilerOptions.LanguageMode;

import com.google.javascript.jscomp.Compiler;

/**
 * Util for compressing and writing javascript.
 */
public enum JavascriptWriter {

    CLOSURE_WHITESPACE {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(options);
            options.setPrettyPrint(true);
        }
    },
    
    CLOSURE_LIBRARY {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(options);
            options.setPrettyPrint(true);

            
        }
        @Override
        public void setCustomPasses(CompilerOptions options, AbstractCompiler compiler) {
        	Multimap<CustomPassExecutionTime, CompilerPass> passes = ArrayListMultimap.create();
        	passes.put(CustomPassExecutionTime.AFTER_OPTIMIZATION_LOOP, new JavascriptASTCommentSymbolsPass(compiler));
        	options.setCustomPasses(passes);
        	options.setSkipAllPasses(false);
        }
    },

    CLOSURE_SIMPLE {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
        }
    },

    CLOSURE_ADVANCED {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            CompilationLevel.ADVANCED_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
        }
    },

    CLOSURE_AURA_DEBUG {
        @Override
        public void setClosureOptions(CompilerOptions options) {
            options.setPrettyPrint(true);
            options.setGeneratePseudoNames(true);
            options.setReserveRawExports(true);
            options.setRenamingPolicy(VariableRenamingPolicy.OFF, PropertyRenamingPolicy.ALL_UNQUOTED);
            options.setGenerateExports(true);
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
            options.setAliasAllStrings(true);
            options.setGenerateExports(true);
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
            // No options since we don't actually do anything.
        }

        @Override
        public List<JavascriptProcessingError> compress(String in, Writer out, String filename) throws IOException {
            out.append(in);
            return new ArrayList<>();
        }

        @Override
        public List<JavascriptProcessingError> compress(InputStream in, Writer out, String filename)
                throws IOException {
        	IOUtil.copyStream(new InputStreamReader(in), out);
            return new ArrayList<>();
        }
        
        @Override
        public List<JavascriptProcessingError> compress(Reader in, Writer out, String filename) throws IOException {
            IOUtil.copyStream(in, out);
            return Collections.emptyList();
        }

        @Override
        public List<JavascriptProcessingError> compress(Reader sourceFileReader, Writer compressedFileWriter,
                Writer sourceMapWriter, String filename, Map<String, String> sourceMapLocationMapping) throws IOException {
            IOUtil.copyStream(sourceFileReader, compressedFileWriter);
            return Collections.emptyList();
        }
    };

    public static final JavascriptWriter DEFAULT = CLOSURE_SIMPLE;

    /** Gets the Closure CompilationLevel for this compression. */
    public abstract void setClosureOptions(CompilerOptions options);
    
    /** Set custom passes. */
    public void setCustomPasses (CompilerOptions options, AbstractCompiler compiler) {
    	return;
    }

    /**
     * To remove global namespace pollution, we wrap the compiled code inside a private scope by default.
     * Global APIs need to be exported explicitly to the global scope.
     */
    public boolean isSelfScoping() {
        return false;
    }

    /**
     * Encase the compressed output in an immediately-invoked function expression (IIFE).
     * This provides a private scope but no instance, therefore "this" still refers to encompassing scope.
     */
    // Keep for future implementations
//    private void wrapWithIIFE(Writer out, String source) throws IOException {
//        out.append("(function() {\n");
//        out.append(source);
//        out.append("\n)();");
//    }

    /**
     * Encase the compressed output in a immediately-invoked constructor (IIC).
     * This provides a private scope and an instance that can be access with "this".
     */
    private void wrapWithIIC(Writer out, String source) throws IOException {
        out.append("new function() {\n");
        out.append(source);
        out.append("\n};");
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
     *
     * @param sourceFileReader source Javascrpt file reader
     * @param compressedFileWriter Compressed Javascript file writer
     * @param sourceMapWriter Source map writer
     * @param filename Source javascript file name
     * @param sourceMapLocationMapping Source file path mapping.
     * @return
     * @throws IOException
     */
    public List<JavascriptProcessingError> compress(Reader sourceFileReader, Writer compressedFileWriter,
            Writer sourceMapWriter, String filename, Map<String, String> sourceMapLocationMapping) throws IOException {
        SourceFile input = SourceFile.fromReader(filename, sourceFileReader);
        return compress(input, compressedFileWriter, sourceMapWriter, filename, sourceMapLocationMapping);
    }

    /**
     * InputStream base compression
     *
     * @param in source stream
     * @param compressedFileWriter Compressed Javascript file writer
     * @param filename Source javascript file name
     * @return
     * @throws IOException
     */
    public List<JavascriptProcessingError> compress(InputStream in, Writer out, String filename) throws IOException {
        SourceFile input = SourceFile.fromInputStream(filename, in);
        return compress(input, out, null, filename, null);
    }

    /**
     * Does the actual compression work.
     */
    private List<JavascriptProcessingError> compress(SourceFile in, Writer out, Writer sourceMapWriter,
            String filename, Map<String, String> sourceMapLocationMapping) throws IOException {

        List<JavascriptProcessingError> msgs = new ArrayList<>();

        CompilerOptions options = new CompilerOptions();
        options.setCheckGlobalThisLevel(CheckLevel.OFF);
        options.setLanguageIn(LanguageMode.ECMASCRIPT5);
        options.setLanguageOut(LanguageMode.ECMASCRIPT5);

        if (sourceMapWriter != null) {
            options.sourceMapFormat = SourceMap.Format.V3;
            options.sourceMapOutputPath = filename;
        }

        // Add source file mapping, useful for relocating source files on a server or removing repeated values in the
        // “sources” entry
        if (sourceMapLocationMapping != null && !sourceMapLocationMapping.isEmpty()) {
            options.sourceMapLocationMappings = new ArrayList<>();
            for (Map.Entry<String, String> entry : sourceMapLocationMapping.entrySet()) {
                options.sourceMapLocationMappings.add(new SourceMap.LocationMapping(entry.getKey(), entry.getValue()));
            }
        }


        // Disable reporting non-standard jsdoc comments as warnings. Should have been able to do:
        // options.setWarningLevel(DiagnosticGroups.NON_STANDARD_JSDOC, CheckLevel.OFF);
        options.addWarningsGuard(NON_STANDARD_JSDOC_GUARD);

        try {
            Compiler compiler = new Compiler();
            setClosureOptions(options);
            setCustomPasses(options, compiler);

            // use a custom error manager so that we can keep the error source code snippet
            // it makes more sense for the line and char number with the code snippet.
            CustomErrorManager manager = new CustomErrorManager(ErrorFormat.MULTILINE.toFormatter(compiler, false));
            compiler.setErrorManager(manager);
            Result result = compiler.compile(externs, Arrays.asList(in), options);
            String source = compiler.toSource();

            if (isSelfScoping()) {
                // We use an IIC to make goog.local point to the local scope via "this".
                wrapWithIIC(out, source);
            } else {
                out.append(source);
            }

            // Write sourcemap
            if (result != null && sourceMapWriter != null) {
                StringBuilder sb = new StringBuilder();
                result.sourceMap.validate(true);
                result.sourceMap.appendTo(sb, filename);

                sourceMapWriter.write(sb.toString());
            }

            // errors and warnings
            for (JSError e : compiler.getErrors()) {
                JavascriptProcessingError.makeError(msgs, manager.getErrorMessage(), e.lineNumber, e.getCharno(),
                        in.getName(), null);
            }
            for (JSError e : compiler.getWarnings()) {
                JavascriptProcessingError.makeWarning(msgs, manager.getErrorMessage(), e.lineNumber, e.getCharno(),
                        in.getName(), null);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return msgs;
    }



	// Diagnostic type appears to be inconsistent with DiagnosticGroups.NON_STANDARD_JSDOC -
    // https://code.google.com/p/closure-compiler/issues/detail?id=1156
    private static final WarningsGuard NON_STANDARD_JSDOC_GUARD = new WarningsGuard() {
        private static final long serialVersionUID = 4797480123361380748L;

        @Override
        public CheckLevel level(JSError error) {
            if ("Parse error. Non-JSDoc comment has annotations. Did you mean to start it with '/**'?"
                    .equals(error.description)) {
                return CheckLevel.OFF;
            }
            if ("Parse error. illegal use of unknown JSDoc tag \"platform\"; ignoring it"
                    .equals(error.description)) {
                return CheckLevel.OFF;
            }
            if ("Parse error. illegal use of unknown JSDoc tag \"alias\"; ignoring it"
                    .equals(error.description)) {
                return CheckLevel.OFF;
            }
            return error.getDefaultLevel();
        }
    };

    private static final List<SourceFile> externs;

    static {
        try {
            externs = CommandLineRunner.getDefaultExterns();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

   public  class CustomErrorManager extends BasicErrorManager {
        private final MessageFormatter formatter;
        private String errorMessage;
        private String errorSummary;

        public CustomErrorManager(MessageFormatter formatter) {
            this.formatter = formatter;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public String getErrorSummary() {
            return errorSummary;
        }

        @Override
        public void println(CheckLevel level, JSError error) {
            switch (level) {
            case ERROR:
                errorMessage = error.format(level, formatter);
                break;
            case WARNING:
                errorMessage = error.format(level, formatter);
                break;
            case OFF:
                break;
            }
        }

        @Override
        protected void printSummary() {
            if (getTypedPercent() > 0.0) {
                errorSummary = String.format("{0} error(s), {1} warning(s), {2,number,#.#}% typed",
                        new Object[] { getErrorCount(), getWarningCount(), getTypedPercent() });
            } else {
                if (getErrorCount() + getWarningCount() > 0) {
                    errorSummary = String.format("{0} error(s), {1} warning(s)",
                            new Object[] { getErrorCount(), getWarningCount() });
                }
            }
        }
    }
}
