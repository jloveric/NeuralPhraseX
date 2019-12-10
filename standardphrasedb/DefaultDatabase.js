const deepmerge = require('deepmerge')

let Standard = require('./Standard.js')
let Definitions = require('./Definitions.js')
let Where = require('./Where.js')
let What = require('./What.js')
let Swear = require('./Swear.js')
let WherePrep = require('./Where.js')

let result = deepmerge.all([Standard, Definitions, Where, What, Swear, WherePrep])

module.exports = result