'use strict'
const { apiFetch, replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let searchTerm = obj.data?.options?.query?.value?.trim()
    if(!searchTerm) return { content: 'You did not provide a query' }

    let res = await apiFetch(`http://api.urbandictionary.com/v0/define?term=${searchTerm}`)
    if(!res?.list || res?.list?.length == 0) return { content: `No results found for ${searchTerm}` }

    if(res.list.length > 5) res.list.splice(5)
    let embedMsg = {
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
    return { content: null, embeds: [embedMsg] }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
