# splashify

[![npm version](https://badge.fury.io/js/splashify.svg)](https://badge.fury.io/js/splashify)

A CLI for generating launch screens for any device.

![hero](https://repository-images.githubusercontent.com/763116014/b9130dc4-a8ff-4cf8-b7f2-b268b7e57ce6)

## Usage

Use the `generate` command to generate launch screens for any device.

```bash
npx splashify generate
```

By default the command will look for an `icon.svg` file in the current working directory. You can also specify a custom path to the icon file using the `-i` flag.

```bash
npx splashify generate -i path/to/icon.svg
```

You can also specify a custom output directory using the `-o` flag.

```bash
npx splashify generate -o path/to/output
```

Along with generated PNG files, the command will also generate a `splashscreens.html` file in the output directory. This file contains `<link>` tags for each generated splash screen image, that you can copy and paste into your HTML file.

For more information on the available options, use the `--help` flag.

```bash
npx splashify generate --help
```

## License

Licensed under the [MIT license](https://github.com/valentinpolitov/splashify/blob/main/LICENSE.md).
