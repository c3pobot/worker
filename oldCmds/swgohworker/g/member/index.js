'use strict'
const GetGuild = require('./getGuild')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discord'}, unit, uInfo, guildId, gObj, gLevel = 0, rLevel = 0, dId = obj.member.user.id, allyCode
    if(opt.find(x=>x.name == 'user')){
      dId = opt.find(x=>x.name == 'user').value
      msg2send.content = 'That user does not have allyCode linked to discord'
    }
    if(opt.find(x=>x.name == 'allycode')){
      allyCode = +opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')
      dId = null,
      msg2send.content = '**'+allyCode+'** is not a valid allyCode'
    }
    const pObj = await HP.GetGuildId({dId: dId}, {allyCode: allyCode}, opt)
    if(pObj?.guildId){
      msg2send.content = 'Error getting guild Info'
      gObj = await GetGuild(pObj.guildId)
    }
    if(gObj?.member){
      const memberSorted = sorter([{column: 'name', order: 'ascending'}], gObj.member)
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        title: gObj.name+' Members ('+gObj.member.length+')',
        description: '```autohotkey\n',
        footer:{
          text: "Data updated"
        }
      }
      for(let i in memberSorted){
        const dObj = (await mongo.find('discordId', {'allyCodes.allyCode': +memberSorted[i].allyCode}, {allyCodes: {allyCode: 1}}))[0]
        embedMsg.description += memberSorted[i].allyCode+' : '+(dObj ? 1:0)+' : '+memberSorted[i].name+'\n'
      }
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
