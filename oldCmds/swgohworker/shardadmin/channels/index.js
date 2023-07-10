'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: "Changing the channels requires shard admin"}, payload
    const auth = await HP.CheckShardAdmin(obj, shard)
    if(auth){
      if(opt){
        msg2send.content = ''
        if(opt.find(x=>x.name == 'payouts')){
          const payChannel = await MSG.GetChannel(opt.find(x=>x.name == 'payouts').value)
          if(payChannel && payChannel.parent_id == shard.catId){
            const payStatus = await HP.CreateIntialMessage({chId: payChannel.id, sId: shard.sId})
            if(payStatus && payStatus.id){
              if(!payload) payload = {}
              payload.payChannel = payChannel.id
              payload.payMsgs = [payStatus.id]
              msg2send.content += '<#'+payChannel.id+'> was set as payouts channel\n'
            }else{
              msg2send.content += 'Error setting <#'+payChannel.id+'> as payouts channel\n'
            }
          }else{
            msg2send.content += '<#'+payChannel.id+'> is not in the same category as the shard'
          }
        }
        if(opt.find(x=>x.name == 'ranks')){
          const rankChannel = await MSG.GetChannel(opt.find(x=>x.name == 'ranks').value)
          if(rankChannel && rankChannel.parent_id == shard.catId){
            const rankStatus = await HP.CreateIntialMessage({chId: rankChannel.id, sId: shard.sId})
            if(rankStatus && rankStatus.id){
              if(!payload) payload = {}
              payload.rankChannel = rankChannel.id
              payload.rankMsgs = [rankStatus.id]
              msg2send.content += '<#'+rankChannel.id+'> was set as rank channel\n'
            }else{
              msg2send.content += 'Error setting <#'+rankChannel.id+'> as rank channel\n'
            }
          }else{
            msg2send.content += '<#'+rankChannel.id+'> is not in the same category as the shard'
          }
        }
        if(opt.find(x=>x.name == 'logs')){
          const logChannel = await MSG.GetChannel(opt.find(x=>x.name == 'logs').value)
          if(logChannel && logChannel.parent_id == shard.catId){
            if(!payload) payload = {}
            payload.logChannel = logChannel.id
            msg2send.content += '<#'+logChannel.id+'> was set as log channel\n'
          }else{
            msg2send.content += '<#'+logChannel.id+'> is not in the same category as the shard'
          }
        }
        if(opt.find(x=>x.name == 'alt-log')){
          const altChannel = await MSG.GetChannel(opt.find(x=>x.name == 'alt-log').value)
          if(altChannel && altChannel.parent_id == shard.catId){
            if(!payload) payload = {}
            payload.altChannel = altChannel.id
            msg2send.content += '<#'+altChannel.id+'> was set as alt log channel\n'
          }else{
            msg2send.content += '<#'+altChannel.id+'> is not in the same category as the shard'
          }
        }
        if(payload) await mongo.set('payoutServers', {_id: shard._id}, payload)
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
