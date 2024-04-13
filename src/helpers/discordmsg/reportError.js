'use strict'
module.exports = (obj = {}, type, opts = {})=>{
  try{
    if(obj.status > 300 || obj.error){
      let errMsg = type ? type+': ':'\n'
      if(opts.sId) errMsg += ' sId: '+opts.sId+'\n'
      if(opts.chId) errMsg += ' chId: '+opts.chId+'\n'
      if(opts.msgId) errMsg += ' msgId: '+opts.msgId+'\n'
      if(opts.dId) errMsg += ' dId: '+opts.dId+'\n'
      if(opts.roleId) errMsg += ' roleId: '+opts.roleId+'\n'
      if(obj?.body?.message){
        errMsg += (type ? type+': ':'')+obj.body.message+'\n'
      }else{
        errMsg += JSON.stringify(obj)+'\n'
      }
      console.error(errMsg)
    }
  }catch(e){
    console.error(e)
  }
}
