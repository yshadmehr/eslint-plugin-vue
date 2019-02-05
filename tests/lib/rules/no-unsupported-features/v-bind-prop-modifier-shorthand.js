/**
 * @author Yosuke Ota
 * See LICENSE file in root directory for full license.
 */
'use strict'

const RuleTester = require('eslint').RuleTester
const rule = require('../../../../lib/rules/no-unsupported-features')
const utils = require('./utils')

const buildOptions = utils.optionsBuilder('v-bind-prop-modifier-shorthand', '~2.5.0')
const tester = new RuleTester({
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2019
  }
})

tester.run('no-unsupported-features', rule, {
  valid: [
    {
      code: `
      <template>
        <a .href="/xxx" />
      </template>`,
      options: buildOptions({ version: '^2.6.0' })
    },
    {
      code: `
      <template>
        <a :href.prop="/xxx" />
      </template>`,
      options: buildOptions()
    }
  ],
  invalid: [
    {
      code: `
      <template>
        <a .href="/xxx" />
      </template>`,
      options: buildOptions(),
      output: `
      <template>
        <a :href.prop="/xxx" />
      </template>`,
      errors: [
        {
          message: '`.prop` shorthand are forbidden.',
          line: 3
        }
      ]
    }
  ]
})

