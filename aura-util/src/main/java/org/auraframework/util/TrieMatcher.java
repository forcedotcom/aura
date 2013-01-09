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

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import javax.annotation.CheckForNull;
import javax.annotation.concurrent.Immutable;

/**
 * An immutable trie used for fast multiple string search and replace. It's set
 * of words and replacements are populated at initialization, and the data
 * structure creation is not the cheapest of operations, so it is best used when
 * the object will be used multiple times.
 * 
 * @see TrieMatcher#replaceMultiple(String, TrieMatcher)
 */
@Immutable
public class TrieMatcher {

    private static final int DEFAULT_CAPACITY = 1; // trading initialization
                                                   // time for a small memory
                                                   // footprint

    /**
     * This is not the cheapest of operations.
     * 
     * @param strings this is the list of words that make up the Trie. It is
     *            assumed that the lists are not modified once passed into the
     *            Trie
     * @param replacements the list of words that can be used to replace those
     *            words. It is assumed that the lists are not modified once
     *            passed into the Trie
     */
    public static TrieMatcher compile(String[] strings, String[] replacements) {
        return TrieMatcher.compile(Arrays.asList(strings), Arrays.asList(replacements));
    }

    /**
     * This is not the cheapest of operations.
     * 
     * @param strings this is the list of words that make up the Trie. It is
     *            assumed that the lists are not modified once passed into the
     *            Trie
     * @param replacements the list of words that can be used to replace those
     *            words. It is assumed that the lists are not modified once
     *            passed into the Trie
     */
    public static TrieMatcher compile(List<String> strings, List<String> replacements) {
        return new TrieMatcher(strings, replacements);
    }

    /**
     * Search and replace multiple strings in <code>s</code> given the the words
     * and replacements given in <code>TrieMatcher</code>.
     * <p>
     * Note, using a Trie for matching multiple strings can be much faster than
     * the using {@link AuraTextUtil#replaceSimple(String, String[], String[])},
     * however, due to the cost of creating the Trie, this is best used when 1)
     * you will reuse the Trie many times 2) you have a large set of strings
     * your are searching on
     * <p>
     * Note, regexes aren't supported by this, see
     * {@link AuraTextUtil#replaceSimple(String, String[], String[])}.
     * 
     * @param s the text you are searching in
     * @param trieMatcher the trie representing the words to search and replace
     *            for
     * @return the text with the search words swapped by the replacements
     */
    public static final String replaceMultiple(String s, TrieMatcher trieMatcher) {
        if (s == null || trieMatcher == null || s.length() == 0) {
            return s;
        }

        // we don't use a DeferredStringBuilder because we don't expect to
        // reuse much of the original string. it's likely all or nothing.
        // Don't allocate the buffer until it's needed.
        StringBuilder dsb = null;

        int pos = 0;
        int length = s.length();
        boolean foundMatch = false;
        while (pos < length) {
            TrieMatch match = trieMatcher.match(s, pos);
            if (match == null) {
                if (!foundMatch) {
                    return s;
                } else {
                    // No more matches, so copy the rest and get gone
                    dsb.append(s, pos, s.length());
                    break;
                }
            }
            foundMatch = true;
            if (dsb == null) {
                dsb = new StringBuilder(s.length() + 16);
            }

            // Copy up to the match position
            if (match.getPosition() > pos) {
                dsb.append(s, pos, match.getPosition());
            }

            // Append the replacement
            dsb.append(match.getReplacement());

            // Advance our current position
            pos = match.getPosition() + match.getWord().length();
        }
        return dsb.toString();
    }

    /**
     * @param s the term to search for the terms of the trie in
     * @return true if the any of the terms are contained in <code>s</code>
     */
    public boolean containedIn(String s) {
        TrieMatch match = match(s);
        return match != null;
    }

    /**
     * @param s the term to see if it starts with any terms of the trie
     */
    public boolean begins(String s) {
        TrieData match = begins(s, 0);
        return match != null;
    }

    /**
     * Find the next match in <code>s</code>.
     * 
     * @param s the term to search for the terms of the trie in
     * @param start the 0-based position to start the search from.
     * @return null if no match found
     */
    @CheckForNull
    public String findIn(String s, int start) {
        TrieMatch match = match(s, start);
        if (match == null) {
            return null;
        }
        return match.getWord();
    }

    private static class TrieData {
        String word;
        String replacement;
        final HashMap<Integer, TrieData> nextChars;

        TrieData(HashMap<Integer, TrieData> next) {
            this.nextChars = next;
        }
    }

    private final HashMap<Integer, TrieData> root;
    private final List<String> words;
    private final int minWordLength;

    /**
     * Use the factory {@link #compile()} instead.
     */
    private TrieMatcher(List<String> strings, List<String> replacements) {
        if (strings == null) {
            throw new NullPointerException();
        }
        if (replacements == null) {
            throw new NullPointerException();
        }

        if (strings.size() != replacements.size()) {
            throw new IllegalArgumentException("Replacements must have same size, " + replacements.size()
                    + ", as search strings " + strings.size());
        }

        this.words = Collections.unmodifiableList(strings);
        this.root = new HashMap<Integer, TrieData>(DEFAULT_CAPACITY);

        int minWordLen = Integer.MAX_VALUE;
        int wordIndex = 0;
        for (String s : strings) {
            HashMap<Integer, TrieData> current = this.root;

            int len = s.length();
            minWordLen = Math.min(minWordLen, len);
            for (int i = 0; i < len; i++) {
                int ch = s.charAt(i);
                TrieData next = current.get(ch);
                if (next == null) {
                    next = new TrieData(new HashMap<Integer, TrieData>(DEFAULT_CAPACITY));
                    current.put(ch, next);
                }
                current = next.nextChars;

                // if we're at the last char, store it and its replacement...
                if (i + 1 == len) {
                    next.word = s;
                    next.replacement = replacements.get(wordIndex);
                }
            }
            wordIndex++;
        }

        this.minWordLength = minWordLen;
    }

    /**
     * See if the given string matches any of the given words in the Trie
     * 
     * @return null if none are found.
     */
    TrieMatch match(String s) {
        return match(s, 0);
    }

    /**
     * See if the given string matches any of the given words in the Trie
     * 
     * @param offset where to start looking inside of the given String.
     * @return null if none are found.
     */
    public TrieMatch match(String s, int offset) {
        if (s == null || s.length() == 0 || offset < 0) {
            return null;
        }

        int len = s.length();
        for (int i = offset; i < len; i++) {
            // optimize the case when we don't have enough room left to contain
            // any matches
            if (i + this.minWordLength > len) {
                break;
            }

            TrieData data = contains(s, i);
            if (data != null) {
                return new TrieMatch(i, data.word, data.replacement);
            }
        }

        return null;
    }

    private TrieData begins(String s, int offset) {
        if (s == null || s.length() == 0 || offset < 0) {
            return null;
        }
        return contains(s, offset);
    }

    /**
     * @return null if not found
     */
    private TrieData contains(String s, int offset) {
        HashMap<Integer, TrieData> current = this.root;
        int len = s.length();
        LinkedList<TrieData> matches = null;
        TrieData firstMatch = null;

        for (int i = offset; i < len; i++) {
            int ch = s.charAt(i);
            TrieData nextData = current.get(ch);

            if (nextData == null) {
                break;
            }
            if (nextData.word != null) {
                if (firstMatch == null) {
                    firstMatch = nextData;
                } else {
                    if (matches == null) {
                        matches = new LinkedList<TrieData>();
                        matches.add(firstMatch);
                    }
                    matches.add(nextData);
                }
            }

            current = nextData.nextChars;
        }

        if (firstMatch != null) {
            // only 1 match, so we know that's the one
            if (matches == null) {
                return firstMatch;
            }

            // else, we need to find the "highest" priority order word
            // as specified by the input to the trie
            for (String word : this.words) {
                for (TrieData td : matches) {
                    if (word.equals(td.word)) {
                        return td;
                    }
                }
            }
        }

        return null;
    }

}
