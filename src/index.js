#!/usr/bin/env node
import multiline from 'packagesmith.formats.multiline';
import { runProvisionerSet } from 'packagesmith';
import ignores from './ignores.json';
export function provisionGitignore({ gitIgnoreTemplates = null, additionalLines = [], gitIgnoreOptions } = {}) {
  const templatesQuestion = {
    type: 'checkbox',
    name: 'gitIgnoreTemplates',
    message: 'Which templates would you like to add to your .gitignore?',
    choices: Object.keys(ignores).map((name) => ({ name, value: name })),
    when(answers) {
      if ('gitIgnoreTemplates' in answers) {
        return false;
      }
      return true;
    },
  };
  return {
    '.gitignore': {
      questions: gitIgnoreTemplates && gitIgnoreTemplates.length ? [] : [ templatesQuestion ],
      contents: multiline((gitIgnore, answers) => [
        ...(gitIgnoreTemplates || (answers.gitIgnoreTemplates || []).sort())
          .reduce((total, name) => total.concat(ignores[name]), []),
        ...additionalLines,
      ], gitIgnoreOptions),
    },
  };
}
export default provisionGitignore;

if (require.main === module) {
  runProvisionerSet(process.argv[2] || '.', provisionGitignore());
}
