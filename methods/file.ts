const fs = require("fs")
const { convert } = require('html-to-text');
export const rawPath = "./data/raw/"
const wordsPath = "./data/words/"
const linksPath = "./data/links/"
const paths = [rawPath, wordsPath, linksPath]

export function savePage(content: string, name: string) {
    try {
        let filepath = rawPath + name + ".html"
        fs.writeFileSync(filepath, content)
    } catch (error) {
        console.log(error)
    }
}

export function saveLinkFile(links: string[], title: string) {
    try {
        let data = links.toString()
        data = data.replace(/\,https/g, "\nhttps")
        fs.writeFileSync(linksPath + title, data)
    } catch (error) {
        console.log(error)
    }

}

export function saveWordFile(html: string, title: string) {

    try {
        //console.log("Creating word soup: " + name)
    
        let res = convert(html, {
            baseElements: {
                selectors: [
                    "p"
                ]
            }
        })
    
        res = res.replace(/\[(.*?)\]/g, "")
        res = res.replace(/\n/g, "")
        res = res.replace(/[^\w\s]/g, "")
    
        fs.writeFileSync(wordsPath + title, res)    
        
    } catch (error) {
        console.log(error)
    }
    
}

export async function clear() {
    paths.forEach(path => {
        fs.rm(path, {recursive: true}, (error) => {
            if (error) {
                console.log(error)
            } else {
                fs.mkdirSync(path)
            }
        })
        
    });
}

export function getDirectoryLength() {
    return fs.readdirSync(rawPath).length
}