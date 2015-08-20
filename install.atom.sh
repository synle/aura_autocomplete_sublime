#!/bin/bash
echo "remove previous version of snippets.cson";
rm -rf ~/.atom/snippets.cson;
echo "copying new version of snippets.cson";
cp snippet/aura.js.atom.cson ~/.atom/snippets.cson;
