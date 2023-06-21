'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let sId, msg2send = {content: 'You did not provide the correct information'}, lCR = [], rCR = []
    if(opt.find(x=>x.name == 'serverid')) sId = opt.find(x=>x.name == 'serverid').value.trim()
    if(sId){
      msg2send.content = 'Server with ID **'+sId+'** has not been set up with the bot to use custom reactions'
      const shard = (await mongo.find('discordServer', {_id: sId, basicStatus: 1}))[0]
      if(shard){
        msg2send.content = 'You do not have Shard Admin rights with the bot on server with ID **'+sId+'**'
        const auth = await HP.CheckServerAdmin({guild_id: sId, member: obj.member})
        if(auth){
          msg2send.content = 'This server has no customReactions to copy'
          const localCr = (await mongo.find('reactions', {_id: obj.guild_id}))[0]
          const remoteCr = (await mongo.find('reactions', {_id: sId}))[0]
          if(localCr && localCr.cr && localCr.cr.length > 0) lCR = localCr.cr
          if(remoteCr && remoteCr.cr && remoteCr.cr.length > 0) rCR = remoteCr.cr
          if(lCR && lCR.length > 0){
            MSG.WebHookMsg(obj.token, {content: 'Copying Custom reactions please wait...'}, 'PATCH')
            let count = 0
            for(let i in lCR){
              if(rCR.filter(x=>x.trigger == lCR[i].trigger).length > 0){
                const id = await mongo.next('reactions', {_id: sId}, 'crIndex')
                if(id >= 0){
                  lCR[i].id = id
                  await mongo.push('reactions', {_id: sId}, {cr: lCR[i]})
                  count++
                }
              }
            }
            msg2send.content = 'Copied **'+count+'/'+lCR.length+'** custom reactions from this server to server with ID **'+sId+'**'
          }
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
