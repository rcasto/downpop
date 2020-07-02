# downpop
Just a simple barebones way to get download statistics for npm packages.
```
npx downpop <package1> <package2> ... <packageN>
```

To display the output seen via the CLI, [console.table](https://developer.mozilla.org/en-US/docs/Web/API/Console/table) is used. So it may be subject to limitations based on the browser/environment it is ran in.