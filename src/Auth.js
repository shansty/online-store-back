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
let products = [
  {
    id: 1,
    title: 'Чашка',
    description: 'Большая голубая',
    img: 'https://thumbs.dreamstime.com/z/%D0%B3%D0%BE%D0%BB%D1%83%D0%B1%D0%B0%D1%8F-%D1%87%D0%B0%D1%88%D0%BA%D0%B0-8913906.jpg',
    user_id: 1,
    vendorCode: 44,
    category: "dishes"
  },
  {
    id: 2,
    title: 'Тарелка',
    description: 'Красивая круглая',
    img: 'https://akshome.by/upload/iblock/cde/k0i2q2v9cxrswrs0zjvyhpwpy5tswj5q.jpg',
    user_id: 2,
    vendorCode: 45,
    category: "dishes"
  },
  {
    id: 3,
    title: 'Ложка',
    description: 'Удобная серебрянная',
    img: 'https://images.deal.by/317619960_w600_h600_317619960.jpg',
    user_id: 1,
    vendorCode: 13,
    category: "cutlery"
  }
]

let cart = {};

app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    let user = users.find(el => {
        return el.email === email && el.password == password;
      })

      let id = user.id;

    if (user) {
        token = jwt.sign( {id}, secretKey, { expiresIn: '24h' });
        res.status(200).json({ token });
    
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
})

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
    res.json({message: 'User with this email or name already exist'});

  } else {

    const id = quantityOfUsers + 1;
    const newUser = {
        id: id,
        email: email,
        password: password,
        userName: userName
    }
    users.push(newUser);
    res.json({message: `${userName}, You are registered!`})
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
  } catch(err) {
    console.error(err)
    res.status(400).json({message: err.message})
  }}); 


app.patch('/profile/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const data = req.body;
    const id =  req.params.id;

    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).json({ message: `Invalid data`});
          return;
        }
        if (id == decoded.id) {
          let ind = users.findIndex(el => {
            return el.id == id;
          })
          users[ind] = {...users[ind], ...data}
          res.status(201).json(users[ind])
        } else {
          res.status(403).json({message: "Forbidden"})
        }
      });
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }}); 

app.get("/users/:userId/products", (req, res) => {
  let userId = req.params.userId;
  let userProducts = products.filter(el => {
    return el.user_id == userId
  })
    res.status(200).json({userProducts})
})

app.get("/users/:userId/products/:id", (req, res) => {
  const id =  req.params.id;
  const userId =  req.params.userId;
  let user = users.findIndex(el => {
    return el.id == userId;
  })
  if(user == -1) {
    res.status(404).json({message: "User dosen't exist"})
  }
  let userProduct = products.find(el => {
    return el.id == id;
  })
  if(userProduct) {
    res.status(200).json({userProduct})
  } else {
    res.status(404).json({message: "Product doesn't exist"})
  }
})

app.post("/users/:userId/products", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { title, description, img, vendorCode }  = req.body;

  const user_id = req.params.userId;
  const quantityOfProducts = products.length;
  try {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: err.message});
        return;
      } else {
        if (user_id == decoded.id) {
          let product = products.find(el => {
            return el.vendorCode == vendorCode && el.user_id == user_id 
          })
          if (product) {
            res.status(409)
            res.json({message: 'Product with this vendor code already exist'});
          } else {
            const id = quantityOfProducts + 1;
            const newProduct = {
                id,
                title,
                description,
                img,
                vendorCode,
                user_id
            }
            products.push(newProduct);
            res.status(201).json({message: `${title} with vendor code ${vendorCode} added to the product's list`})
          }
        } else {
          res.status(403).json({message: "Unauthorized"})
        }}
    });
  } catch(err) {
    console.error(err)
    res.status(400).json({message: err.message})
  }}); 


app.delete("/users/:userId/products/:id", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { id, userId } =  req.params;
  try {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: err.message});
        return;
      } else {
        let user = users.findIndex(el => {
          return el.id == userId;
        })
        if(user == -1) {
          res.status(404).json({message: "User dosen't exist"})
        }
        if (userId == decoded.id) {
          let productIndex = products.findIndex(el => el.id == id && el.user_id == userId)
          if(productIndex != -1) {
            products.splice(productIndex, 1)
            res.json({ products: products.filter(el => el.user_id == userId) })
          } else {
            res.status(404).json({message: "Product doesn't exist"})
          }
        } else {
          res.status(403).json({message: "Unauthorized"})
        }}
    });
  } catch(err) {
    console.error(err)
    res.status(400).json({message: err.message})
  }}); 


app.patch("/users/:userId/products/:id", (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const data = req.body;
    const id =  req.params.id;
    const userId = req.params.userId;
    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).json({ message: err.message});
          return;
        } else {
          let user = users.findIndex(el => {
            return el.id == userId;
          })
          if(user == -1) {
            res.status(404).json({message: "User dosen't exist"})
          }
          if (userId == decoded.id) {
            let ind = products.findIndex(el => {
              return el.id == id;
            })
            if(ind != -1) {
              products[ind] = {...products[ind], ...data}
              res.json({product: products[ind]})
            } else {
              res.status(404).json({message: "Product doesn't exist"})
            }
          } else {
            res.status(403).json({message: "Unauthorized"})
          }}
      });
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }});  



  app.get("/products", (req, res) => {
    let category =  req.query.category;
    let categoryProducts = products.filter(el => {
      return el.category == category;
    })
    if(category) {
      if (categoryProducts.length > 0) {
        res.status(200).json({ products: categoryProducts });
      } else {
        res.status(200).json({ message: "No products in such category" });
      }
    } else {
      categoryProducts = products;
      res.status(200).json({products: categoryProducts})
    }
    });
    

  app.get("/products/:id", (req, res) => {
    const id =  req.params.id;
    let product = products.find(el => {
      return el.id == id;
    })
    if(product) {
      res.status(200).json({product})
    } else {
      res.status(404).json({message: "Product doesn't exist"})
    }
  });


  app.get("/users/:userId/cart", (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const userId = req.params.userId;
    let user_products=[];
    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).json({ message: err.message});
          return;
        } else {
          if (userId == decoded.id) {
            let user_cart = cart[userId];
            if(user_cart) {
              for(let i = 0; i < user_cart.length; i++) {
                let product_id = user_cart[i].id;
                let product_amount = user_cart[i].amount;
                let user_product = products.find(el => {
                  return el.id == product_id;
                });
                if(user_product) {
                  user_product = {...user_product, ["amount"]: product_amount};
                  user_products.push(user_product)
                }  else {
                  user_products = [];
                }
              }
              res.status(200).json({ user_cart: user_products })
          }  else {
            user_products = [];
            res.status(200).json({ user_cart: user_products })
          }
          } else {
            res.status(403).json({message: "Unauthorized"})
          }
          
      }});
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }}); 
    


  app.delete("/users/:userId/cart/:id", (req, res) => {
    const id =  req.params.id;
    const userId = req.params.userId;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    try{
      jwt.verify(token,secretKey, (err, decoded) => {
        if(err) {
          res.status(403).json({ message: err.message});
        } else {
          if(userId == decoded.id) {
            let user = users.find(el => {
              return el.id == userId;
            }); 
            if(user) {
              let product = products.find(el => {
                return el.id == id;
              });
              if(product) {
                let user_cart = cart[userId];
                if(user_cart) {
                  let ind = user_cart.findIndex(item => item.id == id);
                  console.log(ind);
                  let user_product = products.find(el => el.id == id);
                  if(ind != -1) {
                    let product_amount = user_cart[ind].amount;
                    if(product_amount > 1) {
                      product_amount--;
                      user_product = {...user_product, ["amount"]: product_amount};
                      user_cart[ind] = user_product;
                    } else {
                      user_cart.splice(ind, 1);
                    }
                  } else {
                    res.status(404).json({message: "Product doesn't found"})
                  }
                  res.status(200).json({user_product: user_product})
                } else {
                  res.status(200).json({message: "User cart is empty"})
                }
              } else {
                res.status(403).json({message: "Product doesn't found"})
              }
            } else {
              res.status(403).json({message: "User doesn't found"})
            }
          } else {
            res.status(403).json({message: "Unauthorized"})
          }
        }
      })
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }}); 

   app.get("/users/:userId/cart/:id", (req, res) => {
    const id =  req.params.id;
    const userId = req.params.userId;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    try{
      jwt.verify(token,secretKey, (err, decoded) => {
        if(err) {
          res.status(403).json({ message: err.message});
        } else {
          if(userId == decoded.id) {
            let user = users.find(el => {
              return el.id == userId;
            }); 
            if(user) {
              let product = products.find(el => {
                return el.id == id;
              });
              if(product) {
                let user_cart = cart[userId];
                console.log({user_cart});
                if(user_cart) {
                  let ind = user_cart.findIndex(item => item.id == id);
                  if(ind != -1) {
                    let product_amount = user_cart[ind].amount;
                    let user_product = products.find(el => {
                    return el.id == id;})
                    user_product = {...user_product, ["amount"]: product_amount};
                    res.status(200).json({user_product: user_product})
                  } else {
                    res.status(403).json({message: "Product doesn't found"})
                  }
                } else {
                  res.status(200).json({message: "User cart is empty"})
                }
              } else {
                res.status(403).json({message: "Product doesn't found"})
              }
            } else {
              res.status(403).json({message: "User doesn't found"})
            }
          } else {
            res.status(403).json({message: "Unauthorized"})
          }
        }
      })
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }}); 


  app.post("/users/:userId/products_cart/:id", (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const id = req.params.id;
    const userId = req.params.userId;
    try {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).json({ message: err.message});
          return;
        } else {
          if (userId == decoded.id) {
            let user = users.find(el => {
              return el.id == userId;
            })
            if(user) {
              let product = products.find(el => {
                return el.id == id;
              })
              if(product) {
                let user_cart = cart[userId];
                if(!user_cart) {
                  user_cart = [{ "id": id, "amount": 1 }];
                } else {
                    let index = user_cart.findIndex(item => item.id === id);
                    if (index !== -1) {
                        user_cart[index].amount++;
                    } else {
                      user_cart.push({ "id": id, "amount": 1 });
                    }
                }
                cart[userId] = user_cart;
                res.status(200).json({product: cart[userId]})
              } else {
                res.status(404).json({message: "Product doesn't found"})
              }
            } else {
              res.status(403).json({message: "Unauthorized"})
            }
          } else {
            res.status(403).json({message: "Unauthorized"})
          }}
      });
    } catch(err) {
      console.error(err)
      res.status(400).json({message: err.message})
    }}); 
    

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
