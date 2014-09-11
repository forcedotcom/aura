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
package org.auraframework.instance;

import java.io.IOException;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * A 'stack' of components specifying the position in the tree.
 *
 * This stack is used during component creation on the server to build up and
 * maintain a tree position for communicating with the client. This tree
 * position must exactly match, or everything breaks.
 *
 * Because this is such a sensitive area, we do a variety of very careful checks
 * to ensure that we blow up if there is any indication that we might have
 * gotten out of sync.
 *
 * In an ideal world, we would not have to maintain this because we would know
 * our 'parentage', but that is much easier said than done.
 */
public class InstanceStack {
    public InstanceStack() {
        this.path = new StringBuilder();
        this.stack = Lists.newArrayList();
        this.current = new Entry(null, path.length());
        setAttributeName("body");
        setAttributeIndex(0);
        this.current.top = true;
        this.base = path.toString();
        this.topUnprivileged = null;
    }

    /**
     * start processing a component.
     */
    public void pushInstance(Instance<?> instance, DefDescriptor<?> desc) {
        if (topUnprivileged == null) {
            if (!Aura.getConfigAdapter().isPrivilegedNamespace(desc.getNamespace())) {
                topUnprivileged = instance;
            }
        }
        stack.add(current);
        current = new Entry(instance, path.length());
    }

    /**
     * start processing a component.
     */
    public void popInstance(Instance<?> instance) {
        if (current.instance != instance) {
            throw new AuraRuntimeException("mismatched instance pop");
        }
        if (topUnprivileged == instance) {
            topUnprivileged = null;
        }
        current = stack.remove(stack.size() - 1);
        if (current.top) {
            int index = current.index;
            clearAttributeIndex(index);
            setAttributeIndex(index + 1);
        }
    }

    /**
     * Ensure that we have the expected parent.
     *
     * This is used by parented items to ensure that their parent is on the
     * stack. This is required in the case that something is changed outside of
     * the tree traversal. In which case this routine will pre-fill the path to
     * the correct point.
     */
    public void markParent(Instance<?> parent) {
        if (!current.top) {
            if (current.instance != parent) {
                throw new AuraRuntimeException("Don't know how to handle setAttribute here");
            }
            current.count += 1;
        } else {
            path.setLength(0);
            path.append(parent.getPath());
            pushInstance(parent, parent.getDescriptor());
        }
    }

    /**
     * Clear the parent previously marked.
     */
    public void clearParent(Instance<?> parent) {
        if (current.instance != parent) {
            throw new AuraRuntimeException("mismatched clear parent");
        }
        if (current.count > 0) {
            current.count -= 1;
        } else {
            popInstance(parent);
            path.setLength(0);
            path.append(base);
        }
    }

    /**
     * set the name part on the stack.
     *
     * A name could be either an attribute name (e.g. body), or a predefined
     * name (i.e. $ for super class). Note that you _must_ clear the name after
     * setting it.
     */
    public void setAttributeName(String name) {
        if (current.name != null || current.top) {
            throw new AuraRuntimeException("Setting name illegally");
        }
        current.name = name;
        path.append("/");
        if (name.equals("body")) {
            path.append("*");
        } else if (name.equals("realbody")) {
            path.append("+");
        } else {
            path.append(name);
        }
        current.namePos = path.length();
    }

    /**
     * pop a previously pushed name off the stack.
     */
    public void clearAttributeName(String name) {
        if (!name.equals(current.name)) {
            throw new AuraRuntimeException("mismatched clearAttributeName for " + name);
        }
        current.name = null;
        path.setLength(current.startPos);
    }

    /**
     * push an index onto the stack.
     *
     * This must be pushed on to a 'name', as there is no way to index anything
     * else.
     */
    public void setAttributeIndex(int index) {
        if (current.name == null) {
            throw new AuraRuntimeException("no name when index set");
        }
        if (current.index != -1) {
            throw new AuraRuntimeException("missing clearAttributeIndex");
        }
        current.index = index;
        path.append("[");
        path.append(index);
        path.append("]");
    }

    /**
     * pop a previously pushed index off the stack.
     */
    public void clearAttributeIndex(int index) {
        if (current.index != index) {
            throw new AuraRuntimeException("mismatched clearAttributeIndex");
        }
        current.index = -1;
        path.setLength(current.namePos);
    }

    /**
     * get the current path.
     */
    public String getPath() {
        return path.toString();
    }

    /**
     * get the top of the stack.
     */
    public Instance<?> peek() {
        int size = stack.size();
		return size > 0 ? stack.get(size - 1).instance : null;
    }

    /** Get the next 'id' for a component.
     *
     * This is actually only used for server side rendering, as these IDs are never
     * serialized to the client.
     */
    public int getNextId() {
        return nextId++;
    }

    /**
     * Register a component with the stack.
     *
     * This arguably does not belong here, but it does make some sense that it
     * is associated with the instance stack that has the paths for the components.
     *
     * WARNING: This function should not be directly called, it should only be used by
     * the context, as critical accounting happens there.
     *
     * @param component the component to register
     */
    public void registerComponent(BaseComponent<?, ?> component) {
        if (componentRegistry == null) {
            componentRegistry = Maps.newLinkedHashMap();
        }
        //
        // We should be able to assert that the component is not in our registry, but
        // defaults mess this up. I'm not sure that we even care, so for the moment, we
        // do nothing. Not sure if it is worth investigating adding stricter checks.
        //
        //
        componentRegistry.put(component.getPath(), component);
    }

    /**
     * Get the set of components.
     *
     * @return a map of all the components needed by the action.
     */
    public Map<String, BaseComponent<?, ?>> getComponents() {
        if (componentRegistry == null) {
            return Collections.emptyMap();
        }
        return componentRegistry;
    }

    /**
     * Is the stack currently in an unprivileged state?
     *
     * @return true if we have passed through an unprivileged namespace on the way here.
     */
    public boolean isUnprivileged() {
        return topUnprivileged != null;
    }

    /**
     * A private class to sort by creation path.
     */
    private static class CreationPathSorter implements Comparator<BaseComponent<?, ?>> {
        @Override
        public int compare(BaseComponent<?, ?> arg0, BaseComponent<?, ?> arg1) {
            return arg0.getPath().compareTo(arg1.getPath());
        }
    }

    private static final CreationPathSorter CP_SORTER = new CreationPathSorter();

    public void serializeAsPart(Json json) throws IOException {
        Map<String, BaseComponent<?, ?>> components = this.getComponents();

        if (components.isEmpty()) {
            //
            // If there is nothing here, we don't need to do anything.
            //
            return;
        }
        List<BaseComponent<?, ?>> sorted = Lists.newArrayList();

        for (BaseComponent<?,?> component : components.values()) {
            if (component.hasLocalDependencies()) {
                sorted.add(component);
            }
        }
        if (!sorted.isEmpty()) {
            Collections.sort(sorted, CP_SORTER);
            json.writeMapKey("components");
            json.writeArray(sorted);
        }
    }

    /**
     * Internal routine to get a stack info frame.
     */
    private void addStackInfo(Entry e, List<String> info) {
        StringBuffer sb = new StringBuffer();
        if (e.instance != null) {
            sb.append(e.instance.getDescriptor());
            if (e.name != null) {
                sb.append(".");
                sb.append(e.name);
                if (e.index != -1) {
                    sb.append("[");
                    sb.append(e.index);
                    sb.append("]");
                }
            }
        }
        if (sb.length() > 0) {
            info.add(sb.toString());
        }
    }

    /**
     * Get the current instance stack.
     */
    public List<String> getStackInfo() {
        List<String> info = Lists.newArrayList();

        if (current != null) {
            addStackInfo(current, info);
        }
        if (stack != null) {
            for (Entry e : stack) {
                addStackInfo(e, info);
            }
        }
        return info;
    }

    private static class Entry {
        public final Instance<?> instance;
        public final int startPos;
        public String name;
        public int namePos;
        public int count;
        public int index;
        public boolean top;
        
        public Entry(Instance<?> instance, int startPos) {
            this.instance = instance;
            this.startPos = startPos;
            this.namePos = -1;
            this.name = null;
            this.count = 0;
            this.top = false;
            this.index = -1;
        }
    };

    private Map<String, BaseComponent<?, ?>> componentRegistry = null;
    private int nextId = 1;
    private StringBuilder path;
    private List<Entry> stack;
    private Entry current;
    private final String base;
    private Instance<?> topUnprivileged;
}
