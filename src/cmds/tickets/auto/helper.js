'use strict'
const Cmds = {}
Cmds.show = (gObj = {}, auto = {})=>{
  let embedMsg = {
    color: 15844367,
    title: gObj.profile.name+' Auto Raid Ticket check settings',
    footer: {
      text: "Data updated"
    }
  }
  if(auto){
    embedMsg.description = ''
    embedMsg.description += 'Status        : '+(auto.status ? 'enabled':'disabled')+'\n'
    embedMsg.description += 'Channel       : <#'+auto.chId+'>\n'
    embedMsg.description += 'Min Tickets   : '+(auto.ticketCount >= 0 ? auto.ticketCount: 600)+'\n'
    embedMsg.description += 'Send messages : '+(auto.skipMessageSending ? 'No':'Yes')+'\n'
  }
  return embedMsg
}
module.exports = Cmds
