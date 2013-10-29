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

import java.io.File;
import java.io.FileFilter;

import org.auraframework.util.resource.CommonFileGroup;

/**
 * Implementation of the common stuff shared between the main javascript library in sfdc and the new directive based
 * javascript groups
 */
public abstract class CommonJavascriptGroupImpl extends CommonFileGroup implements JavascriptGroup {

    public CommonJavascriptGroupImpl(String name, File root) {
        super(name, root, JS_FILTER);
    }

    /**
     * Only js files
     */
    public static final FileFilter JS_FILTER = new FileFilter() {
        @Override
        public boolean accept(File f) {
            return f.getName().endsWith(".js");
        }
    };


}
