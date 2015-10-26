module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint')
    grunt.initConfig({
        eslint: {
            options: {
                configFile: '${basedir}/src/test/eslint/eslint-overrides.json',
                outputFile: '${project.build.directory}/eslint-output'
            },
            target: [
                '${basedir}/src/main/resources/aura/**/*.js',
                '!${basedir}/src/main/resources/aura/**/*_export.js'
            ]
        }
    });
    grunt.registerTask('default', ['eslint']);
};