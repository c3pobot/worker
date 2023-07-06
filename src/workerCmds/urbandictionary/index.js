'use strict'
const { apiFetch, GetOptValue, ReplyError, ReplyMsg } = require('helpers')
module.exports = async(obj = {})=>{
  try{
    let msg2Send = {content: 'Error with search'}
    let searchTerm = GetOptValue(obj.data.options, 'query')
    if(searchTerm){
      const res = await apiFetch('http://api.urbandictionary.com/v0/define?term='+searchTerm)
      if(res && res.list && res.list.length > 0){
        if(res.list.length > 5) res.list.splice(5)
        const embedMsg = {
          color: 15844367,
          author:{
            name: 'Urban Dictionary : '+res.list[0].word,
            icon_url: 'http://i.imgur.com/nwERwQE.jpg'
          },
          description: ''
        }
        for(let i in res.list){
          embedMsg.description += '<'+res.list[i].permalink+'>\n\n'+res.list[i].definition+'\n\n'
        }
        msg2Send.content = null
        msg2Send.embeds = [embedMsg]
      }
    }
    ReplyMsg(obj, msg2Send)
  }catch(e){
    console.log(e)
    ReplyError(obj)
  }
}
