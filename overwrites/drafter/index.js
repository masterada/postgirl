try {
  var protagonist = require('protagonist')

  module.exports = {
    parse: protagonist.parse,
    parseSync: protagonist.parseSync,

    validate: protagonist.validate,
    validateSync: protagonist.validateSync
  }
} catch (error) {
  var drafterjs = require('drafter.js')

  module.exports = {
    parse: drafterjs.parse,
    parseSync: drafterjs.parseSync,

    validate: drafterjs.validate,
    validateSync: drafterjs.validateSync
  }
}

const parse = module.exports.parse

let onParsed

module.exports.parse = function (input, options, cb) {
  parse(input, options, function (err, res) {
    if (onParsed) {
      onParsed(err, res)
    }
    if (cb) {
      cb(err, res)
    }
  })
}

module.exports.onParsed = function (cb) {
  onParsed = cb
}
