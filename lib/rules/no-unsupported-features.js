/**
 * @author Yosuke Ota
 * See LICENSE file in root directory for full license.
 */
'use strict'

const { Range } = require('semver')
const utils = require('../utils')

const FEATURES = {
  'dynamic-directive-arguments': require('./syntaxes/dynamic-directive-arguments'),
  'slot-scope-attribute': require('./syntaxes/slot-scope-attribute'),
  'v-slot': require('./syntaxes/v-slot'),
  'v-bind-prop-modifier-shorthand': require('./syntaxes/v-bind-prop-modifier-shorthand')
}

const cache = new Map()
/**
 * Get the `semver.Range` object of a given range text.
 * @param {string} x The text expression for a semver range.
 * @returns {Range|null} The range object of a given range text.
 * It's null if the `x` is not a valid range text.
 */
function getSemverRange (x) {
  const s = String(x)
  let ret = cache.get(s) || null

  if (!ret) {
    try {
      ret = new Range(s)
    } catch (_error) {
      // Ignore parsing error.
    }
    cache.set(s, ret)
  }

  return ret
}

/**
 * Merge two visitors.
 * @param {Visitor} x The visitor which is assigned.
 * @param {Visitor} y The visitor which is assigning.
 * @returns {Visitor} `x`.
 */
function merge (x, y) {
  for (const key of Object.keys(y)) {
    if (typeof x[key] === 'function') {
      if (x[key]._handlers == null) {
        const fs = [x[key], y[key]]
        x[key] = node => fs.forEach(h => h(node))
        x[key]._handlers = fs
      } else {
        x[key]._handlers.push(y[key])
      }
    } else {
      x[key] = y[key]
    }
  }
  return x
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow unsupported Vue.js syntax on the specified version',
      category: undefined,
      url: 'https://eslint.vuejs.org/rules/no-unsupported-features.html'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          version: {
            type: 'string'
          },
          ignores: {
            type: 'array',
            items: {
              enum: Object.keys(FEATURES)
            },
            uniqueItems: true
          }
        },
        additionalProperties: false
      }
    ]
  },
  create (context) {
    const { version, ignores } = Object.assign(
      {
        version: null,
        ignores: []
      },
      context.options[0] || {}
    )
    if (!version) {
      // version is not set.
      return {}
    }
    const versionRange = getSemverRange(version)

    /**
     * Check whether a given case object is full-supported on the configured node version.
     * @param {{supported:string}} aCase The case object to check.
     * @returns {boolean} `true` if it's supporting.
     */
    function isNotSupportingVersion (aCase) {
      return versionRange.intersects(getSemverRange(`<${aCase.supported}`))
    }
    const templateBodyVisitor = Object.keys(FEATURES)
      .filter(syntaxName => !ignores.includes(syntaxName))
      .filter(syntaxName => isNotSupportingVersion(FEATURES[syntaxName]))
      .reduce((result, syntaxName) => {
        const visitor = FEATURES[syntaxName].createTemplateBodyVisitor(context)
        if (visitor) {
          merge(result, visitor)
        }
        return result
      }, {})

    return utils.defineTemplateBodyVisitor(context, templateBodyVisitor)
  }
}
