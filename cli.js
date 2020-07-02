#!/usr/bin/env node

const { printNpmPackageInfoTable } = require('./index');

const commandName = 'downpop';
const npmPackages = process.argv.slice(2);

if (npmPackages.length <= 0) {
    console.log(`Usage: npx ${commandName} <package1> <package2> ... <packageN> or ${commandName} <package1> <package2> ... <packageN>`);
} else {
    printNpmPackageInfoTable(npmPackages);
}