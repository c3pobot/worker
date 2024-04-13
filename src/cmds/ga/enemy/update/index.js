'use strict'
const Cmds = {}
Cmds.oauth = require('./oauth')
Cmds.manual = require('./manual')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let allyCodes = getOptValue(opt, 'allycodes')
  let tempCmd = 'oauth'
  if(allyCodes) tempCmd = 'manual'
  return await Cmds[tempCmd](obj, opt)
}
