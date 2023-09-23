'use strict'
const { GetOptValue, ReplyMsg } = require('helpers')
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    let dId = GetOptValue(opt, 'user')
    let maxAllyCodes = GetOptValue(opt, 'num', 100)
    if(dId){
      msg2send.content = 'that user was already added'
      let exists = (await mongo.find('patreon', {_id: dId}))[0]
      if(!exists){
        const tempObj = {
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
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
