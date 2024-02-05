const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({origin: ["http://localhost:3000"]}));

const secretKey = 'secret-key-for-user';

const users = [
    {
      id: 1,
      email: 'test@email.ru',
      password: '123',
      userName: 'Anastasiya',
      phoneNumber: "",
      shopOwner: false
    },
    {
      id: 2,
      email: 'sectest@ggmail.com',
      password: 'nastya',
      userName: 'Artsiom',
      phoneNumber: "",
      shopOwner: false
    },
    {
      id: 3,
      email: 'thirdtest@gmail.com',
      password: 'artsiom',
      userName: 'John',
      phoneNumber: "",
      shopOwner: false
    }
    ]

app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    let user = users.find(el => {
        return el.email === email && el.password == password;
      })

      let id = user.id;

    if (user) {
        // Generate a JWT token
        token = jwt.sign( {id}, secretKey, { expiresIn: '24h' });
    
        // Return the token to the client
        res.json({ token });
    
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
})

// Регистрация, если пользователя с таким именем нету
app.post('/register', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;

    const quantityOfUsers = users.length;

    let user = users.find(el => {
      return el.email === email;
    })

  if (user) {
    res.status(409)
    res.json({message: 'Пользователь с таким именем или email уже зарегистрирован'});

  } else {
    // https://www.npmjs.com/package/uuid
    const id = quantityOfUsers + 1;
    const newUser = {
        id: id,
        email: email,
        password: password,
        userName: userName
    }
    users.push(newUser);
    console.log(users)
    res.json({message: `${userName}, Вы успешно зарегистрировались!`})
  }
});


app.get('/profile/:id', (req, res) => {
  const authHeader = req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const id = req.params.id;
  try {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: `Invalid data + ${token}`});
      }
      if (id === decoded.id){
      res.json({user})
      }
    });
  } catch (err) {
    console.error(err); 
  }
}); 


app.patch('/profile/:id', (req, res) => {

    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const params = req.body;
    const id =  req.params.id;

    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: `Invalid data + ${token}`});
        }
        if (id === decoded.id){
          let ind = users.findIndex(el => {
            return el.id === id;
          })
          users[ind] = {...users[ind], ...params}
          res.json({message: `Данные пользователя обновлены`})

        }
      });
    } catch (err) {
      console.error(err); 
    }
}); 

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
