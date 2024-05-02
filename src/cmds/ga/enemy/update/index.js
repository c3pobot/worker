'use strict'
const Cmds = {}
Cmds.oauth = require('./oauth')
Cmds.manual = require('./manual')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let tempCmd = 'oauth'
  if(opt.allycodes?.value) tempCmd = 'manual'
  return await Cmds[tempCmd](obj, opt)
}
