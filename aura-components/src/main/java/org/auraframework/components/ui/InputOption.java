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

import org.auraframework.data.*;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * A input option object has all the information to create an inputOption
 * component (inputCheckbox, inputRadio and inputSelectOption.
 * 
 * 
 * @since Touch.174.3
 */
public class InputOption implements HasLabel, HasName, HasSelected, HasValue, JsonSerializable {

    private final String label;
    private final String name;
    private final boolean selected;
    private final String value;

    public InputOption(String label, String name, boolean selected, String value) {
        this.label = label;
        this.name = name;
        this.selected = selected;
        this.value = value;
    }

    /**
     * Get the label.
     * 
     * @return the label of this option
     */
    @Override
    public String getLabel() {
        return this.label;
    }

    /**
     * Get the name.
     * 
     * @return the name of this option
     */
    @Override
    public String getName() {
        return this.name;
    }

    /**
     * Is the component selected.
     * 
     * @return the true if selected, otherwise false
     */
    @Override
    public boolean isSelected() {
        return this.selected;
    }

    /**
     * Get the value.
     * 
     * @return the value of this option
     */
    @Override
    public String getValue() {
        return this.value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("label", this.label);
        json.writeMapEntry("name", this.name);
        json.writeMapEntry("selected", this.selected);
        json.writeMapEntry("value", this.value);
        json.writeMapEnd();
    }

    @Override
    public String toString() {
        return String.format("InputOption(label[%s] name[%s] selected[%s] value[%s])", this.label, this.name,
                this.selected, this.value);
    }

}
