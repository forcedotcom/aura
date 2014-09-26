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

import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveType;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

import com.google.common.collect.ImmutableList;

/**
 * Class for generating aura framework xUnit.js files.
 *
 * This, oddly, must take four arguments These areguments are:
 * <ul>
 * <li>The source directory (will walk the tree).
 * <li>The aura implementation (or place from which we import files)
 * <li>The destination directory (imported files go here)
 * <li>The name of the test set (the compiled tests go under dest/name/the_rest
 * </ul>
 *
 * This could perhaps be done differently, but for the moment it works.
 */
public class GenerateXUnitJS {
    public static void main(String[] args) throws IOException {
        String source, impl, dest, testName;
        
        try {
            source = args[0];
            impl = args[1];
            dest = args[2];
            testName = args[3];
        } catch (Throwable t) {
            System.err.println("You must supply source, implementation, and destination files, and a test name");
            System.exit(1);
            return;
        }
        File source_f = new File(source);
        File impl_f = new File(impl);
        File aura_dest_f = new File(dest);
        File dest_f = new File(aura_dest_f, testName);
        if (!source_f.exists() || !source_f.isDirectory() || !source_f.canRead()) {
            System.err.println("Source file must be a readable directory: "+source_f.getPath());
            System.exit(1);
        }
        if (!impl_f.exists() || !impl_f.isDirectory() || !impl_f.canRead()) {
            System.err.println("Impl file must be a readable directory: "+impl_f.getPath());
            System.exit(1);
        }
        try {
            IOUtil.delete(dest_f);
        } catch (IOUtil.DeleteFailedException dfe) {
            // ignore
        }
        dest_f.mkdirs();
        if (!dest_f.exists() || !dest_f.isDirectory() || !dest_f.canRead()) {
            System.err.println("Impl file must be a readable directory: "+dest_f.getPath());
            System.exit(1);
        }
        ImportDirectiveType importType = new ImportDirectiveType(aura_dest_f, impl_f);
        ImmutableList<DirectiveType<?>> DIRECTIVES = ImmutableList.<DirectiveType<?>> of(importType);
        int prefixLength = source_f.getAbsolutePath().length() + 1;
        for(File file : IOUtil.listFiles(source_f, true, true)){
            try {
                String path = file.getAbsolutePath();
                String name = path.substring(prefixLength);
                DirectiveBasedJavascriptGroup group = new DirectiveBasedJavascriptGroup(name,
                        impl_f, path, DIRECTIVES, EnumSet.of(JavascriptGeneratorMode.DOC));
                group.parse();
                group.generate(dest_f, false);
            } catch(Throwable t) {
                System.err.println("Failed to parse "+file.getPath());
                t.printStackTrace();
                System.exit(1);
            }
        }
    }
}
