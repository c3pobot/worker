'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = { content: 'Error with the provided data' }, array = []
    const tempObj = (await mongo.find('autoComplete', {_id: 'ga-date'}))[0]
    if(tempObj?.data) array = tempObj.data
    let mode = await HP.GetOptValue(opt, 'mode')
    let histid = await HP.GetOptValue(opt, 'histid')
    let date = await HP.GetOptValue(opt, 'date')
    if(mode && histid && date){
      const index = array.findIndex(x=>x.value == +histid)
      const tempGA = {name: date+' ('+mode+')', mode: mode, value: histid}
      if(index >= 0){
        array[index] = tempGA
      }else{
        array.push(tempGA)
      }
      array = await sorter([{column: 'value', order: 'descending'}], array)
      msg2send.content = 'ga **'+histid+'** was added for **'+mode+'** on **'+date+'**'
      await mongo.set('autoComplete', {_id: 'ga-date'}, {data: array})
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
