# Change Log

## 11.0.0-6-next.10

### Patch Changes

- Updated dependencies [6c1eb021]
  - @verdaccio/core@6.0.0-6-next.3

## 11.0.0-6-next.9

### Minor Changes

- 154b2ecd: refactor: remove @verdaccio/commons-api in favor @verdaccio/core and remove duplications

### Patch Changes

- Updated dependencies [794af76c]
- Updated dependencies [154b2ecd]
  - @verdaccio/core@6.0.0-6-next.2
  - @verdaccio/file-locking@11.0.0-6-next.4
  - @verdaccio/streams@11.0.0-6-next.5

## 11.0.0-6-next.8

### Major Changes

- 459b6fa7: refactor: search v1 endpoint and local-database

  - refactor search `api v1` endpoint, improve performance
  - remove usage of `async` dependency https://github.com/verdaccio/verdaccio/issues/1225
  - refactor method storage class
  - create new module `core` to reduce the ammount of modules with utilities
  - use `undici` instead `node-fetch`
  - use `fastify` instead `express` for functional test

  ### Breaking changes

  - plugin storage API changes
  - remove old search endpoint (return 404)
  - filter local private packages at plugin level

  The storage api changes for methods `get`, `add`, `remove` as promise base. The `search` methods also changes and recieves a `query` object that contains all query params from the client.

  ```ts
  export interface IPluginStorage<T> extends IPlugin {
    add(name: string): Promise<void>;
    remove(name: string): Promise<void>;
    get(): Promise<any>;
    init(): Promise<void>;
    getSecret(): Promise<string>;
    setSecret(secret: string): Promise<any>;
    getPackageStorage(packageInfo: string): IPackageStorage;
    search(query: searchUtils.SearchQuery): Promise<searchUtils.SearchItem[]>;
    saveToken(token: Token): Promise<any>;
    deleteToken(user: string, tokenKey: string): Promise<any>;
    readTokens(filter: TokenFilter): Promise<Token[]>;
  }
  ```

### Patch Changes

- Updated dependencies [459b6fa7]
  - @verdaccio/commons-api@11.0.0-6-next.4
  - @verdaccio/core@6.0.0-6-next.1
  - @verdaccio/streams@11.0.0-6-next.4
  - @verdaccio/file-locking@11.0.0-alpha.3

## 11.0.0-6-next.7

### Patch Changes

- df0da3d6: Added core-js missing from dependencies though referenced in .js sources

## 11.0.0-6-next.6

### Minor Changes

- 1b217fd3: Some verdaccio modules depend on 'mkdirp' library which provides recursive directory creation functionality.
  NodeJS can do this out of the box since v.10.12. The last commit in 'mkdirp' was made in early 2016, and it's mid 2021 now.
  Time to stick with a built-in library solution!

  - All 'mkdirp' calls are replaced with appropriate 'fs' calls.

## 11.0.0-6-next.5

### Major Changes

- cb2281a5: # async storage plugin bootstrap

  Gives a storage plugin the ability to perform asynchronous tasks on initialization

  ## Breaking change

  Plugin must have an init method in which asynchronous tasks can be executed

  ```js
  public async init(): Promise<void> {
     this.data = await this._fetchLocalPackages();
     this._sync();
  }
  ```

## 10.0.0-alpha.4

### Patch Changes

- fecbb9be: chore: add release step to private regisry on merge changeset pr
- Updated dependencies [fecbb9be]
  - @verdaccio/commons-api@10.0.0-alpha.3
  - @verdaccio/file-locking@10.0.0-alpha.3
  - @verdaccio/streams@10.0.0-alpha.3

## 10.0.0-alpha.3

### Minor Changes

- 54c58d1e: feat: add server rate limit protection to all request

  To modify custom values, use the server settings property.

  ```markdown
  server:

  ## https://www.npmjs.com/package/express-rate-limit#configuration-options

  rateLimit:
  windowMs: 1000
  max: 10000
  ```

  The values are intended to be high, if you want to improve security of your server consider
  using different values.

### Patch Changes

- Updated dependencies [54c58d1e]
  - @verdaccio/commons-api@10.0.0-alpha.2
  - @verdaccio/file-locking@10.0.0-alpha.2
  - @verdaccio/streams@10.0.0-alpha.2

## 10.0.0-alpha.2

### Minor Changes

- 2a327c4b: feat: remove level dependency by lowdb for npm token cli as storage

  ### new npm token database

  There will be a new database located in your storage named `.token-db.json` which
  will store all references to created tokens, **it does not store tokens**, just
  mask of them and related metadata required to reference them.

  #### Breaking change

  If you were relying on `npm token` experiment. This PR will replace the
  used database (level) by a json plain based one (lowbd) which does not
  require Node.js C++ compilation step and has less dependencies. Since was
  a experiment there is no migration step.

## 10.0.0-alpha.1

### Major Changes

- d87fa026: feat!: experiments config renamed to flags

  - The `experiments` configuration is renamed to `flags`. The functionality is exactly the same.

  ```js
  flags: token: false;
  search: false;
  ```

  - The `self_path` property from the config file is being removed in favor of `config_file` full path.
  - Refactor `config` module, better types and utilities

- da1ee9c8: - Replace signature handler for legacy tokens by removing deprecated crypto.createDecipher by createCipheriv

  - Introduce environment variables for legacy tokens

  ### Code Improvements

  - Add debug library for improve developer experience

  ### Breaking change

  - The new signature invalidates all previous tokens generated by Verdaccio 4 or previous versions.
  - The secret key must have 32 characters long.

  ### New environment variables

  - `VERDACCIO_LEGACY_ALGORITHM`: Allows to define the specific algorithm for the token signature which by default is `aes-256-ctr`
  - `VERDACCIO_LEGACY_ENCRYPTION_KEY`: By default, the token stores in the database, but using this variable allows to get it from memory

### Minor Changes

- 26b494cb: feat: add typescript project references settings

  Reading https://ebaytech.berlin/optimizing-multi-package-apps-with-typescript-project-references-d5c57a3b4440 I realized I can use project references to solve the issue to pre-compile modules on develop mode.

  It allows to navigate (IDE) trough the packages without need compile the packages.

  Add two `tsconfig`, one using the previous existing configuration that is able to produce declaration files (`tsconfig.build`) and a new one `tsconfig` which is enables [_projects references_](https://www.typescriptlang.org/docs/handbook/project-references.html).

### Patch Changes

- b57b4338: Enable prerelease mode with **changesets**
- 31af0164: ESLint Warnings Fixed

  Related to issue #1461

  - max-len: most of the sensible max-len errors are fixed
  - no-unused-vars: most of these types of errors are fixed by deleting not needed declarations
  - @typescript-eslint/no-unused-vars: same as above

- Updated dependencies [d87fa026]
- Updated dependencies [da1ee9c8]
- Updated dependencies [26b494cb]
- Updated dependencies [b57b4338]
- Updated dependencies [31af0164]
  - @verdaccio/commons-api@10.0.0-alpha.1
  - @verdaccio/file-locking@10.0.0-alpha.1
  - @verdaccio/streams@10.0.0-alpha.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.7.2](https://github.com/verdaccio/monorepo/compare/v9.7.1...v9.7.2) (2020-07-20)

**Note:** Version bump only for package @verdaccio/local-storage

## [9.7.1](https://github.com/verdaccio/monorepo/compare/v9.7.0...v9.7.1) (2020-07-10)

### Bug Fixes

- update dependencies ([#375](https://github.com/verdaccio/monorepo/issues/375)) ([1e7aeec](https://github.com/verdaccio/monorepo/commit/1e7aeec31b056979285e272793a95b8c75d57c77))

# [9.7.0](https://github.com/verdaccio/monorepo/compare/v9.6.1...v9.7.0) (2020-06-24)

**Note:** Version bump only for package @verdaccio/local-storage

## [9.6.1](https://github.com/verdaccio/monorepo/compare/v9.6.0...v9.6.1) (2020-06-07)

**Note:** Version bump only for package @verdaccio/local-storage

## [9.5.1](https://github.com/verdaccio/monorepo/compare/v9.5.0...v9.5.1) (2020-06-03)

### Bug Fixes

- restore Node v8 support ([#361](https://github.com/verdaccio/monorepo/issues/361)) ([9be55a1](https://github.com/verdaccio/monorepo/commit/9be55a1deebe954e8eef9edc59af9fd16e29daed))

# [9.5.0](https://github.com/verdaccio/monorepo/compare/v9.4.1...v9.5.0) (2020-05-02)

**Note:** Version bump only for package @verdaccio/local-storage

# [9.4.0](https://github.com/verdaccio/monorepo/compare/v9.3.4...v9.4.0) (2020-03-21)

**Note:** Version bump only for package @verdaccio/local-storage

## [9.3.4](https://github.com/verdaccio/monorepo/compare/v9.3.3...v9.3.4) (2020-03-11)

### Bug Fixes

- update mkdirp@1.0.3 ([#341](https://github.com/verdaccio/monorepo/issues/341)) ([96db337](https://github.com/verdaccio/monorepo/commit/96db3378a4f2334ec89cfb113af95e9a3a6eb050))

## [9.3.2](https://github.com/verdaccio/monorepo/compare/v9.3.1...v9.3.2) (2020-03-08)

### Bug Fixes

- update dependencies ([#332](https://github.com/verdaccio/monorepo/issues/332)) ([b6165ae](https://github.com/verdaccio/monorepo/commit/b6165aea9b7e4012477081eae68bfa7159c58f56))

## [9.3.1](https://github.com/verdaccio/monorepo/compare/v9.3.0...v9.3.1) (2020-02-23)

**Note:** Version bump only for package @verdaccio/local-storage

# [9.3.0](https://github.com/verdaccio/monorepo/compare/v9.2.0...v9.3.0) (2020-01-29)

**Note:** Version bump only for package @verdaccio/local-storage

# [9.0.0](https://github.com/verdaccio/monorepo/compare/v8.5.3...v9.0.0) (2020-01-07)

### Bug Fixes

- prevent circular structure exception ([#312](https://github.com/verdaccio/monorepo/issues/312)) ([f565461](https://github.com/verdaccio/monorepo/commit/f565461f5bb2873467eeb4372a12fbf4a4974d17))

## [8.5.2](https://github.com/verdaccio/monorepo/compare/v8.5.1...v8.5.2) (2019-12-25)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.5.1](https://github.com/verdaccio/monorepo/compare/v8.5.0...v8.5.1) (2019-12-24)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.5.0](https://github.com/verdaccio/monorepo/compare/v8.4.2...v8.5.0) (2019-12-22)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.4.2](https://github.com/verdaccio/monorepo/compare/v8.4.1...v8.4.2) (2019-11-23)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.4.1](https://github.com/verdaccio/monorepo/compare/v8.4.0...v8.4.1) (2019-11-22)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.4.0](https://github.com/verdaccio/monorepo/compare/v8.3.0...v8.4.0) (2019-11-22)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.3.0](https://github.com/verdaccio/monorepo/compare/v8.2.0...v8.3.0) (2019-10-27)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.2.0](https://github.com/verdaccio/monorepo/compare/v8.2.0-next.0...v8.2.0) (2019-10-23)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.2.0-next.0](https://github.com/verdaccio/monorepo/compare/v8.1.4...v8.2.0-next.0) (2019-10-08)

### Bug Fixes

- fixed lint errors ([5e677f7](https://github.com/verdaccio/monorepo/commit/5e677f7))

## [8.1.2](https://github.com/verdaccio/monorepo/compare/v8.1.1...v8.1.2) (2019-09-29)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.1.1](https://github.com/verdaccio/monorepo/compare/v8.1.0...v8.1.1) (2019-09-26)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.1.0](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.1...v8.1.0) (2019-09-07)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.0.1-next.1](https://github.com/verdaccio/monorepo/compare/v8.0.1-next.0...v8.0.1-next.1) (2019-08-29)

**Note:** Version bump only for package @verdaccio/local-storage

## [8.0.1-next.0](https://github.com/verdaccio/monorepo/compare/v8.0.0...v8.0.1-next.0) (2019-08-29)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.0.0](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.4...v8.0.0) (2019-08-22)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.0.0-next.4](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.3...v8.0.0-next.4) (2019-08-18)

**Note:** Version bump only for package @verdaccio/local-storage

# [8.0.0-next.3](https://github.com/verdaccio/monorepo/compare/v8.0.0-next.2...v8.0.0-next.3) (2019-08-16)

### Bug Fixes

- restore closure ([32b9d7e](https://github.com/verdaccio/monorepo/commit/32b9d7e))
- **build:** error on types for fs callback ([cc35acb](https://github.com/verdaccio/monorepo/commit/cc35acb))
- Add DATE and VERSION in search result ([e352b75](https://github.com/verdaccio/monorepo/commit/e352b75))
- avoid open write stream if resource exist [#1191](https://github.com/verdaccio/monorepo/issues/1191) ([f041d3f](https://github.com/verdaccio/monorepo/commit/f041d3f))
- bug fixing integration ([6c75ac8](https://github.com/verdaccio/monorepo/commit/6c75ac8))
- build before publish ([cd6c7ff](https://github.com/verdaccio/monorepo/commit/cd6c7ff))
- check whether path exist before return result ([a4d2af1](https://github.com/verdaccio/monorepo/commit/a4d2af1))
- flow issues ([f42a284](https://github.com/verdaccio/monorepo/commit/f42a284))
- ignore flow on this one, we need it ([c8e0b2b](https://github.com/verdaccio/monorepo/commit/c8e0b2b))
- local storage requires package.json file for read, save and create all the time ([33c847b](https://github.com/verdaccio/monorepo/commit/33c847b))
- migration from main repository merge [#306](https://github.com/verdaccio/monorepo/issues/306) ([8fbe86e](https://github.com/verdaccio/monorepo/commit/8fbe86e))
- missing callback ([abfc422](https://github.com/verdaccio/monorepo/commit/abfc422))
- missing error code ([7121939](https://github.com/verdaccio/monorepo/commit/7121939))
- move to local storage the fs location handler ([3b12083](https://github.com/verdaccio/monorepo/commit/3b12083))
- mtimeMs is not backward compatible ([c6f74eb](https://github.com/verdaccio/monorepo/commit/c6f74eb))
- remove temp file whether is emtpy and fails ([655102f](https://github.com/verdaccio/monorepo/commit/655102f))
- remove uncessary async ([3e3e3a6](https://github.com/verdaccio/monorepo/commit/3e3e3a6))
- remove unused parameters ([554e301](https://github.com/verdaccio/monorepo/commit/554e301))
- restore build path ([4902042](https://github.com/verdaccio/monorepo/commit/4902042))
- return time as milliseconds ([15467ba](https://github.com/verdaccio/monorepo/commit/15467ba))
- sync after set secret ([2abae4f](https://github.com/verdaccio/monorepo/commit/2abae4f))
- temp files are written into the storage ([89a1dc8](https://github.com/verdaccio/monorepo/commit/89a1dc8))
- unit test ([995a27c](https://github.com/verdaccio/monorepo/commit/995a27c))
- update @verdaccio/file-locking@1.0.0 ([9bd36f0](https://github.com/verdaccio/monorepo/commit/9bd36f0))
- update lodash types ([184466c](https://github.com/verdaccio/monorepo/commit/184466c))

### Features

- token support with level.js ([#168](https://github.com/verdaccio/monorepo/issues/168)) ([ca877ff](https://github.com/verdaccio/monorepo/commit/ca877ff))
- **build:** standardize build ([33fe090](https://github.com/verdaccio/monorepo/commit/33fe090))
- change new db name to verdaccio ([#83](https://github.com/verdaccio/monorepo/issues/83)) ([edfca9f](https://github.com/verdaccio/monorepo/commit/edfca9f))
- drop node v6 support ([664f288](https://github.com/verdaccio/monorepo/commit/664f288))
- implement search ([2e2bb32](https://github.com/verdaccio/monorepo/commit/2e2bb32))
- migrate to typescript ([c439d25](https://github.com/verdaccio/monorepo/commit/c439d25))
- update database method with callbacks ([ef202a9](https://github.com/verdaccio/monorepo/commit/ef202a9))
- update minor dependencies ([007b026](https://github.com/verdaccio/monorepo/commit/007b026))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.3.0](https://github.com/verdaccio/local-storage/compare/v2.2.1...v2.3.0) (2019-08-13)

### Bug Fixes

- restore closure ([8ec27f2](https://github.com/verdaccio/local-storage/commit/8ec27f2))

### Features

- add logging for each method ([3c915c7](https://github.com/verdaccio/local-storage/commit/3c915c7))
- token support with level.js ([#168](https://github.com/verdaccio/local-storage/issues/168)) ([16727bd](https://github.com/verdaccio/local-storage/commit/16727bd))

### [2.2.1](https://github.com/verdaccio/local-storage/compare/v2.2.0...v2.2.1) (2019-06-30)

### Bug Fixes

- **build:** error on types for fs callback ([774d808](https://github.com/verdaccio/local-storage/commit/774d808))

## [2.2.0](https://github.com/verdaccio/local-storage/compare/v2.1.0...v2.2.0) (2019-06-30)

### Features

- **build:** standardize build ([eba832e](https://github.com/verdaccio/local-storage/commit/eba832e))

# [2.1.0](https://github.com/verdaccio/local-storage/compare/v2.0.0...v2.1.0) (2019-03-29)

### Bug Fixes

- remove uncessary async ([23a09f3](https://github.com/verdaccio/local-storage/commit/23a09f3))

### Features

- drop node v6 support ([ef548e0](https://github.com/verdaccio/local-storage/commit/ef548e0))

# [2.0.0](https://github.com/verdaccio/local-storage/compare/v2.0.0-beta.3...v2.0.0) (2019-03-29)

<a name="2.0.0-beta.3"></a>

# [2.0.0-beta.3](https://github.com/verdaccio/local-storage/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2019-02-24)

### Bug Fixes

- update [@verdaccio](https://github.com/verdaccio)/file-locking@1.0.0 ([587245d](https://github.com/verdaccio/local-storage/commit/587245d))

<a name="2.0.0-beta.2"></a>

# [2.0.0-beta.2](https://github.com/verdaccio/local-storage/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2019-02-24)

### Bug Fixes

- avoid open write stream if resource exist [#1191](https://github.com/verdaccio/local-storage/issues/1191) ([b13904a](https://github.com/verdaccio/local-storage/commit/b13904a))
- package.json to reduce vulnerabilities ([97e9dc3](https://github.com/verdaccio/local-storage/commit/97e9dc3))

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/verdaccio/local-storage/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2019-02-03)

<a name="2.0.0-beta.0"></a>

# [2.0.0-beta.0](https://github.com/verdaccio/local-storage/compare/v1.2.0...v2.0.0-beta.0) (2019-02-01)

### Bug Fixes

- **deps:** update dependency lodash to v4.17.11 ([682616a](https://github.com/verdaccio/local-storage/commit/682616a))

### Features

- custom storage location ([b1423cd](https://github.com/verdaccio/local-storage/commit/b1423cd))
- migrate to typescript ([fe8344b](https://github.com/verdaccio/local-storage/commit/fe8344b))

### BREAKING CHANGES

- we change from boolean value to string within the config file

<a name="1.2.0"></a>

# [1.2.0](https://github.com/verdaccio/local-storage/compare/v1.1.3...v1.2.0) (2018-08-25)

### Features

- change new db name to verdaccio ([#83](https://github.com/verdaccio/local-storage/issues/83)) ([143977d](https://github.com/verdaccio/local-storage/commit/143977d))

<a name="1.1.3"></a>

## [1.1.3](https://github.com/verdaccio/local-storage/compare/v1.1.2...v1.1.3) (2018-07-15)

### Bug Fixes

- remove unused parameters ([3ce374a](https://github.com/verdaccio/local-storage/commit/3ce374a))

<a name="1.1.2"></a>

## [1.1.2](https://github.com/verdaccio/local-storage/compare/v1.1.1...v1.1.2) (2018-06-09)

### Bug Fixes

- return time as milliseconds ([c98be85](https://github.com/verdaccio/local-storage/commit/c98be85))

<a name="1.1.1"></a>

## [1.1.1](https://github.com/verdaccio/local-storage/compare/v1.1.0...v1.1.1) (2018-06-08)

### Bug Fixes

- check whether path exist before return result ([cb5d4ef](https://github.com/verdaccio/local-storage/commit/cb5d4ef))

<a name="1.1.0"></a>

# [1.1.0](https://github.com/verdaccio/local-storage/compare/v1.0.3...v1.1.0) (2018-06-08)

### Bug Fixes

- **deps:** update dependency async to v2.6.1 ([487b095](https://github.com/verdaccio/local-storage/commit/487b095))

### Features

- implement search ([f884a24](https://github.com/verdaccio/local-storage/commit/f884a24))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/verdaccio/local-storage/compare/v0.1.4...v0.2.0) (2018-01-17)

### Features

- update minor dependencies ([92daa81](https://github.com/verdaccio/local-storage/commit/92daa81))

<a name="0.1.4"></a>

## [0.1.4](https://github.com/verdaccio/local-storage/compare/v0.1.3...v0.1.4) (2018-01-17)

### Bug Fixes

- remove temp file whether is emtpy and fails ([593e162](https://github.com/verdaccio/local-storage/commit/593e162))
- unit test ([2573f30](https://github.com/verdaccio/local-storage/commit/2573f30))
