'use strict'
module.exports = (msg, opts = {})=>{
  try{
    let msg2send = (new Date())?.toLocaleString('en-US', {timeZone: 'America/New_York'})
    msg2send += '\ncmd : '+data.method
    if(opts.sId) msg2send += '\nsId : '+opts.sId
    if(opts.chId) msg2send += '\nchId : '+opts.chId
    if(opts.dId) msg2send += '\ndId : '+opts.dId
    msg2send += '\n'+JSON.stringify(msg)
    console.error(msg2send);
  }catch(e){
    console.error(e);
  }
}
