//Configuration Mappings
Function.RegisterNamespace("Test.Tools.Aura");
Test.Tools.Aura.BuildDirectory=String.TrimEnd(System.Environment&&System.Environment.GetWorkingDirectory() || "","aura-impl","aura-components");

//Global Convenience Mappings
Import = Test.Tools.Aura.Attributes.ImportAttribute;
ImportJson = Test.Tools.Aura.Attributes.ImportJsonAttribute;