const { products, upgrades } = require("./world")
const fs = require('fs');

function saveWorld(context) {
  fs.writeFile("userworlds/" + context.user + "-world.json",
    JSON.stringify(context.world), err => {
      if (err) {
        console.error(err)
        throw new Error(`Erreur d'écriture du monde coté serveur`)
      }
    })
}

module.exports = {
  Query: {
    getWorld(parent, args, context, info) {
      updateScore(context.world)
      saveWorld(context)
      return context.world
    }
  },
  Mutation: {
    acheterQtProduit(parent, args, context) {
      updateScore(context.world)
      const product = context.world.products.find((p) => p.id === args.id);
      if (!product) {
        throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
      }
      const world = context.world;
      const croissance = product.croissance;
      const money = world.money;
      const coutQt = product.cout * (1 - Math.pow(croissance, args.quantite)) / (1 - croissance);;

      if (money >= coutQt) {
        world.money = money - coutQt;
        product.quantite += args.quantite;

        product.cout = product.cout * Math.pow(croissance, product.quantite);
      }
      UnlockProduct(product)
      saveWorld(context)
      return product;
    }
    ,
    lancerProductionProduit(parent, args, context) {
      updateScore(context.world)

      // Recherche du produit dans le monde
      const product = context.world.products.find((p) => p.id === args.id);
      if (!product) {
        throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
      }

      // Affectation de la propriété vitesse à la propriété timeleft
      product.timeleft = product.vitesse;
      saveWorld(context);
      return product;
    },
    engagerManager(parent, args, context) {
      updateScore(context.world)

      // Recherche du manager dans le monde
      const manager = context.world.managers.find((m) => m.name === args.name);
      if (!manager) {
        throw new Error(`Le manager "${args.name}" n'existe pas`);
      }

      // Recherche du produit géré par le manager dans le monde
      const product = context.world.products.find(p => p.id === manager.idcible);
      if (!product) {
        throw new Error(`Le manager "${args.name}" ne gère aucun produit`);
      }
      const money = context.world.money;
      // Déblocage du manager et du produit
      if (money >= manager.seuil) {
        product.managerUnlocked = true;
        manager.unlocked = true;
        product.timeleft = product.vitesse;
        context.world.money -= manager.seuil;
      }
      saveWorld(context);
      return manager;
    },
    acheterCashUpgrade(parent, args, context) {
      updateScore(context.world)
      let upgrade = context.world.upgrades.find((u) => u.name == args.name);
      if (!upgrade) {
        throw new Error(`L'upgrade de nom ${args.name} n'existe pas.`);
      }
      let money = context.world.money;
      let products = context.world.products;
      if (money >= upgrade.seuil) {
        money -= upgrade.seuil;
      };

      if (upgrade.idcible == -1) {
          for (let i = 0; i < products.length; i++) {
            if (upgrade.typeratio === "vitesse") {
              products[i].timeleft /= upgrade.ratio;
              products[i].vitesse /= upgrade.ratio;
            }
            else if (upgrade.typeratio === "gain") {
              products[i].revenu *= upgrade.ratio
            }
          }
        } 
        else {
          for (let i = 0; i < products.length; i++) {
            if (upgrade.idcible == products[i].id) {
              if (upgrade.typeratio === "vitesse") {
                products[i].timeleft /= upgrade.ratio;
                products[i].vitesse /= upgrade.ratio;
              }
              else if (upgrade.typeratio === "gain") {
                products[i].revenu *=2
                products[i].revenu
                upgrade.unlocked = true;
                
                //products[i].revenu *= upgrade.ratio
                
              }
            }
          }
        }upgrade.unlocked = true;
        saveWorld(context);
        return upgrade;
        
      } 
      
    },
  }
;





function updateScore(world) {

  const elapsedTime = Date.now() - parseInt(world.lastupdate);

  //world.lastUpdate = currentTime;

  for (const product of world.products) {

    let production = 0
    if (product.timeleft > 0) {
      if (product.timeleft > elapsedTime) {
        product.timeleft -= elapsedTime

      }
      else {
        if (product.managerUnlocked) {
          production = 1 + Math.floor((elapsedTime - product.timeleft) / product.vitesse)
          product.timeleft = product.vitesse - ((elapsedTime - product.timeleft) % product.vitesse)
          world.money += product.quantite * product.revenu * production
          world.score += product.quantite * product.revenu * production
        } else {
          production = 1
          product.timeleft = 0
          world.money += product.quantite * product.revenu * production
          world.score += product.quantite * product.revenu * production
        }
      }
    }
    return production;

  }

}

function appliquerPalier(product, paliers) {

  paliers.unlocked = true;
  if (paliers.typeratio == "vitesse") {
    product.timeleft /= paliers.ratio;
    product.vitesse /= paliers.ratio;
  }
  else if (paliers.typeratio == "gain") {
    product.revenu *= paliers.ratio
  }
}

function UnlockProduct(product) {
  //p= context.world.product
  for (let i = 0; i < product.paliers.length; i++) {
    if (product.quantite >= product.paliers[i].seuil) {
      appliquerPalier(product, product.paliers[i])
    }

  }
}









