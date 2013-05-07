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
import java.io.IOException;

import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;

/**
 * Class for generating aura framework xUnit.js files
 */
public class GenerateXUnitJS {
    public static void main(String[] args) throws IOException {
                try{
                    File dest = new File(AuraImplFiles.AuraResourceJavascriptTestDirectory.asFile(), "xunitTests");
                    IOUtil.delete(dest);
                    File root = AuraImplFiles.AuraJavascriptTestSourceDirectory.asFile();
                    int prefixLength = root.getAbsolutePath().length() + 1;
                    for(File file : IOUtil.listFiles(root, true, true)){
                        String path = file.getAbsolutePath().substring(prefixLength);
                        DirectiveBasedJavascriptGroup group = new XUnitJavascriptGroup(path, root, path);
                        if (!dest.exists()) {
                            dest.mkdirs();
                        } else if (!dest.isDirectory()) {
                            throw new IOException(dest.getPath() + " is supposed to be a directory");
                        }
                        group.parse();
                        group.generate(dest, false);
                    }
                }catch(Throwable t){
                    t.printStackTrace();
                    System.exit(1);
                }
            }
}
