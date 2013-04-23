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
package org.auraframework.components.ui;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

/**
 * Used by ui:tree and ui:treeTreeNode
 * 
 * @since 0.0.304
 */
public class TreeNode implements JsonSerializable, Comparable<TreeNode> {
    public TreeNode(String href, String title) {
        this(href, title, null);
    }

    public TreeNode(String href, String title, Map<String, Object> data) {
        this(href, title, null, false, data);
    }

    public TreeNode(String href, String title, List<TreeNode> children, boolean expanded) {
        this(href, title, children, expanded, null);
    }

    public TreeNode(String href, String title, List<TreeNode> children, boolean expanded, Map<String, Object> data) {
        this.href = href;
        this.title = title;
        this.children = children;
        this.expanded = expanded;
        this.data = data;
    }

    public void addChild(TreeNode child) {
        if (this.children == null) {
            this.children = Lists.newArrayList();
        }
        this.children.add(child);
    }

    @Override
    public void serialize(Json json) throws IOException {
        if (children != null) {
            Collections.sort(children);
        }

        json.writeMapBegin();
        json.writeMapEntry("href", href);
        json.writeMapEntry("title", title);
        json.writeMapEntry("children", children);
        json.writeMapEntry("expanded", expanded);
        json.writeMapEntry("data", data);

        json.writeMapEnd();
    }

    public List<TreeNode> getChildren() {
        return this.children;
    }

    public String getTitle() {
        return this.title;
    }

    public String getHref() {
        return this.href;
    }

    public boolean isExpanded() {
        return this.expanded;
    }

    @Override
    public int compareTo(TreeNode o) {
        if (this.equals(o)) {
            return 0;
        }
        return title.compareTo(o.title);
    }

    @Override
    public String toString() {
        if (children != null) {
            assert (this.href == null || this.href.isEmpty());
            return this.title;
        } else {
            return this.title + " => " + this.href;
        }
    }

    private final String title;
    private final String href;
    private List<TreeNode> children;
    private final boolean expanded;
    private final Map<String, Object> data;
}
