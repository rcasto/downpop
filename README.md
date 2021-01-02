# downpop
Just a simple way to get a glance at raw download counts for npm packages.

![downpop usage](./downpop-usage.gif)

## Usage

### Via npx
```
npx downpop <package1> <package2> ... <packageN>
```

To make sure you are using the latest version you can also do:
```
npx downpop@latest <package1> <package2> ... <packageN>
```

### Via code
1. Install the package using npm or otherwise:
    ```
    npm install downpop
    ```
2. Import and use in your code:
    ```javascript
    import { buildNpmPackageInfoCharts } from 'downpop';

   buildNpmPackageInfoCharts([
        'jquery',
        'react',
        'vue'
    ])
    .then(packageInfoChartsResult => console.log(packageInfoChartsResult.charts['last-month']));
    ```

### Examples
- [Browser](https://codepen.io/rcasto/pen/LYGQbPy)

## API
```javascript
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
 * @param {string|string[]} packageNames
 * @returns {Promise<PackageInfo[]>}
 */
function getNpmPackageInfo(packageNames) {...}

/**
 * @typedef {Object} PackageInfoCharts
 * @property {string} last-day
 * @property {string} last-week
 * @property {string} last-month
 * @property {string} last-year
 */

/**
 * @typedef {Object} PackageInfoChartsResult
 * @property {PackageInfoCharts} charts
 * @property {string} error
 */ 

/**
 * @param {string|string[]} packageNames 
 * @returns {Promise<PackageInfoChartsResult>}
 */
function buildNpmPackageInfoCharts(packageNames) {...}
```

## Notes
- If you have [Node.js](https://nodejs.org) installed, you will in turn have [npm](https://www.npmjs.com/get-npm) installed and thus [npx](https://github.com/npm/npx) should be available for you to use as well.

## Resources
- [npm registry download counts api documentation](https://github.com/npm/registry/blob/master/docs/download-counts.md)
- [npx: an npm package runner](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)
