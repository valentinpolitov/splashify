# splashify

[![npm version](https://badge.fury.io/js/splashify.svg)](https://badge.fury.io/js/splashify)

Splashify is a powerful CLI tool designed to simplify the creation of launch screens for any device, ensuring your application makes a great first impression.

![hero](https://repository-images.githubusercontent.com/763116014/b9130dc4-a8ff-4cf8-b7f2-b268b7e57ce6)

## Getting Started

### Quick Start

You don't need to install Splashify if you're using `npx`, you can simply run:

```bash
npx splashify@latest generate
```

### Basic Usage

Generate launch screens using the default settings with an `icon.svg` in your current directory:

```bash
npx splashify generate
```

To use a custom icon, specify its path or URL with the `--input` flag:

```bash
npx splashify generate --input path/to/icon.svg
```

### Advanced Usage

#### Command Structure

```bash
splashify generate|gen [devices...] [options]
```

#### Arguments

devices: Specify devices by screen dimensions and density. Use the format **`{width}`x`{height}`@`{dpi}`**. If omitted, default devices are targeted:

| Width x Height @ DPI | Device                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `430x932@3`          | iPhone 15 Pro Max, iPhone 15 Plus, iPhone 14 Pro Max                      |
| `393x852@3`          | iPhone 15 Pro, iPhone 15, iPhone 14 Pro                                   |
| `428x926@3`          | iPhone 14 Plus, iPhone 13 Pro Max, iPhone 12 Pro Max                      |
| `390x844@3`          | iPhone 14, iPhone 13 Pro, iPhone 13, iPhone 12 Pro, iPhone 12             |
| `360x780@3`          | iPhone 13 Mini, iPhone 12 Mini                                            |
| `414x896@3`          | iPhone 11 Pro Max, iPhone XS Max                                          |
| `375x812@3`          | iPhone 11 Pro, iPhone XS, iPhone X                                        |
| `414x896@2`          | iPhone 11, iPhone XR                                                      |
| `414x736@3`          | iPhone 8 Plus, iPhone 7 Plus, iPhone 6s Plus                              |
| `375x667@2`          | iPhone SE, iPhone 8, iPhone 7, iPhone 6s, iPhone 6                        |
| `320x568@2`          | iPhone SE 4, iPhone 5s, iPhone 5c, iPhone 5, iPod Touch 5th Gen and later |
| `1024x1366@2`        | iPad Pro 12.9", iPad Air 9.7", iPad Mini 7.9"                             |
| `834x1194@2`         | iPad Pro 11"                                                              |
| `820x1180@2`         | iPad Air 10.9"                                                            |
| `834x1112@2`         | iPad Air 10.5", iPad Pro 10.5"                                            |
| `810x1080@2`         | iPad 10.2"                                                                |
| `768x1024@2`         | iPad Mini 7.9", iPad Pro 9.7"                                             |
| `744x1133@2`         | iPad Mini 8.3"                                                            |

## Customization Options

## Background Color

Set a custom background color for your splash screen (default is transparent):

```bash
npx splashify generate --background "#5ca19d"
```

## Image Scaling

Adjust the icon size relative to the device width (default is `0.75`):

```bash
npx splashify generate --scale 0.5
```

## Output Configuration

Generated files are placed in `.splashify/images` by default. Use the `--outdir` flag to define a custom output directory:

```bash
npx splashify generate --outdir path/to/output
```

Splashify also creates a `resources.html` in the `.splashify` directory, containing `<link>` tags for the splash screens. You can easily integrate these into your project.

Resources file name and output directory can be customized using the `--def-file` and `--def-outdir` flags.

### Output Formats

Splashify supports multiple output formats for further integration:

- `--html`: Generate an HTML file with `<link>` tags.
- `--json`: Output a JSON file with resource definitions.
- `--ts`: Create a TypeScript file.
- `--js`: Generate a JavaScript file.
- `--esm`: Produce an ES Module file.
- `--cjs`: Output a CommonJS file.
- `--no-def`: Disable definition files generation.

Combine these flags as needed to suit your project requirements.

## Help and Support

For a complete list of commands and options:

```bash
npx splashify generate --help
```

## License

Licensed under the [MIT license](https://github.com/valentinpolitov/splashify/blob/main/LICENSE.md).
