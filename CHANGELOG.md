# splashify

## 0.4.0

### Minor Changes

- Migrated renderer from `node-canvas` to `sharp`
  💡 INSIGHTS:
  ✅ Sharp is 2.2x faster - significant performance improvement
  ✅ Sharp produces 2x smaller files - better compression

## 0.3.2

### Patch Changes

- Updated iOS devices list

## 0.3.1

### Patch Changes

- - Added new iOS devices
  - Updated dependencies
  - Format resource definitions with Prettier before saving
  - Consistency in export formats across resource definitions files

## 0.3.0

### Minor Changes

- [`7cc52ea`](https://github.com/valentinpolitov/splashify/commit/7cc52ea7788f912e5def77c1eaceac7a104cdebb) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - [Breaking Changes]
  Added: `--no-public`
  Removed: `-P` alias from `--public`
  Renamed:
  `--bg-color` -> `--background`
  `--no-file` -> `--no-def`
  `--file-name` -> `--def-file`
  `--file-outdir` -> `--def-outdir`

## 0.2.2

### Patch Changes

- [`5080cb7`](https://github.com/valentinpolitov/splashify/commit/5080cb718aa35b63cd12fe92f1a3af6b3c0853f6) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - fix: typo in widest reducer

- [`caf7fbb`](https://github.com/valentinpolitov/splashify/commit/caf7fbbb17b612987c60309823a2eb9e24d10e2f) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - feat: remote image

## 0.2.1

### Patch Changes

- [`d6c1bd4`](https://github.com/valentinpolitov/splashify/commit/d6c1bd46e341838abe523b6602dd6d7c764a8ebe) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - Scale SVG image to fit the widest device

## 0.2.0

### Minor Changes

- [`2d76659`](https://github.com/valentinpolitov/splashify/commit/2d7665907c1a13871d1a68792e3b064e1931bb00) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - chore: README.md, LICENSE.md, changeset

- [`b546c4c`](https://github.com/valentinpolitov/splashify/commit/b546c4c0a2c2d93f312832ce7d0d5c3c2604c10c) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - chore: added hero image to README.md

- [`e4022ed`](https://github.com/valentinpolitov/splashify/commit/e4022ed86dad275143cafeedfa01e9125fd7ecbd) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - feat: --no-file option

- [`4e6733c`](https://github.com/valentinpolitov/splashify/commit/4e6733cd1a1fc9419495ad02681b164b7cb193a5) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - New options: `--js`, `--clean`, `--portrait-only` and `--landscape-only`
  Renamed `--keep-stale` to `--keep`

## 0.1.2

### Patch Changes

- [`caf7fbb`](https://github.com/valentinpolitov/splashify/commit/caf7fbbb17b612987c60309823a2eb9e24d10e2f) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - feat: added options `--prefix`, `--include-orientation`, `--nofile`, `--file-name`, `--file-outdir` and -`-public`

## 0.1.1

### Patch Changes

- [`35192d0`](https://github.com/valentinpolitov/splashify/commit/35192d07d78cfe35e34c5963b819f766e0255945) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - feat: added html export option

## 0.1.0

### Minor Changes

- [`02c783b`](https://github.com/valentinpolitov/splashify/commit/02c783bf8aa1a71cc821fe97c8d149d42fff5ada) Thanks [@valentinpolitov](https://github.com/valentinpolitov)! - Initial commit
