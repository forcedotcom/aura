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
import java.io.FileFilter;
import java.io.IOException;

import org.auraframework.util.text.Hash;

/**
 * Group used solely to create hash of the group.
 */
public class HashingGroup extends CommonFileGroup {

    private File root;

    public HashingGroup(String name, File root) throws IOException {
        this(name, root, CommonFileGroup.ALL_FILTER);

    }

    public HashingGroup(String name, File root, FileFilter filter) throws IOException {
        super(name, root, filter);
        this.root = root;
        setContents(this.root);
    }

    /**
     * Can only check freshness of existing files. We only have a list of existing files so don't know if
     * new files are added. Workaround is to make a slight change in an existing file if you want to add a
     * new file. Better than restarting app.
     *
     * @return true if files has changed
     */
    @Override
    public boolean isStale() {
        if (!isGroupHashKnown()) {
            return true;
        }
        // Otherwise, we're stale IFF we have changed contents.
        try {
            Hash currentTextHash = computeGroupHash(getFiles());
            return !currentTextHash.equals(getGroupHash());
        } catch (IOException e) {
            // presume we're stale; we'll probably try to regenerate and die from that.
            return true;
        }
    }

    @Override
    public void reset() throws IOException {
        // instead of this.clear(), we would like to load any new files added as well
        setContents(this.root);
    }
}
