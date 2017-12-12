#!/bin/sh
rm */target/eslint-output || true
mvn pre-clean -Peslint || { status=$?; cat */target/eslint-output; exit ${status}; }
mvn -pl aura-modules tools:eslint-lwc
