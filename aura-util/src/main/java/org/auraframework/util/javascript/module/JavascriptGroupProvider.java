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
package org.auraframework.util.javascript.module;

import java.io.IOException;
import java.util.Collection;

import org.auraframework.util.javascript.JavascriptGroup;

/**
 * Interface that provides javascript groups. Each module that has javascript
 * has to implement this so the generation and app initialization can find the
 * groups from other modules. It also allows modules to access each others
 * javascript.
 */
public interface JavascriptGroupProvider {

    /**
     * The name should be the same as the module the javascript is in, its
     * primarily used as part of the url of the generated file, which is of the
     * form /sfdc/htdocs/javascript/module/group.js
     * 
     * @return the name of the module this is for
     */
    String getModuleName();

    /**
     * called once during app startup to create the javascript groups, this is
     * because some group metadata is kept in memory, specifically the lastmod
     * date of the group used for caching.
     */
    void initializeJavascriptGroups(boolean isProduction) throws IOException;

    /**
     * @return all the groups for this module, should only be used by the
     *         generator
     */
    Collection<? extends JavascriptGroup> getAllJavascriptGroups();

    /**
     * @param name of the group
     * @return the group, or null if there isn't one
     */
    JavascriptGroup getJavascriptGroupByName(String name);
}
