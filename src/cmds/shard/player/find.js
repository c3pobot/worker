'use strict'
module.exports = async(obj, shard, opt = {})=>{
  try{
    let guild, pObj, msg2send = {content: 'invalid allyCode provided'}
    let allyCode = await HP.GetOptValue(opt, 'allycode')
    if(allyCode){
      allyCode = allyCode.toString().replace(/-/g, '').trim()
      msg2send.content = 'Error finding player with allyCode **'+allyCode+'**'
      MSG.WebHookMsg(obj.token, {content: 'Pulling data for allyCode **'+allyCode+'**'}, 'PATCH')
      pObj = await Client.post('queryPlayer', {allyCode: allyCode}, null)
    }
    if(pObj && pObj.guildId){
      msg2send.content = 'Error getting guild'
      guild = await Client.post('queryGuildPlayers', {guildId: pObj.guildId})
    }
    if(guild && guild.length > 0){
      msg2send.content = pObj.guildName+' Members ('+guild.length+')\n```autohotkey\n'
      for(let i in guild) msg2send.content += guild[i].allyCode+' : '+guild[i].name+'\n'
      msg2send.content += '```'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
