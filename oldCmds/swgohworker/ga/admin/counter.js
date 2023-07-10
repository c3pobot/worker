'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = { content: 'Error with the provided data' }
    let mode = await HP.GetOptValue(opt, 'mode')
    let season = await HP.GetOptValue(opt, 'season')
    if(mode && season){
      msg2send.content = 'ga **'+mode+'** was updated to season **'+season+'** for counters default'
      const key = 'ga-'+mode
      await mongo.set('botSettings', {_id: '1'}, {[key]:season})
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
