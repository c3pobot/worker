'use strict'
const apiFetch = require('src/helpers/apiFetch')

const { replyError } = require('src/helpers')

const GIPHY_API_KEY = process.env.GIPHY_API_KEY

module.exports = async(obj = {})=>{
  try{
    console.log(GIPHY_API_KEY)
    console.log(obj)
    let query = obj?.options?.get('query')?.value?.toString()?.trim()
    if(!query) return { content: 'You did not provide a search string' }

    let gifs = await apiFetch(`http://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURI(query)}`)
    if(!gifs?.data || gifs?.data?.length == 0) return { content: `could not find a gif for ${query}` }

    return { content: gifs.data[0]?.embed_url }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
