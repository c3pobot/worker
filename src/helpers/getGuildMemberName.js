'use strict'
const { GetGuildMember } = require('./discordmsg')
module.exports = async(sId, dId)=>{
  let usrname
  let usr = await GetGuildMember(sId, dId)
  if(usr && usr.user){
    usrname = usr.user.username
    if(usr.nick) usrname = usr.nick
  }
  return usrname
}
