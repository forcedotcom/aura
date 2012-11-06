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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.jar.JarOutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;

import com.google.common.base.Preconditions;

public class IOUtil {

    public static long copyStream(InputStream in, OutputStream out) throws IOException {
        return copyStream(in, out, new byte[8192]);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf) throws IOException {
        return copyStream(in, out, buf, null, null);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf, Logger logger, Level level)
            throws IOException {
        return copyStream(in, out, buf, logger, level, true);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf, Logger logger, Level level,
            boolean closeStream) throws IOException {
        return copyStream(in, out, buf, closeStream, logger, level);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf, boolean close, Logger log, Level level)
            throws IOException {
        return copyStream(in, out, buf, close, log, level, Long.MAX_VALUE);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf, boolean closeInputStream)
            throws IOException {
        return copyStream(in, out, buf, closeInputStream, null, null, Long.MAX_VALUE);
    }

    public static long copyStream(InputStream in, OutputStream out, byte[] buf, boolean closeStream, Logger logger,
                                 Level level, final long numBytesToCopy) throws IOException {
        if (buf == null) {
            buf = new byte[8192];
        }
        try {
            int len;
            long copied = 0;
            while (numBytesToCopy > copied
                    && (len = in.read(buf, 0, (int)Math.min(buf.length, (numBytesToCopy - copied)))) != -1) {
                out.write(buf, 0, len);
                if (logger != null && logger.isLoggable(level)) {
                    logger.log(level, new String(buf, 0, len));
                }
                copied += len;
            }
            if (numBytesToCopy != Long.MAX_VALUE && numBytesToCopy != copied) { throw new IOException(
                    "expected to copy " + numBytesToCopy + ", actually copied " + copied); }
            return copied;
        } finally {
            try {
                out.flush();
            } finally {
                if (closeStream) in.close();
            }
        }
    }

    public static void copyStream(Reader in, Writer out) throws IOException {
        char[] buf = new char[8192];
        try {
            int len;
            while ((len = in.read(buf)) != -1) {
                out.write(buf, 0, len);
            }
            out.flush();
        } finally {
            in.close();
        }
    }

    public static String readTextFile(File f) throws IOException {
        Reader br = new BufferedReader(new InputStreamReader(new FileInputStream(f), "UTF-8"));
        return readText(br);
    }

    public static String readText(Reader br) throws IOException {
        int READ_BUFFER = 4096;
        char[] buff = new char[READ_BUFFER];
        int read;
        StringBuffer sb = new StringBuffer(READ_BUFFER);
        while ((read = br.read(buff, 0, READ_BUFFER)) != -1) {
            sb.append(buff, 0, read);
        }
        br.close();
        return sb.toString();
    }

    /**
     * A hopefully more robust to concurrent creation mkdirs method:
     * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4742723
     */
    public static void mkdirs(File f) {
        if (f.mkdir() || f.exists()) { return; }
        File canonFile;
        try {
            canonFile = f.getCanonicalFile();
        } catch (IOException e) {
            return;
        }
        File parent = canonFile.getParentFile();
        if (parent != null) {
            mkdirs(parent); // ignore the return as it may have been created already
        }
        // lastly, let's make this directory
        canonFile.mkdir();
    }

    /**
     * List all files inside the given directory
     *
     * @param rootDir
     * @param excludeDirs
     *          true if only files need to be listed and not directories. false if both.
     * @param recursive
     *          true to list files from sub folders recursively
     */
    public static File[] listFiles(File rootDir, boolean excludeDirs, boolean recursive) {
        List<File> files = new ArrayList<File>();
        int depth = (recursive) ? Integer.MAX_VALUE : 0;
        listFiles(rootDir, files, depth);
        if (excludeDirs) {
            List<File> rf = new ArrayList<File>(files.size());
            for (File f : files) {
                if (!f.isDirectory()) { rf.add(f); }
            }
            files = rf;
        }
        return files.toArray(new File[files.size()]);
    }

    /**
     * A method used by listfiles to list the files recursively in the subfolders
     *
     * @param at
     * @param files
     * @param depth
     */
    private static void listFiles(File at, List<File> files, int depth) {
        if (at.isDirectory()) {
            File[] ff = at.listFiles();
            if (ff != null) {
                for (File f : ff) {
                    files.add(f);
                    if (depth > 0) {
                        listFiles(f, files, depth - 1);
                }
            }
        }
    }
    }

    /**
     * This exception is thrown by {@link #delete(File)} if some level of delete failed.
     */
    @SuppressWarnings("serial")
    public static class DeleteFailedException extends Exception {
        private File file;

        public DeleteFailedException(String message, File file) {
            super(message);
            this.file = file;
        }

        public File getFile() {
            return this.file;
        }
    }

    /**
     * This exception is thrown by {@link #delete(File)} if one of the directories is not readable.
     */
    @SuppressWarnings("serial")
    public static class DirectoryNotReadableException extends DeleteFailedException {
        public DirectoryNotReadableException(String message, File file) {
            super(message, file);
        }
    }

    /**
     * Recursively delete.
     *
     * This makes a best attempt to delete the file/directory in question. It will recurse down any
     * directory structure and delete all subdirectories/files. If for some reason a directory is not
     * readable, we throw {@link DirectoryNotReadableException}, with the name of the directory.
     * If a delete fails, we throw {@link DeleteFailedException} with the file we could not delete.
     *
     * @param file The file to recursively delete.
     * @throws DeleteFailedException if the delete fails for any reason.
     */
    public static void delete(File file) throws DeleteFailedException {
        if (file == null || !file.exists()) { return; }

        if (file.isDirectory()) {
            File[] files = file.listFiles();

            if (files == null) {
                throw new DirectoryNotReadableException("Please fix permissions for "+file.getAbsolutePath(), file);
            }
            for (File f : files) {
                IOUtil.delete(f);
            }
        }
        if (!file.delete()) {
            throw new DeleteFailedException("Failed to delete "+file.getAbsolutePath(), file);
        }
    }

    /**
     * Create a JAR file containing the directory structure given by the folder.
     *
     * @param folder
     *            the folder to recursively scan to fill the jar
     * @param jarFile
     *            the file that should contain the newly created jar.
     */
    public static void createJarFromFolder(File folder, File jarFile) throws IOException, URISyntaxException {
        Preconditions.checkArgument(folder.isDirectory() && folder.exists());
        if (!jarFile.createNewFile()) { throw new IOException("Unable to create jarfile at " + jarFile.getPath()); }
        JarOutputStream out = new JarOutputStream(new FileOutputStream(jarFile));
        File[] files = IOUtil.listFiles(folder, false, true);
        URI folderURI = new URI(folder.getPath());

        for (File f : files) {
            URI path = new URI(f.getPath());
            String pathString = folderURI.relativize(path).getPath();
            if (f.isDirectory()) {
                // Directory entries in a JAR must end with a /
                if (!pathString.endsWith("/")) {
                    pathString = pathString + '/';
                }
            }

            ZipEntry ze = new ZipEntry(pathString);
            out.putNextEntry(ze);

            if (f.isFile()) {
                FileInputStream in = new FileInputStream(f);
                try {
                    byte[] buffer = new byte[1024];
                    int count;
                    while ((count = in.read(buffer)) > 0) {
                        out.write(buffer, 0, count);
                    }
                } finally {
                    in.close();
                }
            }
            out.closeEntry();
        }
        out.close();
    }
}
