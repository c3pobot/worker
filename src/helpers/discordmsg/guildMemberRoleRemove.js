'use strict'
const ReportError = require('./reportError')
module.exports = async(sId, dId, roleId)=>{
  try{
    if(+sId > 999999 && +dId > 999999 && +roleId > 999999){
      const res = await DiscordFetch('/guilds/'+sId+'/members/'+dId+'/roles/'+roleId, 'DELETE', null, {"Content-Type": "application/json"})
      ReportError(res, 'GuildMemberRoleRemove', {sId: sId, dId: dId, roleId: roleId})
      if(res?.status === 204){
        return 1
      }else{
        return 0
      }
    }
  }catch(e){
    console.error(e)
  }
}
