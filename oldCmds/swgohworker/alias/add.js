'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command requires bot server admin role'}, unit, uInfo, alias
    const auth = await HP.CheckServerAdmin(obj)
    if(auth){
      msg2send.content = 'You did not provide the correct information'
      alias = HP.GetOptValue(opt, 'alias')
      if(alias) alias = alias.trim().toLowerCase()
    }
    if(alias){
      msg2send.content = 'alias **'+alias+'** is already being used'
      const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
      if((guild && (!guild.unitAlias || guild.unitAlias.filter(x=>x.alias == alias).length == 0)) || !guild){
        unit = HP.GetOptValue(opt, 'unit')
        if(unit) unit = unit.toString().trim()
      }
      if(guild && guild.unitAlias && guild.unitAlias.filter(x=>x.alias == alias).length > 0) msg2send.content += ' for **'+guild.unitAlias.filter(x=>x.alias == alias)[0].nameKey+'**'
    }
    if(unit){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Setting alias for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Set **'+alias+'** as an alias for **'+uInfo.nameKey+'**'
      await mongo.push('discordServer', {_id: obj.guild_id}, {unitAlias: {alias: alias, baseId: uInfo.baseId, nameKey: uInfo.nameKey}})
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
