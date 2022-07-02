import { link } from "fs";
import { saveLinkFile, savePage, saveWordFile, clear, getDirectoryLength, rawPath } from "./methods/file";

const puppeteer = require("puppeteer")
const fs = require("fs")

let visited: string[] = []
let queue: string[] = []

let amountToVisit: number = 200; // Amount of pages to visit, assignment says 200
let startingURL = "https://en.wikipedia.org/wiki/Athletics_at_the_1979_Summer_Universiade_%E2%80%93_Men%27s_3000_metres_steeplechase" // What URL to start the crawler at
// Wikipedia random urL: https://en.wikipedia.org/wiki/Special:Random

mainLoop();

async function mainLoop() {
    await clear()

    let start = performance.now()
    queue.push(startingURL)
    const browser = await puppeteer.launch();

    while (queue.length > 0 && visited.length < amountToVisit) {
        await getPage(queue.pop(), browser);
    } 

    console.log("Visited " + visited.length + " pages, ending loop.")
    let amount = getDirectoryLength()
    console.log("Directory contains " + amount + " files.")

    let end = performance.now();
    var timeElapsed = Math.round(end - start);
    console.log("Time elapsed: " + timeElapsed / 1000 + " seconds")

    await browser.close();
}



async function getPage(url: string, browser) {
    try {
        if (visited.indexOf(url) === -1 ) {
            const page = await browser.newPage();
            await page.goto(url);

            let newUrl = page.url();
            visited.push(newUrl)
        
            const links: string[] = await page.$$eval('#bodyContent a', links => links.map(link => link.href));
            let title: string = await page.title()
            title = title.substring(0, title.length - 12)
            let content: string = await page.content()
    
            console.log("Curent page: " + title)

            if (!alreadyVisited(title)) {
                savePage(content, title)
                saveWordFile(content, title)
                saveLinkFile(links, title)
                addToQueue(links)
            } else {
                console.log("Already visited! Not adding data.");
                amountToVisit++
            }

            console.log("Amount to visit left: " + visited.length + "/" + amountToVisit)
        }
    } catch (error) {
        console.log(error)
    }
}

function addToQueue(inputlinks: string[]) {

    let links = [...new Set(inputlinks)]

    if (queue.length < amountToVisit) {
        for (let index = 0; index < links.length; index++) {

            let element = links[index];

            if (validateURL(element)) {
                let url = new URL(element)
                element = url.protocol + url.hostname + url.pathname
                
                if (visited.indexOf(element) === -1
                    && queue.indexOf(element) === -1
                    && url.hostname === "en.wikipedia.org"
                    && url.pathname.indexOf(":") === -1) { // If not visited and queue doesnt already contain
    
                        queue.push(element)
                }
            }
        }
    }
}

function alreadyVisited(name: string) {
    try {
        let filepath = rawPath + name + ".html"

        if (fs.existsSync(filepath)) {
            return true
        } else {
            return false
        }
        
    } catch (error) {
        console.log(error)
    }
}

function validateURL(url: string) {
    try {
        let newurl = new URL(url)
    } catch (error) {
        return false
    }

    return true
}