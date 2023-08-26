/**
 *  Returns an array containing the \
 */
 

//const urlDatabase = {
//  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
//  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'dlQHOnh' },
//  i3BoGr: { longURL: 'https://www.google.ca', userID: 'dlQHOnh' },
//  CIhFrwV: { longURL: 'jake123.com', userID: 'dlQHOnh' },
//  Zw12tR5: { longURL: 'http://example.com', userID: 'dlQHOnh' }
//};


//const id = "dlQHOnh"

const urlsForUser = (database, id) => {

  let result = [];  

  for (const urlID in database) {
    //let link = urlDatabase[urlID].longURL;

    if ((database[urlID].userID) === id) {
      result.push(urlID);
    };
    
  };
  return result;
}



//console.log("dlQHOnh:", urlsForUser("dlQHOnh"));
//console.log("userRandomID:", urlsForUser("userRandomID"));


module.exports = urlsForUser;