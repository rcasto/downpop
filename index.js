import { buildChart } from './barchart.js';

const npmDownloadStatsBaseUrl = `https://api.npmjs.org/downloads/point/`;
const timeRanges = [
    'last-day',
    'last-week',
    'last-month',
    'last-year'
];

/**
 * @typedef {Object} NpmPackageInfo
 * @property {string} package
 * @property {number} downloads
 * @property {string} start
 * @property {string} end
 */

/**
 * @typedef {Object} PackageInfo
 * @property {NpmPackageInfo[]} last-day
 * @property {NpmPackageInfo[]} last-week
 * @property {NpmPackageInfo[]} last-month
 * @property {NpmPackageInfo[]} last-year
 */

/**
 * @typedef {Object} PackageInfoResult
 * @property {string[]} charts
 * @property {string} error
 */ 

async function getFetch() {
    // If we are in a browser, we will just use the
    // native window.fetch function
    //
    // If we are in Node.js, we will use node-fetch
    //
    // This isn't fool proof, but should work for most cases
    if (typeof window === 'object' &&
        typeof window.fetch === 'function') {
        return window.fetch;
    } else {
        return (await import('node-fetch')).default;
    }
}

/**
 * @param {string} packageName
 * @returns {boolean}
 */
function isScopedPackage(packageName) {
    return (packageName || '')[0] === '@';
}

/**
 * @param {any} packageInfo 
 * @returns {boolean}
 */
function isPackageInfo(packageInfo) {
    return (
        typeof packageInfo === 'object' &&
        typeof packageInfo.downloads === 'number' &&
        typeof packageInfo.start === 'string' &&
        typeof packageInfo.end === 'string' &&
        typeof packageInfo.package === 'string'
    );
}

/**
 * @param {string|string[]} packageNames
 * @returns {string[]}
 */
function normalizeNpmPackageNames(packageNames) {
    if (Array.isArray(packageNames)) {
        return packageNames;
    }
    return [packageNames];
}

/**
 * @returns {PackageInfo}
 */
function normalizeNpmPackageInfo(packageInfo) {
    const normalizedPackageInfo = {};
    timeRanges
        .forEach(timeRange => {
            const packageInfoForTimeRange = packageInfo[timeRange];
            if (isPackageInfo(packageInfoForTimeRange)) {
                normalizedPackageInfo[timeRange] = [packageInfoForTimeRange];
            } else {
                normalizedPackageInfo[timeRange] = Object.values(packageInfoForTimeRange);
            }
        });
    return normalizedPackageInfo;
}

/**
 * @param {PackageInfo} bulkPackageInfo 
 * @param {PackageInfo} individualPackageInfo 
 * @returns {PackageInfo}
 */
function mergeNpmPackageInfo(bulkPackageInfo, individualPackageInfo) {
    if (!bulkPackageInfo) {
        bulkPackageInfo = {};
    }
    if (!individualPackageInfo) {
        individualPackageInfo = {};
    }
    const mergedPackageInfo = {};
    timeRanges
        .forEach(timeRange => {
            mergedPackageInfo[timeRange] = []
                .concat(bulkPackageInfo[timeRange] || [])
                .concat(individualPackageInfo[timeRange] || [])
                .filter(packageInfo => !!packageInfo);
        });
    return mergedPackageInfo;
}

/**
 * @param {string} packageName
 * @returns {Promise<PackageInfo>}
 */
async function _getNpmPackageInfo(packageName) {
    try {
        const fetch = await getFetch();
        const downloadStatsRequestUrls = timeRanges
            .map(timeRange => `${npmDownloadStatsBaseUrl}${timeRange}/${packageName}`);

        const downloadStatsRequestPromises = downloadStatsRequestUrls
            .map((downloadStatsRequestUrl, i) =>
                fetch(downloadStatsRequestUrl)
                    .then(response => response.json())
                    .then(result => ({
                        [timeRanges[i]]: result,
                    })));

        const downloadStatsRequestResults = await Promise.all(downloadStatsRequestPromises);
        return normalizeNpmPackageInfo(downloadStatsRequestResults
            .reduce((downloadStatsResults, downloadStatsResult) => ({
                ...downloadStatsResults,
                ...downloadStatsResult,
            }), {}));
    } catch (err) {
        return null;
    }
}

/**
 * @param {string[]} packageNames
 * @returns {Promise<PackageInfo>}
 */
async function _getBulkNpmPackageInfo(packageNames) {
    if (packageNames.length <= 0) {
        return null;
    }
    // construct a "package name" from all the packageNames provided and leverage
    // the _getNpmPackageInfo utility function above
    const bulkPackageName = packageNames.join(',');
    return await _getNpmPackageInfo(bulkPackageName);
}

/**
 * @param {string|string[]} packageNames
 * @returns {Promise<PackageInfo>}
 */
export async function getNpmPackageInfo(packageNames) {
    const scopedPackages = [];
    const nonScopedPackages = [];

    // splitting scoped vs. non-scoped here
    // since non-scoped packages support bulk queries
    // while scoped packages do not
    // https://github.com/npm/registry/blob/master/docs/download-counts.md#bulk-queries
    normalizeNpmPackageNames(packageNames)
        .forEach(packageName => {
            if (isScopedPackage(packageName)) {
                scopedPackages.push(packageName);
            } else {
                nonScopedPackages.push(packageName);
            }
        });

    const bulkPackageInfoPromise = _getBulkNpmPackageInfo(nonScopedPackages);
    const individualPackageInfoPromises = scopedPackages
        .map(scopedPackage => _getNpmPackageInfo(scopedPackage));

    const [
        bulkPackageResults,
        individualPackageResults
    ] = await Promise.all([
        bulkPackageInfoPromise,
        ...individualPackageInfoPromises
    ]);

    return mergeNpmPackageInfo(bulkPackageResults, individualPackageResults);
}

/**
 * @param {string|string[]} packageNames 
 * @returns {Promise<PackageInfoResult>}
 */
export async function buildNpmPackageInfoChart(packageNames) {
    const result = {
        charts: [],
        error: '',
    };

    try {
        const npmPackageInfoResults = await getNpmPackageInfo(packageNames);

        const packageNamesSuccessfullyFetched = new Set(npmPackageInfoResults[timeRanges[0]]
            .map(packageInfo => packageInfo.package));
        const packageNamesFailedToFetch = packageNames.filter(packageName => !packageNamesSuccessfullyFetched.has(packageName));

        // Yay! We got package data, let's form a pretty chart string
        if (packageNamesSuccessfullyFetched.size > 0) {
            timeRanges
                .forEach(timeRange => {
                    const title = `Number of downloads in ${timeRange}`;
                    const labels = [];
                    const values = [];

                    npmPackageInfoResults[timeRange]
                        .forEach(packageInfo => {
                            labels.push(packageInfo.package);
                            values.push(packageInfo.downloads);
                        });

                    result.charts.push(buildChart(labels, values, 50, title));
                });
        }

        // Inform about packages we failed to info for
        if (packageNamesFailedToFetch.length > 0) {
            result.error = `Failed to get download stats for the following packages: ${packageNamesFailedToFetch.join(', ')}`;
        }
    } catch (err) {
        result.error = `An error occurred while attempting to collect npm package info: ${err}`;
    }

    return result;
}