const fs=require("fs");
const cheerio=require("cheerio");
const got=require("got");

const baseURL="https://www.bankmega.com"

var data=Object()

function getDetailPage(url,key,list_data){
    return got(url).then(resp=>{
        const $=cheerio.load(resp.body);
        const image=$("div.keteranganinside").find($("img")).toArray()[0]
        if(!image){
            console.log(url)
            console.log(image)
        }
        res={
            "title":$(".titleinside").children().text(),
            "area":$(".area").children().text(),
            "periode":$(".periode").children().text(),
            "image_detail":baseURL+$("div.keteranganinside").find($("img")).toArray()[0].attribs.src,
            "image":list_data.image,
            "href":list_data.href
        }
        data[key].push(res)
    }).catch((err)=>{
        console.log(err)
    });
}

async function getCategories(url){
    return got(baseURL+"/promolainnya.php#").then(resp=>{
        const $=cheerio.load(resp.body);
        const children=$("#subcatpromo").children().toArray();
        for(c of children){
            data[c.children[0].attribs.title]=[]
        }
        const length=children.length;
        return length;
    }).catch((err)=>{
        console.log(err)
    });
}

async function getTotalPage(subcat,page,result){
    return got(baseURL+"/ajax.promolainnya.php?&subcat="+subcat+"&page="+page).then(resp=>{
        const $=cheerio.load(resp.body);
        const target=$("#promolain").children().toArray();
        const targetLength=target.length;
        if(targetLength){
            
            var key=Object.keys(data)[subcat-1];
            for(t of target){
                obj={}
                var detailUrl=t.children[1].attribs.href
                var pat = /^https?:\/\//i;
                if (!pat.test(detailUrl))
                {
                    detailUrl=baseURL+"/"+t.children[1].attribs.href
                }
                obj["href"]=detailUrl
                obj["detailURL"]=t.children[1].attribs.href
                obj["image"]=baseURL+"/"+t.children[1].children[0].next.attribs.src
                getDetailPage(detailUrl,key,obj)
            }
            return getTotalPage(subcat,page+1,result+1)
        }
        return 1;
    })
}

async function main(){
    const length=await getCategories();
    for(i=1;i<=length;i++){
        var a=await getTotalPage(i,1,0);
        console.log(a)
    }
    
    var json=JSON.stringify(data);
    fs.writeFile("./solution.json",json,"utf-8",()=>{
        console.log("Write file completed");
    })

}

main()
