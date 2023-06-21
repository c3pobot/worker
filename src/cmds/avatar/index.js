'use strict'
module.exports = async(obj = {})=>{
  try{
    let avatarURL, msgName, footerText, msg2Send = {content: 'Error getting avatar'}, username = (obj.member.nick ? obj.member.nick:obj.member.user.username)
    let sId = await HP.GetOptValue(obj.data?.options, 'server')
    if(sId?.toString()?.toLowerCase() === 'this') sId = obj.guild_id
    let dId = await HP.GetOptValue(obj.data?.options, 'user')
    if(dId){
      if(obj.data?.resolved?.users && obj.data?.resolved?.users[dId]){
        username = (obj.data.resolved.members[dId] && obj.data.resolved.members[dId].nick ? obj.data.resolved.members[dId].nick:obj.data.resolved.users[dId].username)
      }
    }else{
      if(!sId) dId = obj.member?.user?.id
    }
    if(sId){
      const guild = await BotSocket.send('getAvatar', {sId: sId} )
      if(guild && guild.iconURL){
        avatarURL = guild.iconURL
        msgName = guild.name
        footerText = sId
      }
    }else{
      avatarURL = await BotSocket.call('getAvatar', {dId: dId, sId: obj.guild_id})
      msgName = '@'+username
      footerText = dId
    }
    if(avatarURL){
      const embedMsg = {
        author: {
          name: msgName,
          icon_url: avatarURL
        },
        color: 15844367,
        image: {
          url: avatarURL
        },
        footer: {
          text: 'ID: '+footerText
        },
        timestamp: new Date()
      }
      msg2Send.content = null
      msg2Send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2Send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
