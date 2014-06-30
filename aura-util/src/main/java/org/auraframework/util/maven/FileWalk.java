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
package org.auraframework.util.maven;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

/**
 * FileWalk is an Aura file inspector that compiles a list of bundles, and inspects key files from the 
 * bundle for attributes.  It's purpose is to generate enumerations that can be used by compiled code 
 * to ensure some semblance of type safety to the use of script code.  It avoids runtime dependencies to
 * allow it's usage prior to the compilation of aura main modules, which might otherwise create a circular reference.
 */

public class FileWalk {

static final String ATTRIBUTE_SEPARATOR = "__";

static final String EXTENSION_COMPONENT = "cmp";
static final String EXTENSION_APPLICATION = "app";
static final String EXTENSION_EVENT = "evt";
static final String EXTENSION_INTERFACE = "intf";


static final String DEFTYPE_COMPONENT = "DefType.COMPONENT";
static final String DEFTYPE_APPLICATION = "DefType.APPLICATION";
static final String DEFTYPE_EVENT = "DefType.EVENT";
static final String DEFTYPE_INTERFACE = "DefType.INTERFACE";
static final String DEFTYPE_ATTRIBUTE = "DefType.ATTRIBUTE";

static final String ELEMENT_COMPONENT = "aura:component";
static final String ELEMENT_APPLICATION = "aura:application";
static final String ELEMENT_EVENT = "aura:event";
static final String ELEMENT_INTERFACE = "aura:interface";

static final String ELEMENT_EXTENDS = "extends";
static final String ELEMENT_IMPLEMENTS = "implements";
static final String ELEMENT_AURA_ATTRIBUTE = "aura:attribute";
static final String ELEMENT_ATTRIBUTE_NAME = "name";

static final String[] javaKeywordStrings= {
    "abstract",
    "continue",
    "for",
    "new",
    "switch",
    "assert",
    "default",
    "goto",
    "package",
    "synchronized",
    "boolean",
    "do",
    "if",
    "private",
    "this",
    "break",
    "double",
    "implements",
    "protected",
    "throw",
    "byte",
    "else",
    "import",
    "public",
    "throws",
    "case",
    "enum",
    "instanceof",
    "return",
    "transient",
    "catch",
    "extends",
    "int",
    "short",
    "try",
    "char",
    "final",
    "interface",
    "static",
    "void",
    "class",
    "finally",
    "long",
    "strictfp",
    "volatile",
    "const",
    "float",
    "native",
    "super",
    "while" };

static TreeSet<String> javaKeywords;

static {
    javaKeywords = new TreeSet<String>();
    for (int i=0; i < javaKeywordStrings.length; i++) {
        javaKeywords.add(javaKeywordStrings[i]);
    }
    
}

static final String packageString =
"/*\n" + 
" * Copyright (C) 2013 salesforce.com, inc.\n" + 
" *\n" + 
" * Licensed under the Apache License, Version 2.0 (the \"License\");\n" + 
" * you may not use this file except in compliance with the License.\n" + 
" * You may obtain a copy of the License at\n" + 
" *\n" + 
" *         http://www.apache.org/licenses/LICENSE-2.0\n" + 
" *\n" + 
" * Unless required by applicable law or agreed to in writing, software\n" + 
" * distributed under the License is distributed on an \"AS IS\" BASIS,\n" + 
" * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" + 
" * See the License for the specific language governing permissions and\n" + 
" * limitations under the License.\n" + 
" */\n" + 
"\n" +
"// This package is for the component bundles in the directories rooted at:\n//    %s \n" +
" \n" +
" \n" +
"package %s;\n" + 
"\n" + 
        "import org.auraframework.Aura;\n" + 
        "import org.auraframework.def.*;\n" + 
        "import org.auraframework.def.DefDescriptor.DefType;" +
        "\n";

static final String classIntroString =
        "// DO NOT MODIFY THIS GENERATED CLASS \n\n" + 
        "public class %s {\n" + 
        "\n" + 
        "       private static class IdImpl {\n" +
        "           public final String prefix;\n" +
        "           public final String namespace;\n" +
        "           public final String name;\n" +
        "           public final DefType defType;\n" +
        "           public final String ownerOrExtendsFrom;\n"+
        "\n" + 
        "           private IdImpl(String namespace, String name, DefType defType, String ownerOrExtendsFrom) {\n" + 
        "               this(\"markup\", namespace, name, defType, ownerOrExtendsFrom);\n" + 
        "           }\n" + 
        "\n" + 
        "           private IdImpl(String prefix, String namespace, String name, DefType defType, String ownerOrExtendsFrom) {\n" + 
        "               this.prefix = prefix;\n" + 
        "               this.namespace = namespace;\n" + 
        "               this.name = name;\n" + 
        "               this.defType = defType;\n" + 
        "               this.ownerOrExtendsFrom = ownerOrExtendsFrom;\n" + 
        "           }\n" + 
        "\n" +
        "           public DefType getDefType() { return defType; }\n" + 
        "\n" + 
        "           public boolean isEvent() { return defType == DefType.EVENT; }\n" + 
        "\n" + 
        "           public boolean isComponent() { return defType == DefType.COMPONENT; }\n" + 
        "\n" + 
        "           public boolean isApplication() { return defType == DefType.APPLICATION; }\n" + 
        "\n" + 
        "           public boolean isInterface() { return defType == DefType.INTERFACE; }\n" + 
        "\n" + 
        "           public boolean isAttribute() { return defType == DefType.ATTRIBUTE; }\n" + 
        "\n" + 
        "           public DefDescriptor getDescriptor() {\n" + 
        "               if (isAttribute()) {\n" +
        "                   return null;\n" +
        "               }\n" +
        "               return Aura.getDefinitionService().getDefDescriptor(getFQN(),defType.getPrimaryInterface());\n" + 
        "           }\n" + 
        "\n" + 
        "           public String getOwnerOrExtendsFrom() { return ownerOrExtendsFrom; };\n" + 
        "\n" + 
        "           public String getName() {\n" + 
        "               return name;\n" + 
        "           }\n" +
        "\n" + 
        "           public String getFQN() {\n" +
        "               StringBuilder fqn = new StringBuilder();\n" +
        "               fqn.append(namespace).append(\":\");\n" +
        "               if (isAttribute()) {\n" +
        "                   fqn.append(ownerOrExtendsFrom).append(\"/ATTRIBUTE$\").append(name);\n" +
        "               } else {\n" +
        "                   fqn.append(name);\n" +
        "               }\n" +
        "               return fqn.toString();\n" +
        "           }\n" +
        "\n" + 
        "           public String getPrefixedFQN() {\n" + 
        "               return prefix +\"://\" + getFQN();\n" +
        "           }\n" +
        "\n" + 
        "           public String getCssClassName() { \n" + 
        "               return namespace + name.substring(0, 1).toUpperCase() + name.substring(1);\n" + 
        "           }\n"+
        "       }\n"
        ; 

static final String enumIntroString = 
        "\n" +
        "    // Public descriptors for the namespace: %s \n" + 
        "    static public enum %s { \n\n"; 

static final String enumInstanceString = 
        "          %s(\"%s\", %s, %s)"; 

static final String enumInstanceSeparatorString = ", \n"; 

static final String enumOutroString =
        ";\n" + 
        "\n" + 
        "          // implementation \n\n" + 
        "          private final IdImpl impl;\n" + 
        "\n" + 
        "          private static final String namespace = \"%s\";\n" + 
        "\n" + 
        "          private %s(String name, DefType defType, String ownerOrExtendsFrom) { this(\"markup\",name,defType, ownerOrExtendsFrom); }\n" + 
        "\n" + 
        "          private %s(String prefix, String name, DefType defType, String ownerOrExtendsFrom) {\n" + 
        "              impl = new IdImpl(prefix, namespace, name, defType, ownerOrExtendsFrom);\n" + 
        "          }\n" + 
        "\n" + 
        "          public boolean isEvent() { return impl.isEvent(); }\n" + 
        "\n" + 
        "          public boolean isComponent() { return impl.isComponent(); }\n" + 
        "\n" + 
        "          public boolean isApplication() { return impl.isApplication(); }\n" + 
        "\n" + 
        "          public boolean isInterface() { return impl.isInterface(); }\n" + 
        "\n" + 
        "          public boolean isAttribute() { return impl.isAttribute(); }\n" + 
        "\n" + 
        "          public DefType getDefType() { return impl.getDefType(); }\n" + 
        "\n" + 
        "          public DefDescriptor getDescriptor() { return impl.getDescriptor(); }\n" + 
        "\n" + 
        "          public String getOwnerOrExtendsFrom() { return impl.getOwnerOrExtendsFrom(); };\n" + 
        "\n" + 
        "          public String getName() { return impl.getName(); };\n" + 
        "\n" + 
        "          public String getFQN() { return impl.getFQN(); };\n" + 
        "\n" + 
        "          public String getPrefixedFQN() { return impl.getPrefixedFQN();  }\n" + 
        "\n" +
        "          public String getCssClassName() { return impl.getCssClassName(); }\n" + 
        "    }\n" + 
        "    \n";
        
static final String classOutroString =      "}\n";


static abstract private class BundleEntry implements Comparable<BundleEntry> {
    String name;
    String extension;

    @Override
    public int compareTo(BundleEntry o) {
        int comp =  this.getEnumName().compareTo(o.getEnumName());

        return comp;

        }
    
    abstract public String getEnumName();

    abstract public String getOwnerOrExtendsFrom();
};

static private class ClassEntry extends BundleEntry {
    String extendsFrom;
    
    ClassEntry(String name, String extension, String extendsFrom) {
        this.name = name;
        this.extension = extension;
        this.extendsFrom = extendsFrom;
    }


    @Override
    public String getEnumName() {
        String enumName = camelToUpperUnderscore(name);
        boolean isKeyword = javaKeywords.contains(enumName);
        enumName = enumName + (isKeyword ? "_" : "");
        return enumName;
    }

    @Override
    public String getOwnerOrExtendsFrom() {
        if (extendsFrom == null)
            return "null";
        
        return "\"" + extendsFrom + "\"";
    }
    
    

};

static private class AttributeEntry extends BundleEntry {
    ClassEntry ownedBy;
    
    AttributeEntry(String name, ClassEntry ownedBy) {
        this.name = name;
        this.extension = "";
        this.ownedBy = ownedBy;
    }

    @Override
    public String getEnumName() {
        String enumName = ownedBy.getEnumName() 
                + ATTRIBUTE_SEPARATOR 
                + camelToUpperUnderscore(name);
        return enumName;
    }

    @Override
    public String getOwnerOrExtendsFrom() {
        return "\"" + ownedBy.name + "\"";
    }  
    
};

// note: the guava case converter can't handle camels like URLDirectory, so I wrote a custom convertor
static private String camelToUpperUnderscore(String camel) {
    StringBuilder sb = new StringBuilder();
    int len = camel.length();
    if (len == 0) { 
        return ""; 
    }
    
    char curChar = camel.charAt(0);
    char previousChar = curChar;
    boolean previousCaseIsUpper;
    boolean curCaseIsUpper = Character.isUpperCase(curChar);
    
    
    for (int i = 1; i<len; i++) {
        curChar = camel.charAt(i);
        previousCaseIsUpper = Character.isUpperCase(previousChar);
        curCaseIsUpper = Character.isUpperCase(curChar);
        if (!curCaseIsUpper && previousCaseIsUpper) {
            sb.append("_");
        }
        sb.append(Character.toUpperCase(previousChar));
        previousChar = curChar;
        }
    sb.append(Character.toUpperCase(curChar));
    
    return sb.toString();
}


private static void InsertPair(TreeMap<String,TreeSet<BundleEntry>> namespaces, String namespace, BundleEntry bundleEntry) {
    if (!namespaces.containsKey(namespace)) {
        namespaces.put(namespace, new TreeSet<BundleEntry>());
    }
    namespaces.get(namespace).add(bundleEntry);
}
    
    
public static void MakeEnums(String targetFile, String packageName, String className, String[] rootDirs) throws IOException, InterruptedException{

    final TreeMap<String,TreeSet<BundleEntry>> namespaces = new TreeMap<String,TreeSet<BundleEntry>>();

    for (int i=0; i < rootDirs.length; i++)
    {
        File f = new File(rootDirs[i]);
        Path rootDir = f.toPath();
        
        // Walk thru a root directory
        Files.walkFileTree(rootDir, new FileVisitor<Path>() {
    
            @Override
            public FileVisitResult preVisitDirectory(Path path,
                    BasicFileAttributes atts) throws IOException {
    

                // in our case, the directory is not filtered, so always continue
                // but if it were, we would test and return SKIP_SUBTREE
                return  FileVisitResult.CONTINUE;
    
            }
    
            @Override
            public FileVisitResult visitFile(Path visPath, BasicFileAttributes mainAtts)
                    throws IOException {
                String filename = visPath.getFileName().toString();
                int dotPos = filename.lastIndexOf(".");
                String extension = (dotPos == -1 || dotPos >= filename.length() - 2) ? "" : filename.substring(dotPos+1);

                boolean isMatch = isBundleFile(extension);
                if (isMatch) {
                    String filenameMinusExt = (dotPos == -1) ? "" : filename.substring(0,dotPos); 
                    Path filePath = visPath.getParent();
                    Path namespacePath = filePath.getParent();
        
                    
                        if (namespacePath != null) {
                            String namespace = namespacePath.getFileName().toString();
        
                            // insert file name into appropriate namespace
                            
                            ArrayList<String> extendsResult = new ArrayList<String>();
                            TreeSet<String> attributes = getStructureFromTarget(visPath, extendsResult);
                            String extendsFrom = extendsResult.size() == 0 ? null : extendsResult.get(0);
                            ClassEntry classEntry = new ClassEntry(filenameMinusExt, extension, extendsFrom);
                            InsertPair(namespaces, namespace, classEntry);
                            
                            for (String attr : attributes) {
                                // insert file-qualified attribute into appropriate namespace 
                                InsertPair(namespaces, 
                                        namespace, 
                                        new AttributeEntry(attr, classEntry));
                            }
                        }
                    }
                
                return FileVisitResult.CONTINUE;
            }

            private boolean isBundleFile(String ext) {
               
                return ext.equals(EXTENSION_COMPONENT)
                        || ext.equals(EXTENSION_APPLICATION)
                        || ext.equals(EXTENSION_EVENT)
                        || ext.equals(EXTENSION_INTERFACE);
            }

            
            private boolean canInherit(String elementName) {
                
                return elementName.equals(ELEMENT_COMPONENT)
                        || elementName.equals(ELEMENT_APPLICATION)
                        || elementName.equals(ELEMENT_EVENT)
                        || elementName.equals(ELEMENT_INTERFACE);
            }
            
    
    
            /**
             * @param path - the xml file's location
             * @param targetSuper - the super from which this bundle extends
             * @return - a TreeSet of attribute names
             */
            private TreeSet<String>  getStructureFromTarget(Path path, ArrayList<String> extendsResult) {
                TreeSet<String> attributes = new TreeSet<String>();
                
                XMLInputFactory factory = XMLInputFactory.newInstance();
                factory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
                

                XMLStreamReader streamReader;
                try {
                    
                    streamReader = factory.createXMLStreamReader(
                            new HTMLReader(new FileReader(path.toAbsolutePath().toString())));

                    while(streamReader.hasNext()){
                            streamReader.next();
                            if(streamReader.getEventType() == XMLStreamReader.START_ELEMENT){
                                String elemName = streamReader.getLocalName();
                                
                                // process extends to find Super
                                if (canInherit(elemName)) {
                                    for (int i=0; i <streamReader.getAttributeCount(); i++) {
                                        String name = streamReader.getAttributeLocalName(i);
                                        if (name.equals(ELEMENT_EXTENDS)) {
                                            extendsResult.add(streamReader.getAttributeValue(i));
                                            break;
                                        }
                                    }
                                }

                                // attributes
                                else if (elemName==ELEMENT_AURA_ATTRIBUTE) {
                                    for (int i=0; i <streamReader.getAttributeCount(); i++) {
                                        String name = streamReader.getAttributeLocalName(i);
                                        if (name.equals(ELEMENT_ATTRIBUTE_NAME)) {
                                            attributes.add(streamReader.getAttributeValue(i));
                                        }
                                    }
                                }

                            }
                    }
                }
                catch (Exception e) {
                        e.printStackTrace();
                    }
                return attributes;
            }
            

            @Override
            public FileVisitResult postVisitDirectory(Path path,
                    IOException exc) throws IOException {
                return FileVisitResult.CONTINUE;  // do nothing
            }
    
            @Override
            public FileVisitResult visitFileFailed(Path path, IOException exc)
                    throws IOException {
                
                return FileVisitResult.CONTINUE;
            }
        });
        
        StringBuilder sb = EmitEnums(targetFile, packageName, className, rootDirs, namespaces);
        
        Path path = Paths.get(targetFile).getParent();
        Files.createDirectories(path);
        File file = new File(targetFile);
        BufferedWriter writer = new BufferedWriter(new FileWriter(file));
        try  {
            writer.write(sb.toString());
        }
        finally {
            writer.close();
        }
        
    }
}

    
private static StringBuilder EmitEnums(String targetFile, String packageName, String className, String[] rootDirs, TreeMap<String, TreeSet<BundleEntry>> namespaces) {
    StringBuilder sb = new StringBuilder();
    
    sb.append(String.format(packageString, 
            Arrays.toString(rootDirs).replace(",",",\n//    "), 
            packageName.replace("-", "_")));

    sb.append(String.format(classIntroString, className));

    String[] ns = new String[namespaces.keySet().size()];
    namespaces.keySet().toArray(ns);
    
    for (int i = 0; i < ns.length; i++) {
        String namespace = ns[i];
        sb.append(String.format(enumIntroString, namespace, namespace));
        boolean first = true;
        for (BundleEntry bundleEntry : namespaces.get(namespace)) {

            if (!first) {
                sb.append(String.format(enumInstanceSeparatorString));
            }
            first = false;
            
            sb.append(String.format(enumInstanceString, bundleEntry.getEnumName(), bundleEntry.name, getDefTypeString(bundleEntry.extension), bundleEntry.getOwnerOrExtendsFrom()));
        }
        sb.append(String.format(enumOutroString, namespace, namespace, namespace));
    }
    
    sb.append(classOutroString);

    return sb;

}


private static String getDefTypeString(String extension) {
    if (extension.equals(EXTENSION_COMPONENT))
        return DEFTYPE_COMPONENT;

    if (extension.equals(EXTENSION_EVENT))
        return DEFTYPE_EVENT;

    if (extension.equals(EXTENSION_APPLICATION))
        return DEFTYPE_APPLICATION;

    if (extension.equals(EXTENSION_INTERFACE))
        return DEFTYPE_INTERFACE;
    
    return DEFTYPE_ATTRIBUTE;
}


//public static void main(String[] args) throws IOException, InterruptedException {
//    if (args.length < 3) {
//        System.out.println("FileWalk targetFile rootDir1 rootDir2 ...");
//        return;
//    }
//    
//    String[] dirs = Arrays.copyOfRange(args, 3, args.length);
//    
//    MakeEnums(args[0], args[1], args[2], dirs);
//
//    }

}