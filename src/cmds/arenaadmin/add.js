'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide the correct information'}
  let dId = getOptValue(opt, 'user')
  let maxAllyCodes = getOptValue(opt, 'num', 100)

  if(dId){
    msg2send.content = 'that user was already added'
    let exists = (await mongo.find('patreon', {_id: dId}))[0]
    if(!exists){
      let tempObj = {
        maxAllyCodes: maxAllyCodes,
        status: 1,
        shard: 1,
        users: [],
        guilds: []
      }
      await mongo.set('patreon', {_id: dId}, tempObj)
      msg2send.content = 'patreon added'
    }
  }
  return msg2send
}
