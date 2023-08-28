/**
 * getUserByEmail checks to see if a given email provided by a user during the 
 * registration or login flows exists within our users database. 
 * 
 * The returned user object is subsequently used to validate user credentials during login. 
 * 
 * A response of null is also used to validate that an account is NOT associated with a given
 * email and a new account can be created.
 * 
 * @param {string} email provided by user via login or register forms.
 * @param {object} database 
 * @returns a user object if the email provided corresponds to a user in the users database.
 * @returns NULL if no corresponding email can be found in the users database.
 */


const getUserByEmail = (email, database) => {
  for (const user_id in database) {
    if (database[user_id].email === email) {
      return database[user_id];
    }
  }
  return null;
};


/**
 * generateRandomString
 * @returns a 6 digit pseudo random string for use as either a unique user_id 
 * keys for use in the users database or as a unique Short URL id.
 */

const generateRandomString = () => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


/**
 * urlsForUser 
 * @param {string} id 
 * @param {object} database - intended to be used with the urlDatabase object. 
 * @returns {array} containing the unique url ids associated with the corresponding user object. 
 */

const urlsForUser = (id, database) => {
  let result = [];
  for (const urlID in database) {
    if (database[urlID].userID === id) {
      result.push(urlID);
    }
  }
  return result;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};