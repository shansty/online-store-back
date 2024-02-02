const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({origin: ["http://localhost:3000"]}));

const secretKey = 'secret-key-for-user';

const usersRegister = [
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

//get/:id' запрос с токеном, котдающий юзера
app.get('/profile/:id', (req, res) => {
    const token = req.body.token;
    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: `Invalid data + ${token}`});
        }
      let id = decoded.id;
      let user = usersRegister.find(el => {
        return el.id = id;
      })
      res.json({user})
    });
    } catch (err) {
      console.error(err); 
    }
}); 




app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    let user = usersRegister.find(el => {
        return el.email === email && el.password == password;
      })

      let id = user.id;

    if (user) {
        // Generate a JWT token
        token = jwt.sign( {id}, secretKey, { expiresIn: '24h' });
    
        // Return the token to the client
        res.json({ token: token });
    
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
})

// Регистрация, если пользователя с таким именем нету
app.post('/register', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;

    const quantityOfUsers = usersRegister.length;

    let user = usersRegister.find(el => {
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
    usersRegister.push(newUser);
    console.log(usersRegister)
    res.json({message: `${userName}, Вы успешно зарегистрировались!`})
  }
});


app.patch('/profile/:id', (req, res) => {

    const params = req.body;
    const id =  req.params.id;

    let user = usersRegister.find(el => {
      return el.id === id;
    })

    let ind = user.findIndex()

    usersRegister[ind] = {...usersRegister[ind], ...params}
    res.json({message: `Данные пользователя обновлены`})

}); 

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
