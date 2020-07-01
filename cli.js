import { getNpmPackageInfo } from './index';

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