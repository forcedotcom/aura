/**
 * This is an example in how to register a custom schema using a service
 * Alternatively, the API $A.clientService.addModuleSchemaResolver can be used
*/
export default function SchemaResolverTest({ registerSchema }, engine) {
    
    // Trivial example for resolving this custom test:// schema
    registerSchema('test', resourceUri => `${resourceUri}#resolved`);

    return {
        name: 'SchemaResolverTest',
        schema: "test"
    };
}