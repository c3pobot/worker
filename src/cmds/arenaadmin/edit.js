'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let patreon, msg2send = {content: 'You did not provide the correct information'}
  let usr = getOptValue(opt, 'user')
  let maxAllyCodes = getOptValue(opt, 'num')
  let usrStatus = getOptValue(opt, 'status')
  if(usr){
    msg2send.content = 'Could not find that patreon'
    patreon = (await mongo.find('patreon', {_id: opt.find(x=>x.name == 'user').value}))[0]
  }
  if(patreon){
    if(maxAllyCodes >= 0) mongo.set('patreon', {_id: patreon._id}, {maxAllyCodes: maxAllyCodes})
    if(userStatus >= 0) mongo.set('patreon', {_id: patreon._id}, {status: userStatus})
  }
  return msg2send
}
