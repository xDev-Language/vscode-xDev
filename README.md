# xDev for VS Code Extension

Minimal VS Code extension providing xDev language support with xBase compatible syntax: syntax highlighting, function hints, basic language configuration, and snippets.

## Features

- Syntax highlighting for `.prg` and `.ch` files with support for:
  - Functions, procedures, and classes
  - Commands and statements
  - Operators and directives
  - Comments, strings, and numbers
- Function hints for the xDev runtime library and for functions declared in open `.prg` files:
  - Completion list with signatures
  - Parameter hints while typing arguments
  - Hover with signature and description
- Smart code snippets for common constructs
- Language configuration with auto-closing pairs and bracket matching

## Install from Marketplace

Install [xDev](https://marketplace.visualstudio.com/items?itemName=xDev-Language.vscode-xdev) from the Visual Studio Marketplace, or search for `xDev-Language.vscode-xdev` in the VS Code Extensions view.

## Install from VSIX

First build the package:

```bash
vsce package
```

Then install:

- VSCode: Extensions -> `...` -> Install from VSIX -> select `vscode-xdev-0.0.0.vsix`.

Or from terminal (in the repo folder):

```bash
code --install-extension ./vscode-xdev-0.0.0.vsix
```

## Update

- Open the Command Palette (Ctrl+Shift+P).
- Type `Extensions: Install from VSIX...`
- Select `vscode-xdev-0.0.0.vsix`.

