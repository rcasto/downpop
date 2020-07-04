# downpop
Just a simple way to get a glance at download stats for npm packages.

![downpop usage](./downpop-usage.gif)

## Usage

### Via npx
```
npx downpop <package1> <package2> ... <packageN>
```

### Via code (Node.js)
1. Install the package using npm or otherwise:
    ```
    npm install downpop
    ```
2. Import and use in your code:
    ```javascript
    const downpop = require('downpop');

    downpop.printNpmPackageInfoTable([
        'jquery',
        'react',
        'vue'
    ]);
    ```

## API
```javascript
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
 * @returns {Promise<PackageInfo[]>}
 */
function getNpmPackageInfo(packageNames) {...}

/**
 * @param {string|string[]} packageNames 
 * @returns {Promise<void>}
 */
function printNpmPackageInfoTable(packageNames) {...}
```

## Notes
- To form the output [console.table](https://developer.mozilla.org/en-US/docs/Web/API/Console/table) is used. So it may be subject to limitations based on the browser/environment it is ran in.

- If you have [Node.js](https://nodejs.org) installed, you will in turn have [npm](https://www.npmjs.com/get-npm) installed and thus [npx](https://github.com/npm/npx) should be available for you to use as well.

## Resources
- [npm registry download counts api documentation](https://github.com/npm/registry/blob/master/docs/download-counts.md)
- [npx: an npm package runner](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)