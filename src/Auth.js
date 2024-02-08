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
const products = [
  {
    id: 1,
    title: 'Чашка',
    description: 'Большая голубая',
    img: 'https://thumbs.dreamstime.com/z/%D0%B3%D0%BE%D0%BB%D1%83%D0%B1%D0%B0%D1%8F-%D1%87%D0%B0%D1%88%D0%BA%D0%B0-8913906.jpg',
    isInStock: true,
    user_id: 1,
    vendorCode: 44
  },
  {
    id: 2,
    title: 'Тарелка',
    description: 'Красивая круглая',
    img: 'https://akshome.by/upload/iblock/cde/k0i2q2v9cxrswrs0zjvyhpwpy5tswj5q.jpg',
    isInStock: true,
    user_id: 2,
    vendorCode: 45
  },
  {
    id: 3,
    title: 'Ложка',
    description: 'Удобная серебрянная',
    img: 'https://images.deal.by/317619960_w600_h600_317619960.jpg',
    isInStock: true,
    user_id: 1,
    vendorCode: 13
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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const id = req.params.id;
  try {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: err.message});
        return;
      } else {
        if (id == decoded.id) {
          let user = users.find(el => {
            return el.id == id;
          })
          res.json({user})
        } else {
          res.status(403).json({message: "Unauthorized"})
        }}
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({message: err.message})
  }
}); 


app.patch('/profile/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const params = req.body;
    const id =  req.params.id;

    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).json({ message: `Invalid data`});
          return;
        }
        if (id == decoded.id) {
          let ind = users.findIndex(el => {
            el.id == id;
          })
          console.log(params)
          users[ind] = {...users[ind], ...params}
          res.json(users[ind])
        } else {
          res.status(403).json({message: "Unauthorized"})
        }
      });
    } catch (err) {
      console.log(err)
      res.status(400).json({message: err.message})
    }
}); 

app.get("/users/:id/products", (req, res) => {
  console.log(req.params)
  let id = req.params.id;
  let product = products.filter(el => {
    return el.user_id == id
  })
  if(product) {
    res.json(product)
  } else {
    res.json({message: "В магазине нету продуктов"})
  }

})

app.get("/users/:id/products/:id", (req, res) => {
  const id =  req.params.id;
  console.log(id)
  let userProducts = products.find(el => {
    return el.id == id;
  })
  if(userProducts) {
    res.json(userProducts)
  } else {
    res.json({message: "Такой товар не существует"})
  }
})

app.post("/users/:id/products", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const img = req.body.img;
  const isInStock = req.body.isInStock;
  const vendorCode = req.body.vendorCode;
  const user_id = req.params.id;

  const quantityOfProducts = products.length;

  let product = products.find(el => {
    return el.vendorCode == vendorCode
  })

  if (product) {
    res.status(409)
    res.json({message: 'Товар с таким артикулом уже существует'});

  } else {
    const id = quantityOfProducts + 1;
    const newProduct = {
        id: id,
        title: title,
        description: description,
        img: img,
        isInStock: isInStock,
        vendorCode: vendorCode,
        user_id: user_id
    }
    products.push(newProduct);
    console.log(products)
    res.json({message: `${title} с артикулом ${vendorCode} добавлен в список ваших товаров`})
  }
  });

app.delete("/users/:id/products/:id", (req, res) => {
  const id =  req.params.id;
  console.log(id)
  let userProducts = products.find(el => {
    return el.id == id;
  })
  if(userProducts) {
    let arrayWithoutProduct = products.filter(el => el.id != id);
    res.json(arrayWithoutProduct)
  } else {
    res.json({message: "Такой товар не существует"})
  }
});

app.patch("/users/:id/products/:id", (req, res) => {

    const params = req.body;
    const id =  req.params.id;
    let ind = products.findIndex(el => {
      return el.id == id;
    })
    if(ind >= 0) {
      console.log(params)
      products[ind] = {...products[ind], ...params}
      res.json(products[ind])
      console.log(products)
    } else {
      res.status(403).json({message: "Товар не существует"})
    }
    
  });


app.listen(3001, () => {
  console.log('Server started on port 3001');
});
