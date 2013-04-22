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
package org.auraframework.docs;

import java.util.List;

import org.auraframework.def.HtmlTag;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

import com.google.common.collect.Lists;

@Model
public class HtmlTagsModel {

    private final List<String> allowedTags = Lists.newArrayList();
    private final List<String> disallowedTags = Lists.newArrayList();

    public HtmlTagsModel() {
        for (HtmlTag tag : HtmlTag.values()) {
            if (tag.isAllowed()) {
                allowedTags.add(tag.name());
            } else {
                disallowedTags.add(tag.name());
            }
        }
    }

    @AuraEnabled
    public List<String> getAllowedTags() {
        return allowedTags;
    }

    @AuraEnabled
    public List<String> getDisallowedTags() {
        return disallowedTags;
    }
}
