# Unplugin Mantine Autoload CSS

[![NPM Version](https://img.shields.io/npm/v/unplugin-mantine-autoload-css)](https://www.npmjs.com/package/unplugin-mantine-autoload-css)

[Mantine](https://mantine.dev) [Unplugin](https://unplugin.unjs.io/) to autoload CSS for used components

## Usage

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { mantineAutoloadCSS } from 'unplugin-mantine-autoload-css'
export default defineConfig({
	plugins: [
		mantineAutoloadCSS(),
	]
})
```

### Behavior options:

#### `all`: `Boolean` / Default: `false`

> Instead of component detecting, load `@mantine/core/styles.css` for each file with import from `@mantine/core`

Hint: If you want to use this plugin only for build optimization, you can use it conditionally:

```ts
export default defineConfig(({ mode }) => ({
	plugins: [
		mantineAutoloadCSS({
			all: mode === 'development',
		}),
	],
}))
```

#### `layer`: `Boolean` / Default: `true`

> Switch between `.css` and `.layer.css` files

[Mantine: CSS Layers](https://mantine.dev/styles/mantine-styles/#css-layers)

#### `forced`: `ComponentStylesheetName[]` / Default: `[]`

> Add some components' CSS for each file with import from `@mantine/core`

### [Global styles](https://arc.net/l/quote/caciuwbj) toggles:

#### `baseline`: `Boolean` / Default: `true`

> Load `baseline.css` / `baseline.layer.css` — a minimal CSS reset, sets box-sizing: border-box and changes font properties

#### `defaultCSSVariables`: `Boolean` / Default: `true`

> Load `default-css-variables.css` / `default-css-variables.layer.css` — contains all CSS variables generated from the default theme

#### `global`: `Boolean` / Default: `true`

> Load `global.css` / `global.layer.css` — global classes used in Mantine components

#### `allDependencies`: `Boolean` / Default: `true`

> Some components like Select do not have any styles on their own – they are built on top of other components. So we cannot automate that without lurking Mantine sources. If you are not sure which components are used in a particular component, you can import all styles for components that are reused in other components. https://mantine.dev/styles/css-files-list/#components-dependencies

## Problem

In Mantine, you have to manually import CSS for components you use.

Reason: there is two versions of CSS for each component: `.css` and `.layer.css`, so you have to decide what to use. Official answer is [“Mantine is not a building tool”](https://github.com/orgs/mantinedev/discussions/6894#discussioncomment-12089815), so I decided to fill this gap.

You can just import all Mantine CSS containing every CSS for every Mantine component:

```ts
import '@mantine/core/styles.css'
```

but you will import CSS for components you don't use in your project.

`styles.css` is 226KB

## Solution

Vite plugin looking for imports from `@mantine/core` for each your source `.ts` or `.tsx` file, adding CSS imports based on hypothesis that every component has CSS named after it.

Example: if you add this to `MyComponent.tsx`:

```ts
import { Accordion } from '@mantine/core'
```

So we want to add this to `MyComponent.tsx`:

```ts
import '@mantine/core/styles/Accordion.css'
```

In `@mantine/core/styles` directory, we have all CSS files we want:

```
Accordion.css
Accordion.layer.css
ActionIcon.css
ActionIcon.layer.css
… and so on
```

So I automated this.

(Don't worry about import duplication: any bundler will deduplicate them across bundle)
