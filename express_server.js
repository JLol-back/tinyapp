const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');



/*****************************************************************************************/

//                                    MIDDLEWARE                                         //

/*****************************************************************************************/



app.set("view engine", "ejs"); // Set EJS as our templating engine

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['kbydoi7w46blri8a37n9q3879837niautvjht4wcvr'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



/*****************************************************************************************/

//                                    DATA                                               //

/*****************************************************************************************/



const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "dlQHOnh",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "dlQHOnh",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$/wUGUaqSlLXy.vLU7.tmxORN/IVMI4RAZXYQSR0jS8arDdgOoHdpS", // 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$TlrylcvmcfT2Q0oNBxvbd.S5lGhRWCSQib/PpqOThcp6JVKixXJ5.", // 'dishwasher-funk'
  },
  dlQHOnh: {
    id: "dlQHOnh",
    email: "user3@example.com",
    password: "$2a$10$RBj9f5ygXAI6S141raedOOV0Q7aHd5KhJPtqOBt20EqhAz4EcP53G", //'blah-blah'
  },
};



/*****************************************************************************************/

//                                    POST ROUTS                                         //

/*****************************************************************************************/


//                                //
//       CREATE A NEW URL         // 
//                                //


app.post("/urls", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = { urls: urlDatabase };

  // Generate a Short URL ID
  let shortUrl = generateRandomString();
  
  // Check user is logged in
  if (user_id === undefined) {
    res.status(400).send('Only registered users can shorten URLs');
    return;
  }
  
  // Update URL database with new URL and redirect user to Short URL page. 
  urlDatabase[shortUrl] = { "longURL": req.body.longURL, "userID": user_id };
  res.redirect(`/urls/${shortUrl}`);
  
});


//                                //
//       CREATE AN ACCOUNT        // 
//                                //


app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Create newUser object based off submitted form data
  let newUser = {
    id: user_id,
    email: req.body["email"],
    password: hashedPassword
  };
  
  // Ensure form was submitted with all required data
  if (newUser.email === '' || newUser.password === '') {
    res.status(400).send('Please provide both an email and a password to register an account.');
    return;
  }

  // Check to see if a user already exists for the email provided 
  if (getUserByEmail(newUser.email, users) !== null) {
    res.status(400).send('An account with this email already exists. Please log-in to use TinyApp');
    return;
  }

  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect("/urls");
});


//                                //
//   DELETE EXISTING SHORT URL    // 
//                                //


app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session.user_id;
  const id = req.body.id;
  
  // If user isn't logged in, display an error message
  if (user_id === undefined) {
    res.status(400).send('You must be logged in to delete URLs');
    return;
  }
  
  // If user_id isn't associated with the url being editted, display an error message
  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't delete other peoples URLs");
    return;
  }
  
  // Remove corresponding Short URL from urlDatabase and redirect user to /urls page.
  delete urlDatabase[id];
  res.redirect("/urls");
});


//                                //
//    EDIT EXISTING SHORT URL     // 
//                                //


app.post("/urls/:id/edit", (req, res) => {
  let user_id = req.session.user_id;

  const updatedURL = req.body.newURL;
  const id = req.body.id;
  
  // If user isn't logged in, display an error message
  if (user_id === undefined) {
    res.status(400).send('You must be logged in to edit URLs');
    return;
  }
  
  // If user_id isn't associated with the url being editted, display an error message
  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't edit other peoples URLs");
    return;
  }

  // If user attempts to submit the URL edit form without providing a new URL, display an error message
  if (updatedURL === '') {
    res.status(400).send("New URL cannot be empty");
    return;
  }

  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});


//              //
//    LOGIN     //
//              //


app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  const password = req.body.password;


  // Confirm login form is submitted with all required data
  if (user === null && password === '') {
    res.status(403).send("Please provide both a password and an email");
    return;
  }
  
  // If user is not found in database, display a (not too specific) error message.  
  if (user === null) {
    res.status(403).send("Incorrect login or password. Please try again");
    return;
  }
  
  // Hash submitted password and compare it with hashed password in our users database
  // If passwords don't match, display a (not too specific) error message.
  if ((bcrypt.compareSync(password.toString(), user.password)) === false) {
    res.status(403).send("Incorrect login or password. Please try again");
    return;
  }
  
  // If user exists and passwords match, set session cookies and redirect to /urls page.
  req.session.user_id = user.id;
  res.redirect("/urls");
});


//              //
//    LOGOUT    // 
//              //


// Account log out action, clears user cookies and returns them to login page

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});



/*****************************************************************************************/

//                                    GET ROUTES                                         //

/*****************************************************************************************/



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let filteredUrls = urlsForUser(user_id, urlDatabase);
  
  const templateVars = {
    urls: urlDatabase,
    filteredUrls,
    user: users[user_id]
  };

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  if (!user_id) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
    
});

app.get("/register", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  if (user_id) {
    res.redirect("/urls");
    return;
  }

  res.render("register", templateVars);

});

app.get("/login", (req, res) => {  
  let user_id = req.session.user_id;
  
  if (user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  res.render("login", templateVars);

});


app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  
  if (urlDatabase[req.params.id] === undefined) {
    res.status(400).send('We have no record of this Shortened URL');
    return; 
  }  
  
  let longURL = urlDatabase[req.params.id].longURL;

  const templateVars = {
    id: req.params.id,
    longURL,
    urls: urlDatabase,
    user: users[user_id]
  };

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to view URLs');
    return;
  }

  if (user_id !== urlDatabase[templateVars.id].userID) {
    res.status(400).send('This is not your URL');
    return;
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = {
    id: req.params.id,
    urls: urlDatabase,
    user: users[user_id]
  };
  
  const longURL = urlDatabase[req.params.id].longURL; // Move into object
  
  if (longURL === undefined) {
    res.status(400).send('The provided shortened URL id does not exist');
    return;
  }

  res.redirect(longURL);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});