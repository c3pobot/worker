'use strict'
module.exports = async(obj, opt)=>{
  try{
    let dId, maxAllyCodes = 100, msg2send = {content: 'You did not provide the correct information'}
    if(opt){
      if(opt.find(x=>x.name == 'user')) dId = opt.find(x=>x.name == 'user').value
      if(opt.find(x=>x.name == 'num')) maxAllyCodes = opt.find(x=>x.name == 'num').value
    }
    if(dId){
      msg2send.content = 'that user was already added'
      const exists = (await mongo.find('patreon', {_id: dId}))[0]
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
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
