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
package org.auraframework.util.resource;

import java.io.File;
import java.io.IOException;
import java.util.Set;

import org.auraframework.util.text.Hash;

/**
 * File group to allow hashing  of group contents
 */
public interface FileGroup {

    String getName();

    long getLastMod();

    /**
     * Fetches a hash <i>almost</i> guaranteed to change if anything in the
     * group changes. Note that this should imply that the files must be
     * traversed in some stable order, regardless of whether {@link #getFiles()}
     * returns them in that order.
     *
     * FIXME: This likely needs an SFDC patch, too.
     *
     * @return a hash of all the files in the group.
     * @throws java.io.IOException if a file in the group cannot be read for hashing
     */
    Hash getGroupHash() throws IOException;

    /**
     * Add a file to the group.
     * 
     * If the string is an absolute path, it will be added as that absolute file, otherwise, it is
     * resolved from an implementation dependent root directory.
     *
     * @param s the path.
     */
    File addFile(String s) throws IOException;

    File addDirectory(String s) throws IOException;

    Set<File> getFiles();

    /**
     * is this group out of date? It can only check files that were in the group
     * when initially parsed, newly added files won't show up
     */
    boolean isStale();

    /**
     * Reset to get new hash
     */
    void reset() throws IOException;
}
