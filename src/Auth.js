const express = require('express');
const jwt = require('jsonwebtoken');
const {check} =  require('express-validator');
const {validationResult} = require('express-validator');

const app = express();
app.use(express.json());

const secretKey = 'secret-key-for-user';


const usersLogin = [
    {
      id: 1,
      email: 'test@email.ru',
      password: '123'
    },
    {
      id: 2,
      email: 'sectest@ggmail.com',
      password: 'nastya'
    },
    {
      id: 3,
      email: 'thirdtest@gmail.com',
      password: 'artsiom'
    }
    ]

const usersRegister = [
    {
      id: 1,
      email: 'test@email.ru',
      password: '123',
      fullName: 'Anastasiya Shirochina'
    },
    {
      id: 2,
      email: 'sectest@ggmail.com',
      password: 'nastya',
      fullName: 'Artsiom Bushuev'
    },
    {
      id: 3,
      email: 'thirdtest@gmail.com',
      password: 'artsiom',
      fullName: 'John Black'
    }
    ]

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let user = usersLogin.find(el => {
        return el.email === email && el.password == password;
      })

    if (user) {
        // Generate a JWT token
        tokenUser = jwt.sign( email, secretKey, { expiresIn: '24h' });
    
        // Return the token to the client
        res.json({ tokenUser });
    
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
})

// Регистрация, если пользователя с таким именем нету
app.post('/register', (req, res) => {

    //и это не працуе, куда надо пихать этот ебучий валидатор
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json({message: "Ошибка при регистрации"})
    }

    //Cпросить, почему не працуе
    check("email", "Поле email не может быть пустым").notEmpty();
    check("fullName", "Поле fullName не может быть пустым").notEmpty();
    check("password", "Пароль должен быть больше 4 символом и меньше 10").isLength({min:4, max:10});

    const email = req.body.email;
    const password = req.body.password;
    const fullName = req.body.fullName;
    const quantityOfUsers = usersRegister.length;

    let user = usersRegister.find(el => {
      return el.fullName === fullName;
    })

  if (user) {
    res.json({message: 'Пользователь с таким именем уже зарегистрирован'});

  } else {
    usersRegister.push({
        id: `${quantityOfUsers + 1}`,
        email: {email},
        password: {password},
        fullName: {fullName}
    });
    res.json({message: 'Вы успешно зарегистрировались'})
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
