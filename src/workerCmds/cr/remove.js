'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    let id = await GetOptValue(opt, 'id')
    if(+id >= 0) id = +id
    if(id){
      msg2send.content = 'ID **'+id+'** is not for a custom reaction on this server'
      const lCR = (await mongo.find('reactions', {_id: obj.guild_id}))[0]
      if(lCR && lCR.cr && lCR.cr.filter(x=>x.id == id)){
        await mongo.pull('reactions', {_id: obj.guild_id}, {cr:{id: id}})
        msg2send.content = 'Custom reaction with ID **'+id+'** and trigger **'+lCR.cr.find(x=>x.id == id).trigger+'** has been deleted for this server'
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
