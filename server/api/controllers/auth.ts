import { Sha256 } from '@aws-crypto/sha256-js';
const userModel = require("../../models/userModel")();

module.exports = () => {
  const controller = {

    tryLogin: async (req: any, res: any) => {
      /** Compara email e senha forneciddos com o BD para logar o usuário */
      try {
        const params = req.body;
        
        //se ja estiver logado
        if(req.session.loggedIn){
          res.status(200).json({
            success: false,
            registered: true,
            wasLogged: true,
            triesExceeded: true
          });
        }
        else{
          const foundUser = await userModel.findOne({email: params.email}, { _id: false, _v: false }).exec();
          
          //se email nao estiver no BD
          if(!foundUser){
              res.status(200).json({
                  success: false,
                  registered: false,
                  wasLogged: false,
                  triesExceeded: false,
              });
          }
          //se esta no BD
          else{
            //faz hash na senha para comparar no BD
            const hash = new Sha256();
            hash.update(params.password);
            const hashPass = await hash.digest();

            //se email esta no BD e senha esta correta
            if (foundUser.senha == hashPass){
              req.session.loggedIn = true;
              req.session.user_email = foundUser.email;

              req.session.save(function (err: any) {
                if (err)
                  res.redirect('/');
              })

              res.status(200).json({
                success: true,
                registered: true,
                wasLogged: false,
                triesExceeded: false,
              });
            }
            //se esta no BD mas senha esta errada
            else{
              res.status(200).json({
                  success: false,
                  registered: true,
                  wasLogged: false,
                  triesExceeded: false,
              });
            }
          }
        }
      } catch (err) {
          console.log(err);
          res.status(500).send(err);
      }
    },

    logout: async (req: any, res: any) => {
      /**Destroi sessao atual do usuario */
      try{
        if(req.session.loggedIn){
          req.session.destroy();
          res.status(200).json({
            success: true,
          });
        }
      }
      catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    },
    
    checkSession: async (req: any, res: any) => {
      /**Checa se usuario ja estava logado*/
      try{
        res.status(200).json({
          success: true,
          loggedIn: req.session.loggedIn ? true : false,
        });
        
      }
      catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    },

    confirmPassword: async (req: any, res: any) => {
      try {
        const params = req.body;
        const foundUser = await userModel.findOne({email: req.session.user_email}, { _id: false, _v: false }).exec();
          
        //faz hash na senha para comparar no BD
        const hash = new Sha256();
        hash.update(params.password);
        const hashPass = await hash.digest();

        //se email esta no BD e senha esta correta
        if (foundUser.senha == hashPass){
          req.session.loggedIn = true;

          req.session.save(function (err: any) {
            if (err)
              res.redirect('/');
          })

          res.status(200).json({
            success: true,
            registered: true,
            wasLogged: false,
            triesExceeded: false,
          });
        }
        //se esta no BD mas senha esta errada
        else{
          res.status(200).json({
            success: false,
            registered: true,
            wasLogged: false,
            triesExceeded: false,
          });
        }
      } catch (err) {
          console.log(err);
          res.status(500).send(err);
      }
    }
  }
  return controller;
};
  