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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.security.SecureRandom;

public class IOUtil {
    private static volatile File topLevel = null;
    private static String defaultTempDir = null;
    private static boolean markedForDelete = false;

    private static File makeTempDir(File base, String prefix) {
        int count = 0;
        long time = System.currentTimeMillis();
        StringBuilder sb = new StringBuilder();
        SecureRandom random = new SecureRandom();

        if (prefix == null) {
            prefix = "aura";
        }
        sb.append(prefix);
        sb.append("_");
        sb.append(Long.toString(time, 36));
        sb.append("_");
        int len = sb.length();
        while (count < 1000) {
            sb.setLength(len);
            sb.append(Long.toString(random.nextLong(), 36));
            File attempt = new File(base, sb.toString());
            if (attempt.mkdirs()) {
                return attempt;
            }
            System.out.println(attempt);
            count += 1;
        }
        throw new RuntimeException("Unable to create a temporary directory");
    }

    private static File getTopLevel() {
        if (topLevel != null) {
            return topLevel;
        }
        synchronized (IOUtil.class) {
            if (topLevel != null) {
                return topLevel;
            }
            try {
                File tmpDir = new File(System.getProperty("java.io.tmpdir"));
                tmpDir = tmpDir.getCanonicalFile();
                tmpDir = makeTempDir(tmpDir, "aura");
                topLevel = tmpDir;
            } catch (IOException ioe) {
                throw new RuntimeException("Temporary directory does not exist");
            }
        }
        return topLevel;
    }

    public static String newTempDir(String prefix) {
        return makeTempDir(getTopLevel(), prefix).getPath();
    }

    public static synchronized String getDefaultTempDir() {
        if (defaultTempDir == null) {
            defaultTempDir = newTempDir("aura_default");
        }
        return defaultTempDir;
    }

    public static synchronized void markTempDirForDelete() {
        if (!markedForDelete) {
            markedForDelete = true;
            Runtime.getRuntime().addShutdownHook(new Thread(new DirectoryCleaner(getTopLevel().toPath())));
        }
    }

    public static void copyStream(InputStream in, OutputStream out) throws IOException {
        byte [] buf = new byte[8192];
        try {
            int len;
            while ((len = in.read(buf, 0, buf.length)) != -1) {
                out.write(buf, 0, len);
            }
        } finally {
            try {
                out.flush();
            } finally {
                in.close();
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
     * Count the number of characters read by the stream while throwing away the data. The stream will be closed after
     * reading, so it should not be used again.
     *
     * @param br
     * @return
     * @throws IOException
     */
    public static long countNumberOfCharacters(Reader br) throws IOException {
        int READ_BUFFER = 4096;
        char[] buff = new char[READ_BUFFER];
        long len = 0;
        int read;
        while ((read = br.read(buff, 0, READ_BUFFER)) != -1) {
            len += read;
        }
        br.close();
        return len;
    }
    /**
     * This exception is thrown by {@link #delete(File)} if some level of delete failed.
     */
    @SuppressWarnings("serial")
    public static class DeleteFailedException extends Exception {
        private final File file;

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
     * This makes a best attempt to delete the file/directory in question. It will recurse down any directory structure
     * and delete all subdirectories/files. If for some reason a directory is not readable, we throw
     * {@link DirectoryNotReadableException}, with the name of the directory. If a delete fails, we throw
     * {@link DeleteFailedException} with the file we could not delete.
     *
     * @param file The file to recursively delete.
     * @throws DeleteFailedException if the delete fails for any reason.
     */
    public static void delete(File file) throws DeleteFailedException {
        if (file == null || !file.exists()) {
            return;
        }

        if (file.isDirectory()) {
            File[] files = file.listFiles();

            if (files == null) {
                throw new DirectoryNotReadableException("Please fix permissions for " + file.getAbsolutePath(), file);
            }
            for (File f : files) {
                IOUtil.delete(f);
            }
        }
        if (!file.delete()) {
            throw new DeleteFailedException("Failed to delete " + file.getAbsolutePath(), file);
        }
    }

    public static void close(Writer writer) {
        if (writer != null) {
            try {
                writer.flush();
                writer.close();
            } catch (IOException ignore) {
            }
        }
    }
}
