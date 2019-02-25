const cheerio = require('cheerio')
const phantom = require('phantom')
const fetch = require('node-fetch')
var fs = require('fs');
const pg = require('pg')

// this is for web scraping but no longer needed as I found a good API
const url = "https://www.randomlists.com/random-addresses?qty="
async function genAddresses(num) {
    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(url + num)
    const content = await page.property('content')
    const addressArray = []
    await instance.exit()
    $ = cheerio.load(content)
    $('ol li br').parent().contents().each(function(i, elem) {
        if(i % 3 == 0) {
            let tempAddr = $(this).text()
            tempAddr = tempAddr.slice(0, -1)
            addressArray.push(tempAddr)
        }
    })

    return addressArray
}


// -------------------------------------------------------------------

const url2 = "https://randomuser.me/api/?&nat="

async function genNames(num, country) {
    return fetch(url2 + country + "&results=" + num)
    .then(function(response) {
        return response.json()
    })
    .then(function(myJson) {
        const namesArr = []
        let json = myJson.results
        
        json.forEach(element => {
            
            // add name and email to namesArr
            let tempArr = []
            let getName = element.name
            let name = getName.first + " " + getName.last
            tempArr[0] = name
            tempArr[1] = element.email
            namesArr.push(tempArr)
        })
        return namesArr
    })
}


//-------------------------------------------------------------

const url3 = "http://lewenberg.com/sng/index.php?submit=Generate+names&number="
async function genNeighbourhoods(num) {

    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(url3 + num)
    const content = await page.property('content')
    const addressArray = []
    await instance.exit()
    $ = cheerio.load(content)

    htmlArr = []
    $('body').contents().each(function(i, elem) {
        let str = $(this).text()
        let num = Math.random() * (2500 - 1000) + 1000
        let tempArr = [str.trim(), Math.floor(num)]
        htmlArr.push(tempArr)
    })
    htmlArr = htmlArr.slice(9, htmlArr.length - 2)
    htmlArr = htmlArr.filter(function(value, index, arr) {
        return index % 2 == 0
    })
    // htmlArr = htmlArr.map(x => x.trim())
    
    return htmlArr
}

// genAddresses(10)
//     .then(function(data) {
//         console.log(data);
//     })

// genNeighbourhoods(10)
//     .then(function(data) {
//         console.log(data);
//     })

// genNames(10, "CA")
//     .then(function(data) {
//         console.log(data);
//     })


// POSTGRES DB STUFF -------------------------------------------------


// "postgres://userName:password@serverName/ip:port/nameOfDatabase";
// var password = "Jordan23Lebron23"
// var username = "cs421g23"
// var serverName = "comp421.cs.mcgill.ca"
// var serverName2 = "comp421"
// var port = 5432
// var dbName = "cs421"

// var connectionString = "postgres://" + username + ":" + password + "@" + serverName + "/ip:" + port + "/" + dbName

// var pgClient = new pg.Client(connectionString)

// pgClient.connect(function(err) {
//     if(err) {
//         console.error(err);
//     }
// })

// var pgClient = new pg.Client(connectionString)

// pgClient.connect()


// FILE CREATION -------------------------------------------


function generateNeighbourhoodSQL(fileName, num, relationName) {
    let fileString = ""
    let insertINTO = "INSERT INTO " + relationName + " VALUES("
    genNeighbourhoods(num)
        .then(function(data) {
            data.forEach(hood => {
                let tempStr = insertINTO + "\'" + hood[0] + "\'" + "," + "\'" + hood[1] + "\'" + ");" + "\n"
                fileString = fileString + tempStr
            });

            fs.appendFile(fileName, fileString, function(err) {
                if(err) console.log(err);
                else {
                    console.log("FILE CREATION SUCCESSFUL");
                    
                }
                
            })
        })

    fs.appendFile(fileName, )
}

function generatePeopleSQL(fileName, num, country, relationName) {
    let fileString = ""
    let insertINTO = "INSERT INTO " + relationName + " VALUES("
    genNames(num, country)
        .then(function(data) {
            data.forEach(person => {
                let tempStr = insertINTO + "\'" + person[0] + "\'" + "," + person[1] + ");" + "\n"
                fileString = fileString + tempStr
            });
            fs.appendFile(fileName, fileString, function(err) {
                if(err) console.log(err);
                else {
                    console.log("FILE CREATION SUCCESSFUL");
                }
            })
        })
}

function generatePropertiesSQL(fileName, neighborhoodsList) {

}

//             generatePeopleSQL( __ , __ , __ , __ )
// Takes 4 arguments
// 1. name of file to be generated (include .sql at the end for sql format)
// 2. number of people to be generated
// 3. country/nationality of the people's names
// 4. name of relation to be inserted to
// Example: Creates a file called genPPL.sql that generates 10 insertion statements with
// 10 random unique people from canada, inserts into PERSON relation.
// generatePeopleSQL("makePeople.sql", 500, "CA", "PERSON")

//             generateNeighbourhoodSQL( __ , __ , __ )
// Takes 3 arguments
// 1. name of file to be generated
// 2. number of neighborhoods to be generated
// 3. name of relation to be inserted into
// Example: Creates a file called genHood.sql that generates 20 insertion statements with
// 20 unqiue neighborhood names, inserts into NEIGHBOURHOOD relation
// generateNeighbourhoodSQL("genHood.sql", 20, "NEIGHBOURHOOD")
