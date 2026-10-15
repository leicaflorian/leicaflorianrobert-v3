// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // generated or third-party code
    ignores: ['design/**', 'directus/extensions/*/dist/**', 'directus/uploads/**'],
  },
  {
    rules: {
      // the code writes `{mode}`, not `{ mode }`, in scripts and templates
      '@stylistic/object-curly-spacing': ['error', 'never'],
      'vue/object-curly-spacing': ['error', 'never'],
      // templates keep short elements on one line and write `<Foo/>`
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-spacing': ['warn', {selfClosingTag: 'never'}],
      // v-html is used only with highlight(), which escapes, and with the bundled SVG icons
      'vue/no-v-html': 'off',
    },
  },
)
