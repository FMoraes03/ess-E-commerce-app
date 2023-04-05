module.exports = () => {
    const Item = require("../../models/itemModel")();
  
    const controller = {
      listProducts: async (req: any, res: any) => {
        /** Retorna todos o item */
        try {
          const id_produto: string = <string> req.params.id;
          const itens = await Item.findOne({id: id_produto}, { _id: false });
          res.json(itens);
        } catch (err) {
          res.status(500).send(err);
        }
      },

      createItem: async (req: any, res: any) => {
        try {
            const nome = req.body.nome;
            const itemDuplicado = await Item.findOne({ nome: nome });
            let faltaInfo = false;

            Object.keys(req.body).forEach((item) => {
              if (!req.body[item] || req.body[item] === ""){
                faltaInfo = true;
              }
            });
            
            if (faltaInfo) {
              console.log('Preencha todas as informações');
              res.status(400).json({message: "Preencha todos os campos!"});

            } else if (itemDuplicado) {
              res.status(400).json({ message: "Já existe um Item com esse titulo" });

            } else {
              console.log('Dados enviados!')
              const newItem = await Item.create(req.body);
              res.status(200).json(newItem);

            }

            faltaInfo = false;
        } catch (err) {
            res.status(500).send(err);
        }
    }

    //FAZER O DELETEITEM
    
    };
  
    return controller;
  };