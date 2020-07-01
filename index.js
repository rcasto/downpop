import fetch from 'node-fetch';

const commandName = 'downpop';
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
export async function getNpmPackageInfo(packageName) {
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