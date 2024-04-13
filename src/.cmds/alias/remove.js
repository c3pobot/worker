'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command requires bot server admin role'}, alias, confirmRemove, guild
    const auth = await HP.CheckServerAdmin(obj)
    if(obj.confirm && obj.confirm.response) confirmRemove = obj.confirm.response
    if(auth){
      msg2send.content = 'You did not provide the correct information'
      alias = HP.GetOptValue(opt, 'alias')
      if(alias) alias = alias.trim().toLowerCase()
    }
    if(alias){
      msg2send.content = '**'+alias+'** is not an alias for this server'
      guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
      if(guild && guild.unitAlias && guild.unitAlias.filter(x=>x.alias == alias).length > 0 && !confirmRemove){
        await HP.ConfirmButton(obj, 'Are your sure you want to remove alias **'+alias+'** for **'+guild.unitAlias.filter(x=>x.alias == alias)[0].nameKey+'**?')
      }
    }
    if(confirmRemove){
      msg2send.content = 'Command Canceled'
      msg2send.components = []
      if(confirmRemove == 'yes'){
        msg2send.content = '**'+alias+'** was removed as an alias for this server'
        await mongo.pull('discordServer', {_id: obj.guild_id}, {unitAlias: {alias: alias}})
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
