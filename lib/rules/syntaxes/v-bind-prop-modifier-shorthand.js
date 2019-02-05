/**
 * @author Yosuke Ota
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  supported: '2.6.0',
  createTemplateBodyVisitor (context) {
    /**
     * Reports `.prop` shorthand node
     * @param {VDirectiveKey} bindPropKey node of `.prop` shorthand
     * @returns {void}
     */
    function reportPropModifierShorthand (bindPropKey) {
      context.report({
        node: bindPropKey,
        message: '`.prop` shorthand are forbidden.',
        // fix to use `:x.prop` (downgrade)
        fix: fixer => fixer.replaceText(bindPropKey, `:${bindPropKey.argument.rawName}.prop`)
      })
    }

    return {
      "VAttribute[directive=true] > VDirectiveKey[name.name='bind'][name.rawName='.']": reportPropModifierShorthand
    }
  }
}
