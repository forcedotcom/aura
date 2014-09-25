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
package org.auraframework.test.javascript;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.*;
import org.auraframework.util.javascript.directive.impl.DirectiveImpl;

/**
 * An import for xunit tests.
 *
 * includes another file, expecting just the filename relative to the root in
 * java format (. instead of / as dir separator), but writes it out as a new file, changinng the
 * import into an include of that path.
 */
public class ImportDirective extends DirectiveImpl {
    private File include;
    private DirectiveParser includedParser;
    private final String path;
    private String relativePath;
    private final File destinationRoot;
    private final File auraRoot;

    public ImportDirective(int offset, String line, File destinationRoot, File auraRoot) {
        super(offset, line);
        Map<String, Object> config = getConfig();
        if (config != null) {
            path = (String) config.get("path");
            assert path != null : "Path is required in import directive config";
        } else {
            path = getLine();
        }
        this.destinationRoot = destinationRoot;
        this.auraRoot = auraRoot;
    }

    @Override
    public void processDirective(DirectiveBasedJavascriptGroup group) throws IOException {
        DirectiveBasedJavascriptGroup auraGroup = new DirectiveBasedJavascriptGroup("auraTest",
                    auraRoot, "aura/Aura.js", DirectiveTypes.DEFAULT_TYPES,
                    EnumSet.of(JavascriptGeneratorMode.DEVELOPMENT));
        // get the file, group will do validation
        relativePath = path.replace('.', File.separatorChar) + ".js";
        this.include = group.addFile(relativePath);
        includedParser = new DirectiveParser(auraGroup, include);
        includedParser.parseFile();
    }

    @Override
    public String generateOutput(JavascriptGeneratorMode mode) {
        try{
            String code = includedParser.generate(mode);
            File output = new File(destinationRoot, relativePath);
            output.getParentFile().mkdirs();
            FileWriter writer = new FileWriter(output);
            try{
                writer.write(code);
            }finally{
                writer.close();
            }
        }catch(IOException e){
            throw new AuraRuntimeException(e);
        }
        return "[Import(\""+path+"\")]";
    }

    @Override
    public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
        return includedParser.validate(validator);
    }

}
