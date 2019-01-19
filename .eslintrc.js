module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "commonjs": true,
        "mocha": true,
        "es6": true
    },
    "extends": ["eslint:recommended", "plugin:import/errors", "plugin:import/warnings"],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "impliedStrict": true
    },
    "rules": {
        "indent": ["warn", 4],
        "linebreak-style": ["warn", "unix"],
        "quotes": ["warn", "single"],
        "semi": ["warn", "never"]
    },
    "overrides": [
        {
            "files": ["*.spec.js", '**/test/**'],
            "rules": {
              "no-unused-expressions": "off",
              "no-console": "off"
            }
          }
    ]
}