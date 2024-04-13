'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let patreon, msg2send = {content: 'You did not provide the correct information'}
  let usr = getOptValue(opt, 'user')
  if(usr){
    msg2send.content = 'Could not find that patreon'
    patreon = (await mongo.find('patreon', {_id: opt.find(x=>x.name == 'user').value}))[0]
  }
  if(patreon){
    msg2send.content = 'patreon removed'
    await mongo.del('patreon', {_id: patreon._id})
  }
  return msg2send
}
