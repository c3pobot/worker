'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}, id
    if(opt.find(x=>x.name == 'id')) id = opt.find(x=>x.name == 'id').value
    if(id){
      msg2send.content = 'Error finding payout server **'+id+'**'
      const shard = (await mongo.find('payoutServers', {_id: id}))[0]
      if(shard){
        let usr
        const playerCount = await mongo.count('shardPlayers', {shardId: shard._id}, {allyCode: 1})
        if(shard.patreonId) usr = await MSG.GetUser(shard.patreonId)
        const guild = await MSG.GetGuild(shard.sId)
        const embedMsg = {
          title: (guild && guild.name ? guild.name+' ':'')+'Payout Server info',
          color: 15844367,
          fields: []
        }
        const basicField = {
          name: 'Basic Info',
          value: '```\n'
        }
        basicField.value += 'ID        : '+shard._id+'\n'
        basicField.value += 'sId       : '+shard.sId+'\n'
        basicField.value += 'Players   : '+(playerCount || 0)+'\n'
        basicField.value += 'Shard Num : '+shard.shard+'\n'
        if(shard.patreonId) basicField.value += 'Patreon   : @'+(usr ? usr.username:'UNKNOWN')+'\n'
        basicField.value += 'Order     : '+shard.poSort+'\n'
        basicField.value += 'Sort      : '+shard.sort+'\n'
        basicField.value += 'Type      : '+(shard.type == 'char' ? 'Squad':'Fleet')+'\n'
        basicField.value += '```'
        embedMsg.fields.push(basicField)
        if(shard.admin && shard.admin.length > 0){
          const roles = await MSG.GetRoles(shard.sId)
          const adminObj = {
            name: 'Payout Admin Roles',
            value: '```\n'
          }
          for(let i in shard.admin){
            if(roles && roles.find(x=>x.id == shard.admin[i].id)) adminObj.value += roles.find(x=>x.id == shard.admin[i].id).name+'\n'
          }
          adminObj.value += '```'
          embedMsg.fields.push(adminObj)
        }
        const chObj = {
          name: 'Channels',
          value: ''
        }
        if(shard.payChannel) chObj.value += '`Payouts  :` <#'+shard.payChannel+'>\n'
        if(shard.rankChannel) chObj.value += '`Ranks    :` <#'+shard.rankChannel+'>\n'
        if(shard.logChannel) chObj.value += '`Main Log :` <#'+shard.logChannel+'>\n'
        if(shard.altChannel) chObj.value += '`Alt Log  :` <#'+shard.altChannel+'>\n'
        if(chObj.value != '') embedMsg.fields.push(chObj)
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
