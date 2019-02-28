const async = require('async');
const cheerio = require('cheerio')
const phantom = require('phantom')
const fetch = require('node-fetch')
var fs = require('fs');
const pg = require('pg')

const url2 = "https://randomuser.me/api/?&nat="
const montrealNeighbourhoods = ["Ahuntsic-CartierVille", "Anjou", "Côte-des-Neiges", "Lachine", "LaSalle", "Le Plateau-Mont-Royal", "Le Sud-Ouest", "L'Île-Bizard", "Mercier", "Montréal-Nord", "Outremont", "Pierrefonds-Roxboro", "Rivière-des-Prairies", "Rosemont", "Saint-Laurent", "Saint-Léonard", "Verdun", "Ville-Marie", "Villeray"]

async function genAddresses(num, country) {
    return fetch(url2 + country + "&results=" + num)
        .then(function(response) {
            return response.json()
        })
        .then(function(myJson) {
            const addressArr = []
            let json = myJson.results

            json.forEach(element => {
                addressArr.push(element.location.street)
            })
            return addressArr
        })
}

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

function generateNeighbourhoodSQL(fileName, relationName) {
    let fileString = ""
    let insertINTO = "INSERT INTO " + relationName + " VALUES("
    montrealNeighbourhoods.forEach(hood => {
        let tempStr = insertINTO + "\'" + hood + "\'" + ");" + "\n"
        fileString = fileString + tempStr
    })
    fs.appendFile(fileName, fileString, function(err) {
        if(err) console.log(err);
        else {
            console.log("FILE CREATION SUCCESSFUL");
        }      
    })
}

function generatePeopleSQL(fileName, num, country) {
    let fileString = ""
    let insertINTO = "INSERT INTO Person" + " VALUES("
    let insertINTOMember = "INSERT INTO Member" + " VALUES("
    let insertINTOOwner = "INSERT INTO Owner" + " VALUES("
    genNames(num, country)
        .then(function(data) {
            data.forEach(person => {
                let tempStr = insertINTO + "\'" + person[1] + "\'" + "," + "\'" + person[0] + "\'" + ");" + "\n"
                let memberStr = insertINTOMember + "\'" + person[1] + "\'" + ");" + "\n"
                let OwnerStr = insertINTOOwner + "\'" + person[1] + "\'" + ");" + "\n"
                fileString = fileString + tempStr
                if(Math.random() < 0.20) {
                    fileString = fileString + OwnerStr
                } else {
                    fileString = fileString + memberStr
                }
            })
            fs.appendFile(fileName, fileString, function(err) {
                if(err) console.log(err);
                else {
                    console.log("FILE CREATION SUCCESSFUL");
                }
            })
            return data
        })
}

function generatePropertiesSQL(fileName, num, relationName, country, neighborhoodsList) {
    let fileString = ""
    let insertINTO = "INSERT INTO " + relationName + " VALUES("
    genAddresses(num, country)
        .then(function(data) {
            data.forEach(address => {
                let randIndex = Math.floor(Math.random()*(neighborhoodsList.length))
                let tempStr = insertINTO + "\'" + address + "\'" + "," + "\'" + neighborhoodsList[randIndex] + "\'" + ");" + "\n"
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




//             generatePeopleSQL( __ , __ , __ , __ )
// Takes 4 arguments
// 1. name of file to be generated (include .sql at the end for sql format)
// 2. number of people to be generated
// 3. country/nationality of the people's names
// 4. name of relation to be inserted to

// Example: Creates a file called genPPL.sql that generates 10 insertion statements with
//          10 random unique people from canada, inserts into PERSON relation.
// generatePeopleSQL("makePeople.sql", 100, "CA", "Person")




//             generateNeighbourhoodSQL( __ , __ , __ )
// Takes 3 arguments
// 1. name of file to be generated
// 2. number of neighborhoods to be generated
// 3. name of relation to be inserted into

// Example: Creates a file called genHood.sql that generates 20 insertion statements with
//          20 unqiue neighborhood names, inserts into NEIGHBOURHOOD relation
// generateNeighbourhoodSQL("genHood.sql", 8, "Neighbourhood")




//             generatePropertiesSQL( __ , __ , __ , __ )
// Takes 4 arguments
// 1. name of file to be generated
// 2. number of properties to be generated
// 3. name of relation to be inserted into
// 4. country/nationality of the property
// 5. Because the property relation is dependent on existing neighbourhoods,
//    the insert statement will look like this:
//    INSERT INTO Property VALUES('address1', neighborhoodName, email) where
//    neighborhoodName and email are items that already exist in the database

// Example: Creates a file called genHood.sql that generates 20 insertion statements with
//          20 unqiue neighborhood names, inserts into PROPERTY relation
// globalNeighborhoodsList = ["Little Bighorn", "Castle Hill", "Red Hill", "Toa Payoh" , "Orchard", "Chinatown", "Le Plateau"]
// generatePropertiesSQL("genProp.sql", 50, "Property", "CA" , globalNeighborhoodsList)



// INSTRUCTIONS IF OTHER PEOPLE USE MY CODE:
// Generate people first. When you generate people, as you need to add them to the database first anyways.
// Then generate Neighborhoods, which will update the globalNeighborhoodsList array with existing neighborhoods.
// The code will then randomly select neighborhoods that the addresses are part of. You can include you own
// custom list of neighborhoods, but ensure that they are in the database already, or else your insert statements
// will not work. 

generatePeopleSQL("genPeople.sql", 200, "CA")
generateNeighbourhoodSQL("genHood.sql", "Neighbourhood")
generatePropertiesSQL("genProp.sql", 100, "Property", "CA" , montrealNeighbourhoods)