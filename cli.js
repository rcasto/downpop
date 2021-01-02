#!/usr/bin/env node

import { buildNpmPackageInfoCharts } from './index.js';

const commandName = 'downpop';
const npmPackages = process.argv.slice(2);

if (npmPackages.length <= 0) {
    console.log(`Usage: npx ${commandName} <package1> <package2> ... <packageN> or ${commandName} <package1> <package2> ... <packageN>`);
} else {
    buildNpmPackageInfoCharts(npmPackages)
        .then(packageChartResult => {
            Object.keys(packageChartResult.charts)
                .forEach(timeRange => console.log(packageChartResult.charts[timeRange]));

            if (packageChartResult.error) {
                console.error(packageChartResult.error);
            }
        })
        .catch(err => console.error(err));
}