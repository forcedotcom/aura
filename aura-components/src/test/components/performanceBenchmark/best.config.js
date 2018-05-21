module.exports = {
    projectName: 'aura-framework-benchmark',
    testMatch: ['**/benchmarks/**/*.benchmark.js'],
    runnerConfig: [
        {
            runner: '@best/runner-headless',
            name: 'default',
        },
    ],
    benchmarkMaxDuration: process.env.DURATION || 1,
    benchmarkIterations: 60,
    outputMetricPattern: /runDuration/,
};