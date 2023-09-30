const fs = require('fs');
const express = require('express');
const path = require("path");
const jwt = require('jsonwebtoken');
const { privateKey, port_int } = require('./conf/config')();
const { initializeModels } = require("./data-access/initialize");

const usersServices = require("./services/users/users-services");

let userCreated = false;

async function run(){
  let mySQLdbModels = await initializeModels();
  let mySqlServices = [usersServices];
  await setModelsToServices(mySqlServices, mySQLdbModels);

  if(!userCreated){
    await usersServices.create();
    userCreated = true;
  }
  
  const app = express();
  const private_key = fs.readFileSync(path.join(__dirname, "certs", privateKey));

  app.use(express.json());

  app.post('/login', async (req, res) => {
    
    const { email, password } = req.body;
  
    let match = await usersServices.login(email, password);
    
    if (match) {
      
      const payload = {
          email: email,
      };
      const signOptions = {
          algorithm: 'RS256',
          expiresIn: '1h'
      };
      const token = jwt.sign(payload, private_key, signOptions);
  
      res.json({ token });
    } else {
      res.sendStatus(401); 
    }
  });
  
  app.listen(port_int, () => {
  console.log('Servidor de autenticación iniciado en el puerto ' + port_int);
  });
}

run();

const setModelsToServices = async (services, dbModels) => {
  await services.forEach(async (Service) => {
    Service.setDbModels(dbModels);
  });
};
