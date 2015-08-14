#!/bin/sh
rm ./aura-impl/target/eslint-output || true
mvn pre-clean -Peslint || cat ./aura-impl/target/eslint-output
