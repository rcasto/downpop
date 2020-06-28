import fetch from 'node-fetch';

const npmRegistryBaseUrl = `https://registry.npmjs.org/`;
// const npmRegistryBaseUrl = `https://skimdb.npmjs.com/registry`;
const npmDownloadStatsBaseUrl = `https://api.npmjs.org/downloads/point/`;
const timeRange = 'last-day';
const npmPackages = [
    'simplequad',
    'adaptive-html',
    'express-request-activity',
    'readability-component',
    'code-bed',
    'social-contact'
];

/**
 * @typedef {Object} PackageInfo
 * @property {string} name
 * @property {string} version
 * @property {string} description
 * @property {number} numberOfDownloads
 */

/**
 * 
 * @param {string} packageName
 * @returns {Promise<PackageInfo>}
 */
async function getNpmPackageInfo(packageName) {
    const downloadStatsRequestUrl = `${npmDownloadStatsBaseUrl}${timeRange}/${packageName}`;
    const packageRegistryRequestUrl = `${npmRegistryBaseUrl}${packageName}/latest`;

    const downloadStatsRequestPromise = fetch(downloadStatsRequestUrl)
        .then(response => response.json());
    const packageRegistryRequestPromise = fetch(packageRegistryRequestUrl)
        .then(response => response.json());

    const packageDataResults = await Promise.all([
        downloadStatsRequestPromise,
        packageRegistryRequestPromise
    ]);
    const [downloadStats, registryData] = packageDataResults;

    const {
        downloads
    } = downloadStats;
    const {
        name,
        version,
        description
    } = registryData;
    
    return {
        name,
        version,
        description,
        numberOfDownloads: downloads
    };
}

const packageArgs = process.argv.slice(2);
console.log(packageArgs);

// Promise.all(npmPackages
//     .map(packageName => getNpmPackageInfo(packageName)))
//     .then(console.log)
//     .catch(console.error);