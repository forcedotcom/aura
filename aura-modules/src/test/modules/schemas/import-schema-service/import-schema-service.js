/**
 * This is an example in how to register a custom schema using a service
 * Alternatively, the API $A.clientService.addScopedModuleResolver can be used
 * @param {Object} service - An object with registerScopedModuleResolver function
 * @returns {Object} A test schema
 */
export default function SchemaResolverTest({ registerScopedModuleResolver }) {
    // Trivial example for resolving this custom test:// schema
    registerScopedModuleResolver('test', fullImport => `${fullImport.split('/')[1]}#resolved`);

    return {
        name: 'SchemaResolverTest',
        schema: "test"
    };
}