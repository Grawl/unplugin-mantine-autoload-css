import { readdirSync } from 'node:fs'

import { createVitePlugin, type UnpluginFactory } from 'unplugin'

const mantineCorePath = '@mantine/core'
const mantineCoreStylesPath = `${mantineCorePath}/styles`

type ComponentStylesheetName =
	| 'Accordion'
	| 'ActionIcon'
	| 'Affix'
	| 'Alert'
	| 'Anchor'
	| 'AngleSlider'
	| 'AppShell'
	| 'AspectRatio'
	| 'Avatar'
	| 'BackgroundImage'
	| 'Badge'
	| 'Blockquote'
	| 'Breadcrumbs'
	| 'Burger'
	| 'Button'
	| 'Card'
	| 'Center'
	| 'Checkbox'
	| 'CheckboxCard'
	| 'CheckboxIndicator'
	| 'Chip'
	| 'CloseButton'
	| 'Code'
	| 'ColorInput'
	| 'ColorPicker'
	| 'ColorSwatch'
	| 'Combobox'
	| 'Container'
	| 'Dialog'
	| 'Divider'
	| 'Drawer'
	| 'Fieldset'
	| 'Flex'
	| 'FloatingIndicator'
	| 'Grid'
	| 'Group'
	| 'Image'
	| 'Indicator'
	| 'InlineInput'
	| 'Input'
	| 'Kbd'
	| 'List'
	| 'Loader'
	| 'LoadingOverlay'
	| 'Mark'
	| 'Menu'
	| 'Modal'
	| 'ModalBase'
	| 'NavLink'
	| 'Notification'
	| 'NumberInput'
	| 'Overlay'
	| 'Pagination'
	| 'Paper'
	| 'PasswordInput'
	| 'Pill'
	| 'PillsInput'
	| 'PinInput'
	| 'Popover'
	| 'Progress'
	| 'Radio'
	| 'RadioCard'
	| 'RadioIndicator'
	| 'Rating'
	| 'RingProgress'
	| 'ScrollArea'
	| 'SegmentedControl'
	| 'SemiCircleProgress'
	| 'SimpleGrid'
	| 'Skeleton'
	| 'Slider'
	| 'Spoiler'
	| 'Stack'
	| 'Stepper'
	| 'Switch'
	| 'Table'
	| 'TableOfContents'
	| 'Tabs'
	| 'Text'
	| 'ThemeIcon'
	| 'Timeline'
	| 'Title'
	| 'Tooltip'
	| 'Tree'
	| 'TypographyStylesProvider'
	| 'UnstyledButton'
	| 'VisuallyHidden'

type GlobalStylesheetName = 'baseline' | 'default-css-variables' | 'global'

type StylesheetName = ComponentStylesheetName | GlobalStylesheetName

// https://mantine.dev/styles/css-files-list/#components-dependencies
// shared subcomponents dependencies are not detected by this module
// so we load them all
// all these files are ~30KB combined VS more than 200 KB of all Mantine styles combined
const shared: ComponentStylesheetName[] = [
	'ScrollArea',
	'UnstyledButton',
	'VisuallyHidden',
	'Paper',
	'Popover',
	'CloseButton',
	'Group',
	'Loader',
	'Overlay',
	'ModalBase',
	'Input',
	'InlineInput',
	'Flex',
	'FloatingIndicator',
	'ActionIcon',
]

const prependCode = (lines: string[], code: string) => [...lines, code].join('\n')

const mantineAutoloadCSSFactory: UnpluginFactory<
	| {
			all?: boolean
			layer?: boolean
			forced?: ComponentStylesheetName[]
			baseline?: boolean
			defaultCSSVariables?: boolean
			global?: boolean
	  }
	| undefined
> = ({
	all = false,
	layer = true,
	forced = [],
	baseline = true,
	defaultCSSVariables = true,
	global = true,
} = {}) => {
	const selectVariant = (name: 'styles' | StylesheetName): string =>
		[name, layer ? '.layer.css' : '.css'].join('')
	const cssFileNames = readdirSync(`node_modules/${mantineCoreStylesPath}`)
	return {
		name: 'unplugin-mantine-autoload-css',
		transformInclude: id => id.endsWith('.ts') || id.endsWith('.tsx'),
		transform: code => {
			if (all)
				return prependCode([`import '${mantineCorePath}/${selectVariant('styles')}'`], code)
			const match = /import\s*{([\n\s\w,]+)}\s*from\s*['"]@mantine\/core['"]/gm.exec(code)
			if (match === null) return code
			const [, group] = match
			if (group === undefined) return code
			const maybeComponents = group.split(',').map(string => {
				const [renamed] = string.split(' as ')
				if (renamed === undefined) return string.trim()
				return renamed.trim()
			})
			const stylesToAdd = cssFileNames
				.filter(
					fileName =>
						maybeComponents.find(maybeComponent =>
							fileName.startsWith(maybeComponent),
						) !== undefined,
				)
				.filter(fileName => {
					const isLayer = fileName.endsWith('.layer.css')
					return layer ? isLayer : !isLayer
				})
			if (stylesToAdd.length > 0) {
				const files = [
					baseline ? selectVariant('baseline') : null,
					global ? selectVariant('global') : null,
					defaultCSSVariables ? selectVariant('default-css-variables') : null,
					...forced.map(selectVariant),
					...shared.map(selectVariant),
					...stylesToAdd,
				]
					.filter(fileName => fileName !== null)
					.flat()
				return prependCode(
					files.map(fileName => `import '${mantineCoreStylesPath}/${fileName}'`),
					code,
				)
			}
			return code
		},
	}
}

export const mantineAutoloadCSS = createVitePlugin(mantineAutoloadCSSFactory)
