#!/bin/sh
rm ./aura-impl/target/eslint-output || true
rm ./aura-components/target/eslint-output || true
mvn pre-clean -Peslint || cat ./aura-impl/target/eslint-output && cat ./aura-components/target/eslint-output
mvn tools:eslint-raptor
