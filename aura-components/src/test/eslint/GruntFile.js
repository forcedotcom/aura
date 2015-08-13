module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint')
    grunt.initConfig({
        eslint: {
            options: {
                configFile: '${basedir}/src/test/eslint/eslint-overrides.json',
                outputFile: '${project.build.directory}/eslint-output'
            },
            target: [
                //'${basedir}/src/main/components/'
            ]
        }
    });
    grunt.registerTask('default', ['eslint']);
};