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
import java.util.EnumSet;

import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.javascript.directive.*;

import com.google.common.collect.ImmutableList;

public class XUnitJavascriptGroup extends DirectiveBasedJavascriptGroup {
    public static final ImportDirectiveType importType = new ImportDirectiveType();
    public static final ImmutableList<DirectiveType<?>> DIRECTIVES = ImmutableList.<DirectiveType<?>>of(importType);
    private static final File auraGroupRoot = AuraImplFiles.AuraJavascriptSourceDirectory.asFile();

    public XUnitJavascriptGroup(String name, File root, String start) throws IOException {
        super(name, root, start, DIRECTIVES, EnumSet.of(JavascriptGeneratorMode.DOC));
    }

    @Override
    public File addFile(String s) throws IOException {
        if(getStartFile() == null){
            return super.addFile(s);
        }else{
            File f = new File(auraGroupRoot, s);
            addFile(f);
            return f;
        }
    }
}
