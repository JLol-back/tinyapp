const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

//const urlsForUser = require('./urlsForUser');



/*****************************************************************************************/

//                                    MIDDLEWARE                                         //

/*****************************************************************************************/



app.set("view engine", "ejs"); // Set EJS as our templating engine

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  dlQHOnh: {
    id: "dlQHOnh",
    email: "user3@example.com",
    password: "blah-blah",
  },
};


/*****************************************************************************************/

//                                    FUNCTIONS                                         //

/*****************************************************************************************/


const getUserByEmail = (email) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
  return null;
};


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


const urlsForUser = (id) => {
  let result = [];  
  for (const urlID in urlDatabase) {
    if ((urlDatabase[urlID].userID) === id) {
      result.push(urlID);
    };
  };
  return result;
};



/*****************************************************************************************/

//                                    POST ROUTS                                         //

/*****************************************************************************************/


app.post("/urls", (req, res) => {
  
  let user_id = req.cookies["user_id"];
  
  const templateVars = { urls: urlDatabase };
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = { "longURL": req.body.longURL, "userID": user_id }; 
 
  if (user_id === undefined) {
    res.status(400).send('Only registered users can shorten URLs');
  } else {
    res.redirect(`/urls/${shortUrl}`);
  }  
});

app.post("/register", (req, res) => {
    
  let user_id = generateRandomString();
  let password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  let newUser = {
    id: user_id, 
    email: req.body["email"], 
    password: hashedPassword
  };

  if (newUser.email === '' || newUser.password === '') {
    res.status(400).send('Please provide both an email and a password to register an account.');
  }

  if (getUserByEmail(newUser.email) !== null) {
    res.status(400).send('An account with this email already exists. Please log-in to use TinyApp');
  };

  console.log(newUser);

  users[newUser.id] = newUser;
  res.cookie("user_id", user_id);
  res.redirect("/urls"); 
});

app.post("/urls/:id/delete", (req, res) => { 
  let user_id = req.cookies["user_id"];
  const id = req.body.id;

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to delete URLs');
  };

  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't delete other peoples URLs");
  };

  delete urlDatabase[id];
  res.redirect("/urls"); 
});

app.post("/urls/:id/edit", (req, res) => { 
  let user_id = req.cookies["user_id"];
  
  const updatedURL = req.body.newURL;
  const id = req.body.id;

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to edit URLs');
  };

  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't edit other peoples URLs");
  };


  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => { 
  const email = req.body.email;
  const user = getUserByEmail(email);
  const password = req.body.password;

  if (user == null && password === '') {
    res.status(403).send("Please provide both a password and an email");
  }
  
  if (user === null) {
    res.status(403).send("User not found in our DB");
  }

  if ((bcrypt.compareSync(password.toString(), user.password)) === false) {
    res.status(403).send("Incorrect password. Please try again");
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login"); 
});

/*****************************************************************************************/

//                                    GET ROUTES                                         //

/*****************************************************************************************/


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let filteredUrls = urlsForUser(user_id)
  
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
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    user: users[user_id]
  };

  if (user_id === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }  
});

app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    user: users[user_id]
  };

  if (user_id !== undefined) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }  
});

app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    user: users[user_id]
  };
  
  if (user_id !== undefined) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }  
});


app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  let longURL = urlDatabase[req.params.id].longURL;

  const templateVars = { 
    id: req.params.id,
    longURL,
    urls: urlDatabase, 
    user: users[user_id]
  };

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to view URLs');
  };

  if (user_id !== urlDatabase[templateVars.id].userID) {
    res.status(400).send('This is not your URL');
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    id: req.params.id,
    urls: urlDatabase, 
    user: users[user_id]
  };
  
  const longURL = urlDatabase[req.params.id].longURL; // Move into object
  
  if (longURL === undefined) {
    res.status(400).send('The provided shortened URL id does not exist');
  } else {
    res.redirect(longURL);
  }  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
