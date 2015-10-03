//Configuration Mappings
Function.RegisterNamespace("Test.Tools.Aura");
Test.Tools.Aura.BuildDirectory=String.TrimEnd(System.Environment&&System.Environment.GetWorkingDirectory() || "","aura-impl","aura-components");

//temporary hack for javascript code coverage
//ideally we would want to set the value for <workingDirectory>
//correctly so that we do not need to append /target/
if (System.Environment.GetParameters().named.coverage === "true") {
    Test.Tools.Aura.BuildDirectory+="/target/js-coverage";
    //jscover sets this on window which we do not have in xunit
    jscoverbeforeunload = true;
    window = {'jscoverage_report':true};
}

//Global Convenience Mappings
Import = Test.Tools.Aura.Attributes.ImportAttribute;
ImportJson = Test.Tools.Aura.Attributes.ImportJsonAttribute;