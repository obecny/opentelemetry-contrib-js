// Note the `file-header` TS lint rule implicitly adds comments around this, and
// makes the first comment line begin with /*!
// See:
// https://github.com/palantir/tslint/blob/b2972495e05710fa55600c233bf46a8a5c02e3cd/src/rules/fileHeaderRule.ts#L224

const rules = {
  'naming-convention': [true,
    { 'type': 'property', 'modifiers': 'protected', 'leadingUnderscore': 'require' },
    { 'type': 'member', 'modifiers': 'private', 'leadingUnderscore': 'require' },
    { 'type': 'enumMember', 'format': 'UPPER_CASE' },
  ]
};

module.exports = {
  rules,
};
