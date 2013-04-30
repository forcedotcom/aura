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

import java.io.*;
import java.util.List;
import java.util.Map;

import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.*;
import org.auraframework.util.javascript.directive.impl.DirectiveImpl;

/**
 * includes another file, expecting just the filename relative to the root in
 * java format (. instead of / as dir separator)
 */
public class ImportDirective extends DirectiveImpl {
        private File include;
        private DirectiveParser includedParser;
        private final String path;
        private String relativePath;
        private static final File destinationRoot = AuraImplFiles.AuraResourceJavascriptTestDirectory.asFile();
    
        public ImportDirective(int offset, String line) {
            super(offset, line);
            Map<String, Object> config = getConfig();
            if (config != null) {
                path = (String) config.get("path");
                assert path != null : "Path is required in import directive config";
            } else {
                path = getLine();
            }
        }
    
        @Override
        public void processDirective(DirectiveBasedJavascriptGroup group) throws IOException {
            AuraJavascriptGroup auraGroup = new AuraJavascriptGroup();
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
