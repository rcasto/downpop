const fetch = require('node-fetch');

const npmDownloadStatsBaseUrl = `https://api.npmjs.org/downloads/point/`;
const timeRanges = [
    'last-day',
    'last-week',
    'last-month',
    'last-year'
];

/**
 * @typedef {Object} PackageInfo
 * @property {string} packageName
 * @property {number} countLastDayDownloads
 * @property {number} countLastWeekDownloads
 * @property {number} countLastMonthDownloads
 * @property {number} countLastYearDownloads
 * @property {boolean} success
 */

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
 * @param {string} packageName
 * @returns {Promise<PackageInfo>}
 */
async function _getNpmPackageInfo(packageName) {
    let countLastDayDownloads = -1;
    let countLastWeekDownloads = -1;
    let countLastMonthDownloads = -1;
    let countLastYearDownloads = -1;

    try {
        const downloadStatsRequestUrls = timeRanges
            .map(timeRange => `${npmDownloadStatsBaseUrl}${timeRange}/${packageName}`);

        const downloadStatsRequestPromises = downloadStatsRequestUrls
            .map(downloadStatsRequestUrl =>
                fetch(downloadStatsRequestUrl)
                    .then(response => response.json()));

        const downloadStatsRequestResults = await Promise.all(downloadStatsRequestPromises);
        const downloadStatsDownloadCounts = downloadStatsRequestResults
            .map(downloadStatsRequestResult => downloadStatsRequestResult.downloads);

        [
            countLastDayDownloads,
            countLastWeekDownloads,
            countLastMonthDownloads,
            countLastYearDownloads
        ] = downloadStatsDownloadCounts;
    } catch (err) { }

    return {
        packageName,
        countLastDayDownloads,
        countLastWeekDownloads,
        countLastMonthDownloads,
        countLastYearDownloads,
        success: countLastDayDownloads >= 0
    };
}

/**
 * @param {string|string[]} packageNames
 * @returns {Promise<PackageInfo[]>}
 */
function getNpmPackageInfo(packageNames) {
    return Promise.all(
        normalizeNpmPackageNames(packageNames)
            .map(packageName => _getNpmPackageInfo(packageName))
    );
}

/**
 * @param {string|string[]} packageNames 
 * @returns {Promise<void>}
 */
async function printNpmPackageInfoTable(packageNames) {
    try {
        const npmPackageInfoResults = await getNpmPackageInfo(packageNames);

        const successfulPackageResults = [];
        const failedPackageResults = [];

        npmPackageInfoResults
            .forEach(packageResult => {
                if (packageResult.success &&
                    typeof packageResult.countLastDayDownloads === 'number') {
                    successfulPackageResults.push(packageResult);
                } else {
                    failedPackageResults.push(packageResult);
                }
            });

        // Yay! We got package data, let's form a pretty table
        if (successfulPackageResults.length > 0) {
            console.table(successfulPackageResults
                .reduce((prevObj, currPackageInfo) => {
                    const {
                        countLastDayDownloads,
                        countLastWeekDownloads,
                        countLastMonthDownloads,
                        countLastYearDownloads
                    } = currPackageInfo;
                    return {
                        ...prevObj,
                        [currPackageInfo.packageName]: {
                            countLastDayDownloads,
                            countLastWeekDownloads,
                            countLastMonthDownloads,
                            countLastYearDownloads
                        }
                    };
                }, {}));
        }

        // Inform about packages we failed to info for
        if (failedPackageResults.length > 0) {
            const failedPackageNames = failedPackageResults
                .map(packageResult => packageResult.packageName);
            console.log(`Failed to get download stats for the following packages: ${failedPackageNames.join(', ')}`);
        }
    } catch (err) {
        console.error(`An error occurred while attempting to collect npm package info: ${err}`);
    }
}

module.exports = {
    getNpmPackageInfo,
    printNpmPackageInfoTable
};