'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let newFiles = HP.GetOptValue(opt, 'newfiles')
    BotSocket.send('UpdateData', {newFiles: newFiles}, null)
    HP.ReplyMsg(obj, {content: 'Data Update Request Sent'})
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
