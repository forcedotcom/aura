== Configure Eclipse Environmment ==

All paths listed in this file are relative to the aura repository root.

The following style configurations are mandatory. All code in the Aura
repository should conform to this style format. Any changes to this format will
take the form of an update to this folder along with a repository-wide cleanup
pass.

Before submitting any code to the Aura repository, a committer MUST be sure
that the changed code adheres to the canonical Aura format. Thus, a
repository-wide Cleanup pass should result in no changes if all committed code
is conformant.

Feel free to apply these settings as project-specific to the set of aura
projects in your workspace. Assuming no one has committed any violating code,
you should be able to validate your configuration by selecting the aura
projects and doing a cleanup pass with the Aura profile. If the cleanup pass
does not result in any changes, then your cleanup configuration is in sync with the
canonical style. You will still need to manually verify that your Save Actions
(see below) are set properly.

All options underneath Java->CodeStyle can be quickly configuring by importing
auraEclipsePrefs.epf.

-- Code Style/Formatting (covered by auraEclipsePrefs.epf)--
* Window->Preferences->Java->Code Style->Formatter->Import: eclipse/auraFormat.xml

The Aura style format is based on the default Eclipse formatter. The notable
deviations from the default style include:
  - Spaces only
  - 120 columns for code (120 columsn for comments)
  - enum constants are always wrapped
  - no new line after @param tags

--  Import Organization (covered by auraEclipsePrefs.epf)--
* Window->Preferences->Java->Code Style->Organize Imports

Verify that your import order is consistent with the Eclipse default:
  java
  javax
  org
  com

Number of imports needed for .*: 99
Number of static imports needed for .*: 99

-- Clean Up (covered by auraEclipsePrefs.epf)--
* Window->Preferences->Java->Code Style->Clean Up->Import: eclipse/auraCleanup.xml

-- Code Templates (covered by auraEclipsePrefs.epf)--
* Window->Preferences->Java->Code Style->Code Templates->Import: eclipse/auraCodeTemplates.xml

This sets up the Aura copyright header for new Java files


-- JS Code Style/Formatting (NOT covered by auraEclipsePrefs.epf)--
* Window->Preferences->Javascript->Code Style->Formatter->Import: eclipse/auraJSFormat.xml


-- JS Code Templates (NOT covered by auraEclipsePrefs.epf)--
* Window->Preferences->Javascript->Code Style->Code Templates->Import: eclipse/JS.xml


-- Save Actions (NOT covered by the import)--
* Window->Preferences->Java->Editor->Save Actions

Select the following options:

[x] Perform the selected actions on save
  [x] Format source code
    [.] Format all lines
  [x] Organize Imports
  [x] Additional Actions
     Configure...
     | Code Organizing |
       [x] Remove Trailing whitespace (All Lines)
       [x] Correct Indentation

       ***DO NOT auto sort members***

     | Code Style |
       [x] Use final modifier where possible
         [x] Private Fields [ ] Paramter [ ] Local Variables

     | Missing Code |
      (Select all)

     | Unnecessary Code |
       [x] Remove unused imports
       ...
       [x] Remove unnecssary casts





-- Addendum for style updates --
You can stop reading now if you do not need to change the canonical style
rules.

If you need to change the rules, simply make the appropriate configuration
changes in your Eclipse environment. Then, export the relevant files into the
eclipse/ folder and update this file appropriately. If no users have issues
with the Eclipse Preferences file route for those options that can be stored
there, then we may decide to remove those specific instructions and import
files in favor of just a single .epf to cover those options. Until then, be
sure to update all of the relevant .xml and .epf files.

Finally, once the configuration changes are in, do a repository-wide format
pass. Communicate such a change to all aura developers as they will need to
manually update their configurations.



-- Addendum for command line usage--
Though not necessary for interactive use, it may be useful to run the formatter
from the command line in the context of an autobuild or other such environment
(e.g. in order to implement a prechekin validation for format compliance)

1) Follow the steps above to configure a seed workspace.

2) Choose any of the framework aura- projects and enable project specific
settings and set it to the Aura profile in the Eclipse UI. (In the example
commands below, we use the 'aura' project).

3) If necessary, save the resulting
/path/to/lumen-beta/aura/.settings/org.eclipse.jdt.core.prefs file to a
persistent location.

4) Run the formatter by invoking the eclipse executable and passing the
following arguments
 -application org.eclipse.jdt.ccore.JavaCodeFormatter
 -verbose
 -config /path/to/lumen-beta/aura/.settings/org.eclipse.jdt.core.prefs
 <files to format>

After a one-time setup of 1-3, the autobuilder can simply rerun step 4 as
necessary.

For example, a simple invocation on OSX would be:
$ cd $HOME/src/lumen-beta
$ /Applications/eclipse/Eclipse.app/Contents/MacOS/eclipse -application org.eclipse.jdt.core.JavaCodeFormatter -verbose -config $HOME/src/lumen-beta/aura/.settings/org.eclipse.jdt.core.prefs $(find `pwd` -type f -name "*.java" | grep -v '/target/')
