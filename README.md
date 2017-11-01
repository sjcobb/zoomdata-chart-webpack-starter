# zoomdata-chart-webpack-starter
A starter kit for for building a Zoomdata Custom Chart, featuring Webpack

### Usage

```bash
git clone https://github.com/alexjoverm/typescript-library-starter.git YOURFOLDERNAME
cd YOURFOLDERNAME

# Run npm install and write your library name when asked. That's all!
npm install
```

**Start coding!** `package.json` and entry files are already set up for you. Just keep those files with the same names.

### Features

 - Zero-setup. After running `npm install` things will be setup for you :wink:
 - **[RollupJS](https://rollupjs.org/)** for multiple optimized bundles following the [standard convention](http://2ality.com/2017/04/setting-up-multi-platform-packages.html) and [Tree-shaking](https://alexjoverm.github.io/2017/03/06/Tree-shaking-with-Webpack-2-TypeScript-and-Babel/).
 - Tests, coverage and interactive watch mode using **[Jest](http://facebook.github.io/jest/)**
 - **[Prettier](https://github.com/prettier/prettier)** for code formatting.
 - **Docs automatic generation and deployment** to `gh-pages`, using **[TypeDoc](http://typedoc.org/)**
 - Automatic types `(*.d.ts)` file generation
 - **[Travis](https://travis-ci.org)** integration and **[Coveralls](https://coveralls.io/)** report
 - (Optional) **Automatic releases and changelog**, using [Semantic release](https://github.com/semantic-release/semantic-release), [Commitizen](https://github.com/commitizen/cz-cli), [Conventional changelog](https://github.com/conventional-changelog/conventional-changelog) and [Husky](https://github.com/typicode/husky) (for the git hooks)

### Excluding peerDependencies

On library development, one might want to set some peer dependencies, and thus remove those from the final bundle. You can see in [Rollup docs](https://rollupjs.org/#peer-dependencies) how to do that.

The good news is that you only need to include the dependency name in the `external` property within `rollup.config.js`. For example, if you wanna exclude `lodash`, just write `external: ['lodash']`.

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Runs `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Automatic releases

If you'd like to have automatic releases with Semantic Versioning, follow these simple steps.

_**Prerequisites**: you need to create/login accounts and add your project to:_
 - npm
 - Travis
 - Coveralls

Run the following command to prepare hooks and stuff:

```bash
npm run semantic-release-prepare
```

Follow the console instructions to install semantic release and run it (answer NO to "Generate travis.yml").

_Note: make sure you've setup `repository.url` in your `package.json` file_

```bash
npm install -g semantic-release-cli
semantic-release setup
# IMPORTANT!! Answer NO to "Generate travis.yml" question. It is already prepared for you :P
```

From now on, you'll need to use `npm run commit`, which is a convenient way to create conventional commits.

Automatic releases are possible thanks to [semantic release](https://github.com/semantic-release/semantic-release), which publishes your code automatically on Github and npm, plus generates a changelog automatically. This setup is highly influenced by [Kent C. Dodds course on egghead.io](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)

### Git Hooks

There is already set a `precommit` hook for formatting your code with Prettier :nail_care:

### FAQ

#### `Array.prototype.from`, `Promise`, `Map`... is undefined?

Babel only provides down-emits on syntactical features (`class`, `let`, `async/await`...), but not on functional features (`Array.prototype.find`, `Set`, `Promise`...), . For that, you need Polyfills, such as [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/).

For a library, `core-js` plays very nicely, since you can import just the polyfills you need:

```javascript
import "babel-polyfill/core-js/modules/es6.promise";
import "babel-polyfill/core-js/modules/es6.map";
...
```

#### What is `npm install` doing when I run it for the first time?

It runs the script `tools/init` which sets up everything for you. In short, it:
 - Configures Webpack for the development and production builds, which creates the bundles.
 - Configures `package.json`
 - Renames main src files

## Resources

- [Zoomdata Chart CLI](https://github.com/jonavila/zoomdata-chart-cli)
- [📺 Create a TypeScript Library using typescript-library-starter](https://egghead.io/lessons/typescript-create-a-typescript-library-using-typescript-library-starter) by [@alexjoverm](https://github.com/alexjoverm/)

## Credits

Inspired heavily by the work of [@alexjoverm](https://twitter.com/alexjoverm) in [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter)
