import fetch from 'node-fetch';

const commandName = '';
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
 * @property {number} numLastDayDownloads
 * @property {number} numLastWeekDownloads
 * @property {number} numLastMonthDownloads
 * @property {number} numLastYearDownloads
 * @property {boolean} success
 */

/**
 * @param {string} packageName
 * @returns {Promise<PackageInfo>}
 */
async function getNpmPackageInfo(packageName) {
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

        const [
            numLastDayDownloads,
            numLastWeekDownloads,
            numLastMonthDownloads,
            numLastYearDownloads
        ] = downloadStatsDownloadCounts;
        
        return {
            packageName,
            numLastDayDownloads,
            numLastWeekDownloads,
            numLastMonthDownloads,
            numLastYearDownloads,
            success: true
        };
    } catch (err) {
        return {
            packageName,
            numLastDayDownloads: -1,
            numLastWeekDownloads: -1,
            numLastMonthDownloads: -1,
            numLastYearDownloads: -1,
            success: false
        };
    }
}

const npmPackages = process.argv.slice(2);

if (npmPackages.length <= 0) {
    console.log(`Usage: npx ${commandName} <package1> <package2> ... <packageN> or ${commandName} <package1> <package2> ... <packageN>`);
} else {
    Promise.all(npmPackages
        .map(packageName => getNpmPackageInfo(packageName)))
        .then(packageResults => {
            const successfulPackageResults = [];
            const failedPackageResults = [];
            packageResults
                .forEach(packageResult => {
                    if (packageResult.success &&
                        typeof packageResult.numLastDayDownloads === 'number') {
                        successfulPackageResults.push(packageResult);
                    } else {
                        failedPackageResults.push(packageResult);
                    }
                });
            return [
                successfulPackageResults,
                failedPackageResults
            ];
        })
        .then(splitPackageResults => {
            const [
                successfulPackageResults,
                failedPackageResults
            ] = splitPackageResults;

            console.log(successfulPackageResults);

            if (failedPackageResults.length > 0) {
                const failedPackageNames = failedPackageResults
                    .map(packageResult => packageResult.packageName);
                console.log(`Failed to get download stats for the following packages: ${failedPackageNames.join(', ')}`);
            }
        });
}