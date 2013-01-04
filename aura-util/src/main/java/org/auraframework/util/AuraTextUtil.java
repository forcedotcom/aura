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
package org.auraframework.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.google.common.collect.ObjectArrays;

/**
 * Collection of utility methods for manipulating or testing strings.
 */
public class AuraTextUtil {

    private static final String[] JS_IN = new String[] { "\\", "'", "\n", "\r", "\"", "!--", "<", ">", "\u2028", "\u2029", "\u0000" };
    private static final String[] JS_OUT = new String[] { "\\\\", "\\'", "\\n", "\\r", "\\\"", "\\u0021--", "\\u003C", "\\u003E", "\\n", "\\u2029", "" };
    private static final TrieMatcher JS_SEARCH_REPLACE = TrieMatcher.compile(JS_IN, JS_OUT);

    private static final String[] JSON_IN = new String[] { "\\", "\n", "\r", "\t", "\"", "!--", "<", ">", "\u2028", "\u2029", "\u0000" };
    private static final String[] JSON_OUT = new String[] { "\\\\", "\\n", "\\r", "\\t", "\\\"", "\\u0021--", "\\u003C", "\\u003E", "\\n", "\\u2029", "" };
    private static final TrieMatcher JSON_SEARCH_REPLACE = TrieMatcher.compile(JSON_IN, JSON_OUT);


    // replace escaped w/ non-escaped
    // w/o html tags
    private static final String[] ESCAPED_HTML = { "&lt;", "&gt;", "&amp;", "&quot;", "&apos;", "&#39;", "&copy;" };
    private static final String[] ESCAPED_TEXT = { "<", ">", "&", "\"", "'", "'", "©" };
    private static final TrieMatcher HTML_TO_TEXT_ESCAPED_ONLY = TrieMatcher.compile(ESCAPED_HTML, ESCAPED_TEXT);
    // w/ html tags
    private static final TrieMatcher HTML_TO_TEXT = TrieMatcher.compile(ObjectArrays.concat(ESCAPED_HTML,
            new String[] { "<br>", "<br/>" }, String.class), ObjectArrays.concat(ESCAPED_TEXT, new String[] { "\n", "\n" },
            String.class));

    /**
     * Makes the first letter of the input string lower case.
     */
    public static String initLowerCase(String in) {
        if (in == null || in.length() == 0 || Character.isLowerCase(in.charAt(0)))
            return in;
        if (in.length() == 1)
            return in.toLowerCase();
        StringBuilder result = new StringBuilder(in.length()).append(in);
        result.setCharAt(0, Character.toLowerCase(in.charAt(0)));
        return result.toString();
    }

    /**
     * @param delim
     *        what delimiter to use in between array elements.
     * @param maxValues
     *        how many array elements to include. When less than 0, all values are included. If <code>maxValues</code>
     *        is greater than the number of elements in <code>array</code>, then all elements are included. If any
     *        elements are not included, <code>...</code> will be inserted after the last element.
     * @param useBrackets
     *        add [] to outside of string iff true
     * @see #collectionToString(Iterable, String, String)
     */
    public static String arrayToString(Object[] array, String delim, int maxValues, boolean useBrackets) {
        return arrayToString(array, delim, maxValues, useBrackets, true);
    }

    /**
     * @param delim
     *        what delimiter to use in between array elements.
     * @param maxValues
     *        how many array elements to include. When less than 0, all values are included. If <code>maxValues</code>
     *        is greater than the number of elements in <code>array</code>, then all elements are included. If any
     *        elements are not included and appendEllipsis is set, <code>...</code> will be inserted after the last element.
     * @param useBrackets
     *        add [] to outside of string iff true
     * @param appendEllipsis
     *        if set and, and any elements are not included, <code>...</code> will be inserted after the last element.
     * @see #collectionToString(Iterable, String, String)
     */
    public static String arrayToString(Object[] array, String delim, int maxValues, boolean useBrackets, boolean appendEllipsis) {
        if (delim == null)
            throw new IllegalArgumentException();
        if (array == null)
            return null;
        if (array.length == 0)
            return useBrackets ? "[]" : "";

        int max = maxValues < 0 ? array.length : Math.min(array.length, maxValues);
        StringBuilder temp = new StringBuilder(2 + (max * 16));
        if (useBrackets)
            temp.append('[');
        for (int i = 0; i < max; i++) {
            if (i > 0)
                temp.append(delim);
            temp.append(array[i]);
        }
        if (max < array.length && appendEllipsis)
            temp.append("...");

        if (useBrackets)
            temp.append(']');
        return temp.toString();
    }

    
    public static boolean isNullEmptyOrWhitespace(CharSequence str) {
        if (str == null)
            return true;

        return isEmptyOrWhitespace(str);
    }
    
    public static boolean isNullOrEmpty(CharSequence str) {
        if (str == null)
            return true;

        return str.length() == 0;
    }

    public static boolean isEmptyOrWhitespace(CharSequence str) {
        if (str == null)
            return false;

        int end = str.length();
        char c;
        for (int i = 0; i < end; i++) {
            if (!((c = str.charAt(i)) <= ' ' || Character.isWhitespace(c))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Properly escapes strings to be displayed in Javascript Strings. This means that backslashes and single quotes are
     * escaped. Double quotes also since javascript string may use either single or double. And HTML comment start,
     * because IE recognizes it even in a javascript string. It is escaped by embedding backslash in it, which JS will
     * ignore, but breaks the pattern for the browser comment recognizer. <br>
     * <br>
     * The Javascript escaping methods are the only methods you should call outside of Element classes. Whenever you are
     * passing Javascript into elements, you should escape any potentially dangerous portions of the script.
     */
    public static String escapeForJavascriptString(String in) {
        return TrieMatcher.replaceMultiple(in, JS_SEARCH_REPLACE);
    }

    /**
     * Properly escapes string for JSON.
     */
    public static String escapeForJSONString(String in) {
        return TrieMatcher.replaceMultiple(in, JSON_SEARCH_REPLACE);
    }

    /**
     * Splits the given string str using the given delimiter and returns the result as a string list. If str is null,
     * then null is returned.<br>
     * <br>
     * The returned string list is an ArrayList that is constructed using the 4 as the ArrayList's initial size. If you
     * expect to have more than four elements more than just on the rare occasion, then please consider using another
     * splitSimple overload that lets you pass in the expected size.<br>
     * <br>
     * This is more efficient than String.split or TextUtil.split because it does not use a regular expression.<br>
     * <br>
     * <b>CAUTION:</b> The str and delimiter parameters are in an order that differs from other string splitting
     * methods. Be absolutely sure that you get the str and delimiter parameter arguments correct. This may eventually
     * be fixed with a refactoring.
     *
     * @param delimiter
     *            The delimiter to split the string using
     * @param str
     *            The string to split
     * @return String list or, if str was null, then null
     */
    public static List<String> splitSimple(String delimiter, String str) {
        return splitSimple(delimiter, str, 4);
    }

    /**
     * Splits the given string str using the given delimiter and returns the result as a string list. If str is null,
     * then null is returned.<br>
     * <br>
     * The returned string list is an ArrayList that is constructed using the given expected size as the ArrayList's
     * initial size. If you are not aware of the expected size, then use 0, which will cause this method to use a
     * LinkedList instead of an ArrayList.<br>
     * <br>
     * This is more efficient than String.split or TextUtil.split because it does not use a regular expression.<br>
     * <br>
     * <b>CAUTION:</b> The str and delimiter parameters are in an order that differs from other string splitting
     * methods. Be absolutely sure that you get the str and delimiter parameter arguments correct. This may eventually
     * be fixed with a refactoring.
     *
     * @param delimiter
     *            The delimiter to split the string using
     * @param str
     *            The string to split
     * @param expectedSize
     *            The expected number of elements in the output list. If you don't know, or if it could be arbitrarily
     *            large, and if you will only access the returned list sequentially with an iterator, then use 0 to tell
     *            this method to use a LinkedList
     * @return String list or, if str was null, then null
     */
    public static List<String> splitSimple(String delimiter, String str, int expectedSize) {
        return splitSimple(str, delimiter, expectedSize, false);
    }

    private static List<String> splitSimple(String s, String split, int expectedSize, boolean shouldTrim) {
        return splitSimple(s, split, expectedSize, shouldTrim, false);
    }

    private static List<String> splitSimple(String str, String delimiter, int expectedSize, boolean shouldTrim,
            boolean ignoreTrailingEmpty) {
        if (str == null) {
            return null;
        }
        List<String> result = (expectedSize == 0) ? new LinkedList<String>() : new ArrayList<String>(expectedSize);

        if (delimiter.length() == 0) {
            if (!ignoreTrailingEmpty)
                throw new IllegalArgumentException();

            // Special case to match java's behavior
            char[] chars = new char[str.length()];
            str.getChars(0, str.length(), chars, 0);
            result.add("");
            for (char c : chars) {
                result.add(Character.toString(c));
            }
            return result;
        }

        // Special case to match java's behavior
        if (ignoreTrailingEmpty && "".equals(str)) {
            result.add("");
            return result;
        }

        int start = 0;
        int indexof;
        while ((indexof = str.indexOf(delimiter, start)) != -1) {
            String substring = str.substring(start, indexof);
            if (shouldTrim)
                substring = substring.trim();
            result.add(substring);
            start = indexof + delimiter.length();
            if (start >= str.length())
                break;
        }
        if (start == str.length()) {
            result.add("");
        } else if (start < str.length()) {
            String substring = str.substring(start);
            if (shouldTrim)
                substring = substring.trim();
            result.add(substring);
        }
        if (ignoreTrailingEmpty && result.size() > 0) {
            // Discard empty substrings at the end
            for (int i = result.size() - 1; i >= 0; i--) {
                if (result.get(i).equals("")) {
                    result.remove(i);
                } else {
                    break;
                }
            }
        }
        return result;
    }

    public static List<String> splitSimpleLimit(String str, String delimiter, int limitSize) {
        return splitSimpleLimit(str, delimiter, limitSize, false);
    }

    public static List<String> splitSimpleLimitAndTrim(String str, String delimiter, int limitSize) {
        return splitSimpleLimit(str, delimiter, limitSize, true);
    }

    private static List<String> splitSimpleLimit(String str, String delimiter, int limitSize, boolean shouldTrim) {
        if (str == null) {
            return null;
        }
        List<String> result = new ArrayList<String>(limitSize);
        int count = limitSize - 1;
        int start = 0;
        int indexof;

        while (count > 0 && (indexof = str.indexOf(delimiter, start)) != -1) {
            String substring = str.substring(start, indexof);
            if (shouldTrim) {
                substring = substring.trim();
            }
            result.add(substring);
            count -= 1;
            start = indexof + delimiter.length();
            if (start >= str.length()) {
                break;
            }
        }
        if (count == 0 || start < str.length()) {
            String substring = str.substring(start);
            if (shouldTrim) {
                substring = substring.trim();
            }
            result.add(substring);
        } else if (start == str.length()) {
            result.add("");
        }
        return result;
    }
    
    /**
     * Makes the first letter of the input string upper case.
     */
    public static String initCap(String in) {
        if (in == null || in.length() == 0 || Character.isUpperCase(in.charAt(0)))
            return in;
        if (in.length() == 1)
            return in.toUpperCase();
        StringBuilder result = new StringBuilder(in.length()).append(in);
        result.setCharAt(0, Character.toUpperCase(in.charAt(0)));
        return result.toString();
    }

    /**
     * Properly decode a URL according to the standard. This is a convenience method users don't have to catch this
     * exception everywhere (the exception should never be thrown anyway), or worry about the encoding string.
     *
     * @see URLDecoder#decode(java.lang.String, java.lang.String)
     */
    public static String urldecode(String url) {
        try {
            return URLDecoder.decode(url, "UTF-8");
        } catch (UnsupportedEncodingException x) {
            // Something went really wrong if UTF-8 isn't supported and we get here
            throw new AssertionError(x);
        }
    }

    /**
     * Properly encode a URL according to the standard.
     *
     * This is a convenience method users don't have to catch this exception everywhere
     * (the exception should never be thrown anyway).
     *
     * @see URLEncoder#encode(java.lang.String, java.lang.String)
     */
    public static String urlencode(String url) {
        try {
            return URLEncoder.encode(url, "UTF-8");
        } catch (UnsupportedEncodingException x) {
            // Something went really wrong if UTF-8 isn't supported and we get here
            throw new AssertionError(x);
        }
    }

    public static String replaceChar(String value, char ch, CharSequence replacement) {
        if (value == null)
            return null;
        int i = value.indexOf(ch);
        if (i == -1)
            return value; // nothing to do

        // we've got at least one character to replace
        StringBuilder buf = new StringBuilder(value.length() + 16); // some extra space
        int j = 0;
        while (i != -1) {
            buf.append(value, j, i).append(replacement);
            j = i + 1;
            i = value.indexOf(ch, j);
        }
        if (j < value.length())
            buf.append(value, j, value.length());
        return buf.toString();
    }

    /**
     * Splits the given string str using the given delimiter, trims each element, and returns the result as a string
     * list. If str is null, then null is returned.<br>
     * <br>
     * The returned string list is an ArrayList that is constructed using the given expected size as the ArrayList's
     * initial size. If you are not aware of the expected size, then use 0, which will cause this method to use a
     * LinkedList instead of an ArrayList.<br>
     * <br>
     * This is more efficient than String.split or TextUtil.split because it does not use a regular expression.
     *
     * @param str
     *            The string to split
     * @param delimiter
     *            The delimiter to split the string using
     * @param expectedSize
     *            The expected number of elements in the output list. If you don't know, or if it could be arbitrarily
     *            large, and if you will only access the returned list sequentially with an iterator, then use 0 to tell
     *            this method to use a LinkedList
     * @return String list or, if str was null, then null
     */
    public static List<String> splitSimpleAndTrim(String str, String delimiter, int expectedSize) {
        return splitSimple(str, delimiter, expectedSize, true);
    }

    /**
     * Note, if you are going to search/replace for the same set of source and target many times, you can get a
     * performance win by using the form of this call that takes a TrieMatcher instead.
     *
     * @return the replacement of all occurrences of src[i] with target[i] in s. Src and target are not regex's so this
     *         uses simple searching with indexOf()
     * @see TrieMatcher#replaceMultiple(String, TrieMatcher)
     * @see #replaceChar(String, char, CharSequence)
     * @see #replaceSimple(String, String[], String[])
     */
    public static String replaceSimple(String s, String[] src, String[] target) {
        assert src != null && target != null && src.length > 0 && src.length == target.length;
        if (src.length == 1 && src[0].length() == 1) { return replaceChar(s, src[0].charAt(0), target[0]); }
        if (s == null)
            return null;
        StringBuilder sb = new StringBuilder(s.length());
        int pos = 0;
        int limit = s.length();
        int lastMatch = 0;
        while (pos < limit) {
            boolean matched = false;
            for (int i = 0; i < src.length; i++) {
                if (s.startsWith(src[i], pos) && src[i].length() > 0) {
                    // we found a matching pattern - append the acculumation plus the replacement
                    sb.append(s.substring(lastMatch, pos)).append(target[i]);
                    pos += src[i].length();
                    lastMatch = pos;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // we didn't match any patterns, so move forward 1 character
                pos++;
            }
        }
        // see if we found any matches
        if (lastMatch == 0) {
            // we didn't match anything, so return the source string
            return s;
        }

        // apppend the trailing portion
        sb.append(s.substring(lastMatch));

        return sb.toString();
    }

    /**
     * @return the replacement of src with target in s, using simple string replacement
     */
    public static String replaceSimple(String s, String src, String target) {
        assert src != null && src.length() > 0;
        if (s == null || s.length() == 0)
            return s;
        if (target == null)
            target = "null"; // gag - but this is the way the replaceRegex works, so, I guess we need to be compatible

        int pos = s.indexOf(src);
        if (pos == -1)
            return s; // no match

        int limit = s.length();
        StringBuilder buf = new StringBuilder(limit);
        buf.append(s.substring(0, pos)).append(target); // replace the first instance
        pos += src.length();
        while (pos < limit) { // and keep looking for more
            int p = s.indexOf(src, pos);
            if (p == -1)
                break; // no more
            buf.append(s.substring(pos, p)).append(target);
            pos = p + src.length();
        }
        if (pos < limit)
            buf.append(s.substring(pos)); // append the tail
        return buf.toString();
    }

    /**
     * Unescape given escaped HTML.
     *
     * @param input
     * @param includeHtmlTags
     *            - true includes HTML tags
     * @return unescaped text
     */
    public static String unescapeOutput(String input, boolean includeHtmlTags) {
        if (includeHtmlTags) {
            // include replacing html tags, eg <br/> and <br> to \n
            return TrieMatcher.replaceMultiple(input, HTML_TO_TEXT);
        } else {
            // only replace escaped chars
            return TrieMatcher.replaceMultiple(input, HTML_TO_TEXT_ESCAPED_ONLY);
        }
    }

    /**
     * @return a delim-separated string from the contents of the given collection where the last separation is
     *         <delim><lastDelim>, for lists like "apple, banana, and orange"
     */
    public static String collectionToString(Iterable<?> c, String delim, String lastDelim) {
        return collectionToString(c, delim, lastDelim, null, null);
    }

    public static String collectionToString(Iterable<?> c, String delim, String lastDelim, String prefix, String suffix) {
        if (c == null) return null;
        StringBuilder sb = new StringBuilder();
        if (prefix != null) {
            sb.append(prefix);
        }
        int count = 0;
        for (Object o : c) {
            sb.append(count == 0 ? "" : delim).append(o);
            count++;
        }
        if (lastDelim != null && delim != null && delim.length() != 0 && count > 1)
            sb.insert(sb.lastIndexOf(delim) + delim.length(), lastDelim);
        if (suffix != null) {
            sb.append(suffix);
        }
        return sb.toString();
    }

    /**
     * case insensitive string search over a collection of strings
     *
     * @param input
     *            the string to search for
     * @param collection
     *            the strings to search in
     * @return true iff collection contains a string that equalsIgnoreCase input
     */
    public static boolean containsIgnoreCase(String input, Iterable<String> collection) {
        if (collection != null) {
            for (String s : collection) {
                if (s.equalsIgnoreCase(input)) { return true; }
            }
        }
        return false;
    }
}
