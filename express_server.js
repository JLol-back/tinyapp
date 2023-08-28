const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

//const urlsForUser = require('./urlsForUser');



/*****************************************************************************************/

//                                    MIDDLEWARE                                         //

/*****************************************************************************************/



app.set("view engine", "ejs"); // Set EJS as our templating engine

app.use(express.urlencoded({ extended: true }));

//app.use(cookieParser()); //REMOVE

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
    }
  }
  return result;
};



/*****************************************************************************************/

//                                    POST ROUTS                                         //

/*****************************************************************************************/


app.post("/urls", (req, res) => {
  
  //let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;

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

console.log(hashedPassword);

  if (newUser.email === '' || newUser.password === '') {
    res.status(400).send('Please provide both an email and a password to register an account.');
    return;
  }

  if (getUserByEmail(newUser.email) !== null) {
    res.status(400).send('An account with this email already exists. Please log-in to use TinyApp');
    return;
  }

  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  //res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  //let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;
  const id = req.body.id;

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to delete URLs');
    return;
  }

  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't delete other peoples URLs");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  //let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;

  const updatedURL = req.body.newURL;
  const id = req.body.id;

  if (user_id === undefined) {
    res.status(400).send('You must be logged in to edit URLs');
    return;
  }

  if (user_id !== urlDatabase[id].userID) {
    res.status(400).send("You can't edit other peoples URLs");
    return;
  }

  urlDatabase[id].longURL = updatedURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email);
  const password = req.body.password;

  if (user === null && password === '') {
    res.status(403).send("Please provide both a password and an email");
    return;
  }
  
  if (user === null) {
    res.status(403).send("User not found in our DB");
    return;
  }


  if ((bcrypt.compareSync(password.toString(), user.password)) === false) {
    res.status(403).send("Incorrect password. Please try again");
    return;
  }

  //res.cookie('user_id', user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
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
  //let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;
  let filteredUrls = urlsForUser(user_id);
  
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
  //let user_id = req.cookies["user_id"];
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
  //let user_id = req.cookies["user_id"];
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
  //let user_id = req.cookies["user_id"];
  
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
  //let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;
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
  //let user_id = req.cookies["user_id"];
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