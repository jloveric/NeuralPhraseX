const deepmerge = require('deepmerge')

let Standard = require('./Standard.js')
let Definitions = require('./Definitions.js')
let Where = require('./Where.js')
let What = require('./What.js')
let WherePrep = require('./Where.js')

let result = deepmerge.all([Standard, Definitions, Where, What, WherePrep])

module.exports = result