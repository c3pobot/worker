'use strict'
module.exports = (skills = {}, units)=>{
	if(units){
		const res = {
			all: 0,
			some: 0
		}
		const unitZetaTotal = Object.values(skills).filter(x=>x.zetaTier).length
		for(let i in units){
			let zetaCount = 0
			for(let s in skills){
				if(skills[s].zetaTier) zetaCount += units[i].skill.filter(x=>x.id == s && +(x.tier + 2) >= +skills[s].zetaTier).length;
			}
			if(zetaCount == unitZetaTotal){
				res.all++
			}else{
				if(zetaCount > 0) res.some++
			}
		}
		return res
	}
}
