/**
 * This is an example in how to register a custom schema using a service
 * Alternatively, the API $A.clientService.addModuleSchemaResolver can be used
 * @param {Object} service - An object with registerSchema function
 * @param {Object} engine - The engine to register the service
 * @returns {Object} A test schema
 */
export default function SchemaResolverTest({ registerSchema }, engine) { // eslint-disable-line no-unused-vars
    // Trivial example for resolving this custom test:// schema
    registerSchema('test', resourceUri => `${resourceUri}#resolved`);

    return {
        name: 'SchemaResolverTest',
        schema: "test"
    };
}