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
package org.auraframework.docs;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

@Model
public class ApiTopicModel {

    private String title;
    private Map<String, Object> symbol;

    public ApiTopicModel() throws QuickFixException{
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?,?> component = context.getCurrentComponent();
        title = (String)component.getAttributes().getValue("topic");
        title = title.substring(4);

        symbol = ApiContentsModel.getSymbol(title);
    }

    @AuraEnabled
    public Map<String, Object> getSymbol(){
        return symbol;
    }

    @AuraEnabled
    public String getTitle(){
        return title;
    }

    @AuraEnabled
    public String getDescription() {
        String desc = symbol.get("classDesc").toString();
        if (desc != null && !desc.isEmpty()) {
            return desc;
        }
        try {
            return ((Map)((List)((Map)symbol.get("comment")).get("tags")).get(0)).get("desc").toString();
        } catch (Throwable t) {
            return "";
        }
    }
}
