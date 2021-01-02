#!/usr/bin/env node

import { buildNpmPackageInfoChart } from './index.js';

const commandName = 'downpop';
const npmPackages = process.argv.slice(2);

if (npmPackages.length <= 0) {
    console.log(`Usage: npx ${commandName} <package1> <package2> ... <packageN> or ${commandName} <package1> <package2> ... <packageN>`);
} else {
    buildNpmPackageInfoChart(npmPackages)
        .then(packageChartResult => {
            packageChartResult.charts
                .forEach(chart => console.log(chart));

            if (packageChartResult.error) {
                console.error(packageChartResult.error);
            }
        })
        .catch(err => console.error(err));
}