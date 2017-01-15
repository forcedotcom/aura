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
package org.auraframework.impl.css.parser.plugin;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import com.salesforce.omakase.ast.atrule.FontDescriptor;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.data.Property;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.plugin.Plugin;

/**
 * TODONM: move this to core
 * Handles checking for font-faces declaring duplicate font-families.
 * <p>
 * This helps to catch situations that are usually mistakes, programming errors, or incompatible components.
 * <p>
 * You can optionally expand this check to include not just the font-family name but all recognized font-descriptors
 * within the font-face block. This might be useful if you purposefully duplicate font-family names in order to apply
 * different font-styles, font-weights, etc... You can also optionally allow for a CSS comment annotation on both
 * duplicate font-faces to bypass this check. See the constructors for more information.
 *
 */
public final class DuplicateFontFacePlugin implements Plugin {
    private static final String MSG = "The @font-face for '%s' was already declared in '%s' with %s. This is either a programming error or an incompatibility between components.";

    private static final String OPTION_NAME_ONLY = "the same font-name (including other font-descriptors in this check is not enabled)";
    private static final String OPTION_CHECK_ALL = "equivalent (applicable) font descriptors";

    private static final String ANNOTATION = "allowDuplicate";

    private final Map<FontKey, Value> declared = new HashMap<>();

    public final boolean allowDuplicatesWithAnnotation;
    private final boolean checkAllFontDescriptors;

    /**
     * Constructs a new {@link DuplicateFontFacePlugin} that by default allows font-faces to bypass this check with a
     * CSS comment annotation, and also expands the check to all recognized font-descriptors within the font-face block.
     */
    public DuplicateFontFacePlugin() {
        this(true, true);
    }

    /**
     * Constructs a new {@link DuplicateFontFacePlugin} with the given options.
     *
     * @param allowDuplicatesWithAnnotation Specify true to allow this check to be skipped for font-faces that have a
     *            CSS comment with the content <code>/&#42; {@code @}allowDuplicate &#42;/</code> before the font-family
     *            name. All duplicate font-faces must contain this annotation.
     * @param checkFontAllDescriptors Specify true to expand the check to all font-descriptors within the font-face
     *            block and not just the font-family. If true, this means both font-faces must have the same font-family
     *            name and the same value (or lack of value) for each recognized font-descriptor (excluding src) to be
     *            considered duplicate.
     */
    public DuplicateFontFacePlugin(boolean allowDuplicatesWithAnnotation, boolean checkFontAllDescriptors) {
        this.allowDuplicatesWithAnnotation = allowDuplicatesWithAnnotation;
        this.checkAllFontDescriptors = checkFontAllDescriptors;
    }

    @Validate
    public void checkDuplicateFontFace(FontDescriptor descriptor, ErrorManager em) {
        if (!descriptor.isProperty(Property.FONT_FAMILY)) {
            return;
        }

        // get the font name from keyword value or string value (this will exclude quotes if a string)
        Optional<String> name = descriptor.propertyValue().singleTextualValue();
        if (!name.isPresent()) {
            return; // we assumed only one term (keyword or string). If that doesn't hold true we'll end up here
        }

        // check other descriptors in the same block
        String fontStyle = null;
        String fontWeight = null;
        String fontStretch = null;
        String fontVariant = null;
        String unicodeRange = null;
        String fontFeatureSettings = null;

        if (checkAllFontDescriptors) {
            for (FontDescriptor sibling : descriptor.group()) {
                if (sibling.isProperty(Property.FONT_STYLE)) {
                    fontStyle = sibling.propertyValue().singleTextualValue().get();
                } else if (sibling.isProperty(Property.FONT_WEIGHT)) {
                    fontWeight = sibling.propertyValue().singleTextualValue().get();
                } else if (sibling.isProperty(Property.FONT_STRETCH)) {
                    fontStretch = sibling.propertyValue().singleTextualValue().get();
                } else if (sibling.isProperty(Property.FONT_VARIANT)) {
                    fontVariant = sibling.propertyValue().singleTextualValue().get();
                } else if (sibling.isProperty(Property.UNICODE_RANGE)) {
                    unicodeRange = sibling.propertyValue().singleTextualValue().get();
                } else if (sibling.isProperty(Property.FONT_FEATURE_SETTINGS)) {
                    fontFeatureSettings = sibling.propertyValue().singleTextualValue().get();
                }
            }
        }

        FontKey key = new FontKey(name.get(),
                fontStyle, fontWeight, fontStretch, fontVariant, unicodeRange, fontFeatureSettings);

        // if a previous font-face with the same key was previously found then throw an error. However if enabled, the
        // CSS author can bypass this with the correct annotation on both font-faces.
        if (declared.containsKey(key)) {
            Value value = declared.get(key);
            boolean dupeAllowed = allowDuplicatesWithAnnotation && descriptor.hasAnnotation(ANNOTATION)
                    && value.allowsDuplicate;

            if (!dupeAllowed) {
                em.report(ErrorLevel.FATAL, descriptor, String.format(MSG,
                        name.get(),
                        value.source,
                        checkAllFontDescriptors ? OPTION_CHECK_ALL : OPTION_NAME_ONLY
                        ));
            }
        } else {
            boolean allowsDupe = allowDuplicatesWithAnnotation && descriptor.hasAnnotation(ANNOTATION);
            declared.put(key, new Value(em.getSourceName(), allowsDupe));
        }
    }

    private static final class FontKey {
        private final String fontName;
        private final String fontStyle;
        private final String fontWeight;
        private final String fontStretch;
        private final String fontVariant;
        private final String unicodeRange;
        private final String fontFeatureSettings;

        public FontKey(String fontName, String fontStyle, String fontWeight, String fontStretch,
                String fontVariant, String unicodeRange, String fontFeatureSettings) {
            this.fontName = fontName;
            this.fontStyle = fontStyle;
            this.fontWeight = fontWeight;
            this.fontStretch = fontStretch;
            this.fontVariant = fontVariant;
            this.unicodeRange = unicodeRange;
            this.fontFeatureSettings = fontFeatureSettings;
        }

        @Override
        public int hashCode() {
            return Objects.hash(fontName, fontStyle, fontWeight, fontStretch, fontVariant, unicodeRange,
                    fontFeatureSettings);
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof FontKey) {
                final FontKey other = (FontKey) obj;
                return Objects.equals(fontName, other.fontName)
                        && Objects.equals(fontStyle, other.fontStyle)
                        && Objects.equals(fontWeight, other.fontWeight)
                        && Objects.equals(fontStretch, other.fontStretch)
                        && Objects.equals(fontVariant, other.fontVariant)
                        && Objects.equals(unicodeRange, other.unicodeRange)
                        && Objects.equals(fontFeatureSettings, other.fontFeatureSettings);
            }
            return false;
        }
    }

    private static final class Value {
        String source;
        boolean allowsDuplicate;

        public Value(String source, boolean allowsDuplicate) {
            this.source = source;
            this.allowsDuplicate = allowsDuplicate;
        }
    }
}
