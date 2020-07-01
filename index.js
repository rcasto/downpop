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
 * @property {number} countLastDayDownloads
 * @property {number} countLastWeekDownloads
 * @property {number} countLastMonthDownloads
 * @property {number} countLastYearDownloads
 * @property {boolean} success
 */

/**
 * @param {string} packageName
 * @returns {Promise<PackageInfo>}
 */
async function getNpmPackageInfo(packageName) {
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
                        typeof packageResult.countLastDayDownloads === 'number') {
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

            if (failedPackageResults.length > 0) {
                const failedPackageNames = failedPackageResults
                    .map(packageResult => packageResult.packageName);
                console.log(`Failed to get download stats for the following packages: ${failedPackageNames.join(', ')}`);
            }
        });
}