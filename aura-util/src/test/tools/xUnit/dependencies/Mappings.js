//Configuration Mappings
Function.RegisterNamespace("Test.Tools.Aura");
Test.Tools.Aura.BuildDirectory=String.TrimEnd(System.Environment&&System.Environment.GetWorkingDirectory() || "","aura-impl","aura-components");

//temporary hack for javascript code coverage
//ideally we would want to set the value for <workingDirectory>
//as current module, but to refer to node npm installation, we set
//working directory as aura.home, thus, here we need to reset that
//to point to where we have instrumented resources
if (System.Environment.GetParameters().named.coverage === "true") {
    Test.Tools.Aura.BuildDirectory+="/aura-integration-test/target/js-coverage";
    //jscover sets this on window which we do not have in xunit
    jscoverbeforeunload = true;
    window = {'jscoverage_report':true};
}

// Global Convenience Mappings

// Attributes to load parts or all of Aura
Aura = Test.Tools.Aura.Attributes.AuraAttribute;
AuraUtil = Test.Tools.Aura.Attributes.AuraUtilAttribute;

// Override Import Attributes to path correctly
Import = Test.Tools.Aura.Attributes.ImportAttribute;
ImportJson = Test.Tools.Aura.Attributes.ImportJsonAttribute;

// Add Canned Aura Stubs
Stubs.Aura=Test.Tools.Aura.Stubs.Aura;