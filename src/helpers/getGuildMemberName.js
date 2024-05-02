'use strict'
const { getGuildMember } = require('./discordmsg')
module.exports = async(sId, dId)=>{
  let usrname
  let usr = await getGuildMember(sId, dId)
  if(usr?.user) usrname = usr.nick || usr.user.username
  return usrname
}
