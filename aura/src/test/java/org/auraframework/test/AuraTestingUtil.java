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
package org.auraframework.test;

import java.io.File;
import java.util.Date;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;

public interface AuraTestingUtil {
    public static String UI_INPUT_TEXT = "markup://ui:inputText";
    public static String UI_INPUT_NUMBER = "markup://ui:inputNumber";
    public static String UI_INPUT_PHONE = "markup://ui:inputPhone";

    public static String UI_OUTPUT_NUMBER = "markup://ui:outputNumber";
    public static String UI_OUTPUT_TEXT = "markup://ui:outputText";
    public static String UI_OUTPUT_PHONE = "markup://ui:outputPhone";
    public static String UI_OUTPUT_PERCENT = "markup://ui:outputPercent";
    public static String UI_OUTPUT_DATETIME = "markup://ui:outputDateTime";
    public static String UI_OUTPUT_CURRENCY = "markup://ui:outputCurrency";

    public void setUp();
    public void tearDown();
    public File getAuraJavascriptSourceDirectory();
    public Set<SourceLoader> getAdditionalLoaders();

    /**
     * Retrieves the source of a component resource.
     * Note: Works only for markup://string:XXXXX components and not for any other namespace.
     *       By default, test util is aware of StringSourceLoader only.
     * @param descriptor Descriptor of the resource you want to see the source of
     */
    public Source<?> getSource(DefDescriptor<?> descriptor);

    public <T extends Definition> DefDescriptor<T> addSource(String contents, Class<T> defClass);

    public <T extends Definition> DefDescriptor<T> addSource(String name, String contents, Class<T> defClass);

    public <T extends Definition> DefDescriptor<T> addSource(String contents, Class<T> defClass, Date lastModified);

    public <T extends Definition> DefDescriptor<T> addSource(String name,String contents, Class<T> defClass, Date lastModified);
}
