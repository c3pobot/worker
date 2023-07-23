'use strict'
const log = require('logger')
const { BotRequest, EnumPerms, GetOptValue, ReplyError, ReplyMsg } = require('helpers')

//const { Permissions } = require('discord.js');

const getDate = (timestamp)=>{
  let dateOptions = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}
  let dateTime = new Date(+timestamp)
  return dateTime.toLocaleDateString('en-US', dateOptions)+' '+dateTime.toLocaleTimeString('en-US')
}
module.exports = async(obj = {})=>{
  try{
    let msg2Send = {content: 'Error getting user info'}, username = (obj.member.nick ? obj.member.nick:obj.member.user.username), perm = +obj.member.permissions
    let dId = GetOptValue(obj.data?.options, 'user', obj.member.user.id)
    if(dId){
      if(obj.data?.resolved?.members[dId] && obj.data?.resolved?.users[dId]){
        perm = +obj.data.resolved.members[dId].permissions
        username = (obj.data.resolved.members[dId].nick ? obj.data.resolved.members[dId].nick:obj.data.resolved.users[dId].username)
      }
    }
    const tempObj = {
      dId: dId,
      sId: obj.guild_id
    }
    const usr = await BotRequest('getGuildMember', tempObj)
    if(usr && usr.user){
      const embedMsg = {
        color: 15844367,
        author:{
          name: usr.user.tag,
          icon_url: usr.user.avatarURL
        },
        thumbnail:{
          url: usr.user.avatarURL
        },
        footer:{
          text: 'ID: '+dId
        },
        fields:[],
        timestamp: (new Date())
      }

      embedMsg.fields.push({
        name: 'Joined',
        value: getDate(usr.joinedTimestamp),
        inline: true
      })
      embedMsg.fields.push({
        name: 'Registered',
        //value: moment(+usr.user.createdTimestamp).utcOffset(-300).format('ddd, MMM D, YYYY H:mm'),
        value: getDate(usr.user.createdTimestamp),
        inline: true
      })
      const roles = usr.roles.filter(x=>x.name != '@everyone')
      if(roles.length > 0){
        const roleField = {
          name: 'Roles ('+roles.length+')',
          value: ''
        }
        for(let i in roles) roleField.value += '<@&'+roles[i].id+'> '
        embedMsg.fields.push(roleField)
      }
      if(usr.perms.length > 0){
        const tempObj = {
          name: 'Key Permissions'
        }
        for(let i in usr.perms){
          if(EnumPerms[usr.perms[i]]){
            if(!tempObj.value){
              tempObj.value = EnumPerms[usr.perms[i]]
            }else{
              tempObj.value += ', '+EnumPerms[usr.perms[i]]
            }
          }
        }
        if(tempObj?.value) embedMsg.fields.push(tempObj)
      }
      if(usr.perms.filter(x=>x == 'Administrator').length > 0 || (usr.guildOwnerID && usr.guildOwnerID == usr.user.id)){
        const tempObj = {
          name: 'Acknowledgements'
        }
        if(usr?.guildOwnerID == usr.user.id){
          tempObj.value = 'Server Owner'
        }else{
          tempObj.value = 'Server Admin'
        }
        embedMsg.fields.push(tempObj)
      }
      msg2Send.content = null,
      msg2Send.embeds = [embedMsg]
    }
    ReplyMsg(obj, msg2Send)
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
