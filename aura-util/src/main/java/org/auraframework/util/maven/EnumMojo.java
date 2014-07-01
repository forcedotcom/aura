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

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;



/*
 * example command-line execution for non-test bundles:
 * mvn org.auraframework:aura-util:enum
 *   DbaseScanDirectory=/home/eric.anderson/aura/aura
 *    -DscanDirectoryList=aura/src/main,aura-components/src/main,
 *    -DoutputPackageName=org.auraframework.Aura
 *    -DoutputClassName=AuraId
 *    -DoutputFile=/home/eric.anderson/genfile.java
 *    
 * example command-line execution for test bundles:
 * mvn org.auraframework:aura-util:enum
 *   DbaseScanDirectory=/home/eric.anderson/aura/aura
 *    -DscanDirectoryList=aura/src/test
 *    -DoutputPackageName=org.auraframework.Aura
 *    -DoutputClassName=AuraTestId
 *    -DoutputFile=/home/eric.anderson/genfile.java
 */

/**
 * Goal which touches creates enum reference classes for all identified aura bundles
 *
 * @goal enum
 * 
 * @phase generate-sources
 */

public class EnumMojo
    extends AbstractMojo
{
    /**
     * baseScanDirectory:
     * The base directory for scanned files.  all root dirs must be relative to this.
     * If this dir is relative, it will start at the pom files's location
     * @parameter property="baseScanDirectory"
     * @required
     */
    private File baseScanDirectory;
    
    
    /**
     * scanDirectoryList:
     * String list of target root directories, relative to baseScanDirectory.  
     * If the path starts with a directory separator, we will assume it is absolute.  
     * Else it will be relative to baseScanDirectory 
     * <scanDirectoryList>
     *   <param>reldir/fred</param>
     *   <param>/absdir/bob</param>
     * </scanDirectoryList>
     *     
     * @parameter property="scanDirectoryList"
     * @required
     */
    
    private String[] scanDirectoryList;

    /**
     * outputPackageName:
     * The generated java file's package
     * @parameter property="outputPackageName"
     * @required
     */
    private String outputPackageName;

    /**
     * outputClassName:
     * The generated java file's class
     * @parameter property="outputClassName"
     * @required
     */
    private String outputClassName;
    
    
    /**
     * outputFile:
     * The generated enum file is output to this file.  If the file name is relative, 
     * it will be relative to the pom file location
     * @parameter property="outputFile"
     * @required
     */
    private File outputFile;
    
    
    @Override
    public void execute()
        throws MojoExecutionException
    {
        Path baseScanDirPath = Paths.get(baseScanDirectory.getAbsolutePath());
        getLog().info( "Enum generator baseScanDirectory is:" + baseScanDirPath.toString() );

        for (int i = 0; i<scanDirectoryList.length; i++) {
            // append baseDir if not absolute
            if (!scanDirectoryList[i].startsWith(File.separator)) {
                scanDirectoryList[i]=baseScanDirPath.toString() + File.separator + scanDirectoryList[i];
            }
                
            getLog().info( "  dir:" + scanDirectoryList[i] );
        }

        
        getLog().info( "Generating the file:" + outputFile.toString() );
        
        try {
            FileWalk.MakeEnums(outputFile.getAbsolutePath().toString(), 
                    outputPackageName, 
                    outputClassName,  
                    scanDirectoryList);
        } catch(Exception ex) {
            throw new MojoExecutionException( "Error creating file " + outputFile.toString(), ex );
        }
        getLog().info( "Successfully created:" + outputFile.toString() );

    }
}
