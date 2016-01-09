#!/bin/sh
rm ./aura-impl/src/test/eslint/eslint-output || true
rm ./aura-components/target/eslint-output || true
mvn pre-clean -Peslint || cat ./aura-impl/src/test/eslint/eslint-output && cat ./aura-components/target/eslint-output
