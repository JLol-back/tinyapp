const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

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



app.set("view engine", "ejs"); // Set EJS as our templating engine

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const getUserByEmail = (email) => {
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
  return null;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  //console.log(req.cookies); 
  //console.log(user_id);
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    //user: users[user_id]
  };
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`); 
});

app.post("/register", (req, res) => {
    
  let user_id = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  newUser = {
    id: user_id, 
    email: req.body["email"], 
    password: req.body["password"]
  };

  if (newUser.email === '' || newUser.password === '') {
    res.status(400).send('Please provide both an email and a password to register an account.');
  }

  if (getUserByEmail(newUser.email) !== null) {
    res.status(400).send('An account with this email already exists. Please log-in to use TinyApp');
  };

  users[newUser.id] = newUser;
  //console.log(users);
  res.cookie("user_id", user_id);
  res.redirect("/urls"); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  res.render("login", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    //longURL: urlDatabase[req.params.id],
    urls: urlDatabase, 
    username: req.cookies["username"], // Remove this eventually
    user: users[user_id]
  };
  const longURL = urlDatabase[req.params.id]; // Move into object
  res.redirect(longURL);
});

/*
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/

app.post("/urls/:id/delete", (req, res) => { 
  const id = req.body.id;
  delete urlDatabase[id];
  res.redirect("/urls"); 
});

app.post("/urls/:id/edit", (req, res) => { 
  const updatedURL = req.body.newURL;
  const id = req.body.id;
  urlDatabase[id] = updatedURL;
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => { 
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
