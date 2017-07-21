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
package org.auraframework.util.javascript.directive;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.concurrent.CountDownLatch;

import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.CommonJavascriptGroupImpl;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.resource.ResourceLoader;
import org.auraframework.util.text.Hash;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

/**
 * Javascript group that contains directives for parsing instructions or metadata or other fun stuff. It starts from one
 * file which should include the others.
 */
public class DirectiveBasedJavascriptGroup extends CommonJavascriptGroupImpl {
    /**
     * We spawn multiple threads to go the per-mode generation, and throw this to indicate at least one failure. When
     * printed, this exception will have a "caused by" stack trace for the first error, but its message will identify
     * the cause (and failing thread, which hints at the compilation mode) for each error encountered.
     */
    public static class CompositeRuntimeException extends RuntimeException {
        private static final long serialVersionUID = 7863307967596024441L;

        public Map<String, Throwable> errors;

        public CompositeRuntimeException(String message, Map<String, Throwable> errors) {
            super(message, errors == null || errors.isEmpty() ? null : errors.get(0));
            this.errors = errors;
        }

        /** Prints an overall summary, and the message of each error. */
        @Override
        public String toString() {
            StringBuilder builder = new StringBuilder();
            builder.append(getClass().getName());
            String message = getMessage();
            if (message != null && message.isEmpty()) {
                message = null;
            }
            if (message != null || errors.size() > 0) {
                builder.append(": ");
            }
            if (message != null) {
                builder.append(message);
                builder.append("\n");
            }
            if (errors.size() > 0) {
                builder.append(errors.size());
                builder.append(" threads failed with throwables\n");
                for (Map.Entry<String, Throwable> ent : errors.entrySet()) {
                    builder.append("[");
                    builder.append(ent.getKey());
                    builder.append("] ");
                    Throwable thrown = ent.getValue();
                    builder.append(thrown.getClass().getName());
                    message = thrown.getMessage();
                    if (message != null && !message.isEmpty()) {
                        builder.append(": ");
                        builder.append(message);
                    }
                    builder.append("\n");
                }
            }
            return builder.toString();
        }
    }

    // Caching for resources
    private static final String LIB_CACHE_TEMP_DIR = IOUtil.newTempDir("auracache");

    // name for threads that compress and write the output
    public static final String THREAD_NAME = "jsgen.";

    private static final String COMPAT_SUFFIX = "_compat";

    private final List<DirectiveType<?>> directiveTypes;
    private final Set<JavascriptGeneratorMode> modes;
    private final File startFile;
    private CountDownLatch counter;
    private Map<String, Throwable> errors;

    private String librariesContent = "";
    private String librariesContentMin = "";

    private String secureEval = "";
    private String secureEvalMin = "";

    private String engine = "";
    private String engineMin = "";
    private String engineCompat= "";
    private String engineCompatMin = "";
    private String engineProdDebug = "";
    private String engineCompatProdDebug = "";

    // used during parsing, should be clear for storing in memory
    private DirectiveParser parser;

    private ResourceLoader resourceLoader = null;

    public DirectiveBasedJavascriptGroup(String name, File root, String start) throws IOException {
        this(name, root, start, DirectiveTypes.DEFAULT_TYPES, EnumSet.of(JavascriptGeneratorMode.DEVELOPMENT,
                JavascriptGeneratorMode.PRODUCTION));
        errors = null;
    }

    public DirectiveBasedJavascriptGroup(String name, File root, String start, List<DirectiveType<?>> directiveTypes,
            Set<JavascriptGeneratorMode> modes) throws IOException {
        super(name, root);
        this.directiveTypes = directiveTypes;
        this.modes = modes;
        this.startFile = addFile(start);

    }

    public List<DirectiveType<?>> getDirectiveTypes() {
        return directiveTypes;
    }

    public File getStartFile() {
        return startFile;
    }

    public Set<JavascriptGeneratorMode> getJavascriptGeneratorModes() {
        return modes;
    }

    @Override
    public void parse() throws IOException {
        parser = new DirectiveParser(this, getStartFile());
        parser.parseFile();
    }

    @Override
    public void generate(File destRoot, boolean doValidation) throws IOException {
        if (parser == null) {
            throw new RuntimeException("No parser available to generate with");
        }
        // generating all modes along with engine compatibility
        counter = new CountDownLatch(modes.size() * 2);
        errors = new HashMap<>();

        fetchIncludedSources();

        for (JavascriptGeneratorMode mode : modes) {
            generateForMode(destRoot, mode);
        }
        try {
            counter.await();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (!errors.isEmpty()) {
            throw new CompositeRuntimeException("Errors generating javascript for " + getName(), errors);
        }
        errors = null;
    }

    private void fetchIncludedSources() throws MalformedURLException {
        List<String> libraries = new ArrayList<>();
        libraries.add("aura/resources/moment/moment");
        libraries.add("aura/resources/moment-timezone/moment-timezone-with-data-1999-2020");
        libraries.add("aura/resources/DOMPurify/DOMPurify");

        StringJoiner libs = new StringJoiner("\n");
        StringJoiner libsMin = new StringJoiner("\n");

        libraries.forEach( (path) -> {
            String source = null;
            String minSource = null;
            try {
                source = getSource(path + ".js");
                minSource = getSource(path +".min.js");
            } catch (MalformedURLException e) {}
            if (source != null) {
                libs.add(source);
            }
            if (minSource != null) {
                libsMin.add(minSource);
            }
        });

        String libsContent = libs.toString();
        if (!libsContent.isEmpty()) {
            this.librariesContent = "\nAura.externalLibraries = function() {\n" + libsContent + "\n};";
        }

        String libsContentMin = libsMin.toString();
        if (!libsContentMin.isEmpty()) {
            this.librariesContentMin = "\nAura.externalLibraries = function() {\n" + libsContentMin + "\n};";
        }

        // Locker Secure Evaluator
        String secureEvalSource = null;
        String secureEvalMinSource = null;
        try {
            secureEvalSource = getSource("aura/resources/lockerservice/InlineSafeEval.js");
            secureEvalMinSource = getSource("aura/resources/lockerservice/InlineSafeEval.min.js");
        }  catch (MalformedURLException e) {}

        if (secureEvalSource != null) {
            this.secureEval = "\nInitSecureEval = function(scriptNonce) {\n" + secureEvalSource + "\n};";
        }

        if (secureEvalMinSource != null) {
            this.secureEvalMin = "\nInitSecureEval = function(scriptNonce) {\n" + secureEvalMinSource + "\n};";
        }


        // Engine
        String engineSource = null;
        String engineMinSource = null;
        String engineCompatSource = null;
        String engineCompatMinSource = null;
        String engineProdDebugSource = null;
        String engineCompatProdDebugSource = null;
        String compatHelpersSource = null;
        String compatHelpersMinSource = null;

        try {
            engineSource = getSource("aura/resources/engine/engine.js");
            engineMinSource = getSource("aura/resources/engine/engine.min.js");

            engineCompatSource = getSource("aura/resources/engine/engine_compat.js");
            engineCompatMinSource = getSource("aura/resources/engine/engine_compat.min.js");

            engineProdDebugSource = getSource("aura/resources/engine/engine_debug.js");
            engineCompatProdDebugSource = getSource("aura/resources/engine/engine_compat_debug.js");

            compatHelpersSource = getSource("aura/resources/compat-helpers/compat-helpers.js");
            compatHelpersMinSource = getSource("aura/resources/compat-helpers/compat-helpers.min.js");
        }  catch (MalformedURLException e) {}

        if (engineSource != null) {
            this.engine = "try {\n" + engineSource + "\n} catch (e) {}";
        }

        if (engineMinSource != null) {
            this.engineMin = "try { " + engineMinSource + " } catch (e) {}";
        }

        if (compatHelpersSource != null && engineCompatSource != null) {
            this.engineCompat = "try {\n" + compatHelpersSource + "\n" + engineCompatSource + "\n} catch (e) {}";
        }

        if (compatHelpersMinSource != null && engineCompatMinSource != null) {
            this.engineCompatMin = "try { " + compatHelpersMinSource + "\n" + engineCompatMinSource + " } catch (e) {}";
        }

        if (engineProdDebugSource != null) {
            this.engineProdDebug = "try { " + engineProdDebugSource + " } catch (e) {}";
        }

        if (compatHelpersSource != null && engineCompatProdDebugSource != null) {
            this.engineCompatProdDebug = "try {\n" + compatHelpersSource + "\n" + engineCompatProdDebugSource + "\n} catch (e) {}";
        }

        // TODO COMPAT : prefetch compat helper resources
    }

    private String getSource(String path) throws MalformedURLException {
        if (this.resourceLoader == null) {
            this.resourceLoader = new ResourceLoader(LIB_CACHE_TEMP_DIR, true);
        }
        URL lib = this.resourceLoader.getResource(path);
        String source = null;
        if (lib != null) {
            try {
                source = Resources.toString(lib, Charsets.UTF_8);
            } catch (IOException ignored) { }
        }
        return source;
    }

    protected void generateForMode(File destRoot, final JavascriptGeneratorMode mode) throws IOException {
        final File modeJs = new File(destRoot, getName() + "_" + mode.getSuffix() + ".js");
        final File modeCompatJs = new File(destRoot, getName() + "_" + mode.getSuffix() + COMPAT_SUFFIX + ".js");

        List<File> filesToWrite = new ArrayList<>();
        filesToWrite.add(modeJs);
        filesToWrite.add(modeCompatJs);

        final String everything = buildContent(mode);
        final String threadName = THREAD_NAME + mode;
        int writtenCount = 0;
        List<File> writtenFiles = new ArrayList<>();

        for (File file : filesToWrite) {
            if (file.exists()) {
                if (file.lastModified() < getLastMod()) {
                    file.delete();
                } else {
                    // its up to date already, skip
                    counter.countDown();
                    writtenFiles.add(file);
                    if (++writtenCount == 2) return; else continue;
                }
            }
            file.getParentFile().mkdirs();
        }

        Runnable writeMode = () -> {
            try {
                Writer writer = null;
                JavascriptWriter jsWriter = mode.getJavascriptWriter();
                boolean minified = jsWriter == JavascriptWriter.CLOSURE_AURA_PROD;
                String libs = minified ? librariesContentMin : librariesContent;
                String eval = mode.allowedInProduction() ? secureEvalMin : secureEval;

                StringWriter stringWriter = new StringWriter();
                jsWriter.compress(everything, stringWriter, modeJs.getName());
                String compressed = stringWriter.toString();

                // strip out spaces and comments for external libraries
                JavascriptWriter libsJsWriter = JavascriptWriter.CLOSURE_WHITESPACE_ONLY;
                StringWriter libsWriter = new StringWriter();
                libsJsWriter.compress(libs, libsWriter, modeJs.getName());
                String libsCompressed = libsWriter.toString();

                for (File output : filesToWrite) {
                    if (writtenFiles.contains(output)) continue;
                    try {
                        writer = new FileWriter(output);

                        if (mode != JavascriptGeneratorMode.DOC) {
                            // jsdoc errors when parsing engine.js
                            boolean isProdDebug = mode == JavascriptGeneratorMode.PRODUCTIONDEBUG;
                            boolean isCompat = output.getName().contains(COMPAT_SUFFIX);
                            String eng = minified ?
                                    (isCompat ? engineCompatMin : engineMin) :
                                    (isCompat ? ( isProdDebug ? engineCompatProdDebug : engineCompat) : ( isProdDebug ? engineProdDebug : engine));
                            writer.append(eng).append("\n");
                        }

                        writer.append(eval).append("\n");
                        writer.append(compressed).append("\n");
                        writer.append(libsCompressed).append("\n");

                    } finally {
                        if (writer != null) {
                            writer.close();
                        }
                        output.setReadOnly();
                        counter.countDown();
                    }
                }
            } catch (Throwable t) {
                // Store any problems, to be thrown in a composite runtime exception from the main thread.
                // Otherwise, they kill this worker thread but are basically ignored.
                errors.put(threadName, t);
            }
        };

        new Thread(writeMode, threadName).start();

    }

    protected String buildContent(JavascriptGeneratorMode mode) {
        return parser.generate(mode);
    }

    @Override
    public boolean isStale() {
        if (!isGroupHashKnown()) {
            return true;
        }
        // Otherwise, we're stale IFF we have changed contents.
        try {
            Hash currentTextHash = computeGroupHash(getFiles());
            return !currentTextHash.equals(getGroupHash());
        } catch (IOException e) {
            // presume we're stale; we'll probably try to regenerate and die from that.
            return true;
        }
    }

    @Override
    public void postProcess() {
        // parser isn't needed at runtime
        parser = null;
    }

    @Override
    public void regenerate(File destRoot) throws IOException {
        reset();
        // 202: Disable JS validation since we precompile definitions
        generate(destRoot, false);
        postProcess();
    }

    @Override
    public void reset() throws IOException {
        setContents(null, this.startFile);
        parse();
        getGroupHash(); // Ensure the new bundle knows its hash once the directives are parsed.
    }
}
