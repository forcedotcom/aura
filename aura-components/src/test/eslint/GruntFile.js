module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-eslint')
    grunt.initConfig({
        eslint: {
            options: {
                configFile: '${basedir}/src/test/eslint/eslint-overrides.json',
                outputFile: '${project.build.directory}/eslint-output'
            },
            target: [
                '${basedir}/src/main/components/aura',
                '${basedir}/src/main/components/auraadmmin',
                '${basedir}/src/main/components/auradev',
                '${basedir}/src/main/components/aurajstest',
                '${basedir}/src/main/components/auraStorage',
                '${basedir}/src/main/components/ui'
           ]
        }
    });
    grunt.registerTask('default', ['eslint']);
};
