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
package org.auraframework.util;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Set;

import com.google.common.collect.ImmutableSet;

public class DirectoryCleaner implements FileVisitor<Path>, Runnable {
    private Path path;

    public DirectoryCleaner(Path path) {
        this.path = path;
    }

    @Override
    public void run() {
        try {
            Files.walkFileTree(path, this);
        } catch (IOException ioe) {
            // We try to handle iO exceptions lower down in the code, but if all else fails, it will pop up
            // here. Not much we can do.
        }
    }

    public void log(Path file, IOException ioe) {
        // FIXME: log this somewhere... but during shutdown, what can we log?
    }

    private static final Set<PosixFilePermission> DIRECTORY_PERMISSIONS =
        new ImmutableSet.Builder<PosixFilePermission>()
        .add(PosixFilePermission.OWNER_WRITE)
        .add(PosixFilePermission.OWNER_READ)
        .add(PosixFilePermission.OWNER_EXECUTE)
        .build();

    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
        try {
            // Try hard here... If someone messed with out permissions, we try to reset so that
            // we can delete.
            Files.setPosixFilePermissions(dir, DIRECTORY_PERMISSIONS);
        } catch (Throwable t) {
            // ignore.
        }
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
        try {
            Files.delete(file);
        } catch (IOException ioe) {
            log(file, ioe);
        }
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFileFailed(Path file, IOException exc) {
        log(file, exc);
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult postVisitDirectory(Path dir, IOException exc) {
        if (exc != null) {
            log(dir, exc);
        }
        try {
            Files.delete(dir);
        } catch (IOException ioe) {
            log(dir, ioe);
        }
        return FileVisitResult.CONTINUE;
    }
}

