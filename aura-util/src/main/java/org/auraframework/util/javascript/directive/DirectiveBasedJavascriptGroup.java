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
package org.auraframework.util.javascript.directive;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringReader;
import java.io.Writer;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;

import org.auraframework.util.javascript.CommonJavascriptGroupImpl;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.JavascriptWriter.CompressionLevel;
import org.auraframework.util.text.Hash;

/**
 * Javascript group that contains directives for parsing instructions or metadata or other fun stuff. It starts from one
 * file which should include the others.
 */
public class DirectiveBasedJavascriptGroup extends CommonJavascriptGroupImpl {
    // name for threads that compress and write the output
    public static final String THREAD_NAME = "jsgen.";

    private final List<DirectiveType<?>> directiveTypes;
    private final Set<JavascriptGeneratorMode> modes;
    private final File startFile;
    private CountDownLatch counter;

    // used during parsing, should be clear for storing in memory
    private DirectiveParser parser;

    public DirectiveBasedJavascriptGroup(String name, File root, String start) throws IOException {
        this(name, root, start, DirectiveTypes.DEFAULT_TYPES, EnumSet.of(JavascriptGeneratorMode.DEVELOPMENT,
                JavascriptGeneratorMode.PRODUCTION));
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
        if (doValidation) {
            validate();
        }

        counter = new CountDownLatch(modes.size());
        for (JavascriptGeneratorMode mode : modes) {
            generateForMode(destRoot, mode);
        }
        try {
            counter.await();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public void validate() throws IOException {
        JavascriptValidator jsv = new JavascriptValidator();
        List<JavascriptProcessingError> errors = parser.validate(jsv);
        if (!errors.isEmpty()) {
            StringBuilder errorSb = new StringBuilder();
            for (JavascriptProcessingError error : errors) {
                errorSb.append(error.toString());
                errorSb.append('\n');
            }
            throw new RuntimeException(errorSb.toString());
        }
    }

    protected void generateForMode(File destRoot, final JavascriptGeneratorMode mode) throws IOException {
        final File dest = new File(destRoot, getName() + "_" + mode.getSuffix() + ".js");
        if (dest.exists()) {
            if (dest.lastModified() < getLastMod()) {
                dest.delete();
            } else {
                // its up to date already, skip
                counter.countDown();
                return;
            }
        }
        final String everything = buildContent(mode);
        String threadName = THREAD_NAME + mode;
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Writer writer = null;
                    try {
                        writer = new FileWriter(dest);
                        CompressionLevel level = mode.getCompressionLevel();
                        if (level != null) {
                            level.compress(new StringReader(everything), writer, dest.getName());
                        } else {
                            writer.write(everything);
                        }
                        writer.write('\n');
                    } finally {
                        if (writer != null) {
                            writer.close();
                        }
                        dest.setReadOnly();
                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                } finally {
                    counter.countDown();
                }
            }
        }, threadName);
        t.start();
    }

    protected String buildContent(JavascriptGeneratorMode mode) {
        return parser.generate(mode);
    }

    @Override
    public boolean isStale() {
        // Short circuit the unknown-contents case; it's always stale.
        if (groupHash == null) {
            return true;
        }

        // Otherwise, we're stale IFF we have changed contents.
        try {
            Hash currentTextHash = computeGroupHash();
            return !currentTextHash.equals(groupHash);
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
        addFile(this.startFile);
        parse();
        generate(destRoot, true);
        postProcess();
    }
}
