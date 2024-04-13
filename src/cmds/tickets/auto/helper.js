'use strict'
const Cmds = {}
Cmds.Show = async(gObj, auto)=>{
  const embedMsg = {
    color: 15844367,
    title: gObj.profile.name+' Auto Raid Ticket check settings',
    footer: {
      text: "Data updated"
    }
  }
  if(auto){
    embedMsg.description = ''
    embedMsg.description += 'Status        : '+(auto.status >= 0 ? (auto.status ? 'enabled':'disabled'):'enabled')+'\n'
    embedMsg.description += 'Channel       : <#'+auto.chId+'>\n'
    embedMsg.description += 'Min Tickets   : '+(auto.ticketCount >= 0 ? auto.ticketCount: 600)+'\n'
    embedMsg.description += 'Send messages : '+(auto.skipMessageSending ? 'No':'Yes')+'\n'
  }
  return embedMsg
}
module.exports = Cmds
