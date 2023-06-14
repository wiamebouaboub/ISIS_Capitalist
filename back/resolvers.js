const { products } = require("./world")
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
      saveWorld(context)
      return product;

    },
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
    }
  },
};




function updateScore(world) {

  const elapsedTime = Date.now() -parseInt(world.lastupdate);

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
        } else {
          production = 1
          product.timeleft = 0
          world.money += product.quantite * product.revenu *production 
        }
      }
    }
    return production;

  }




    /*if (product.managerUnlocked) {
      const productionTime = product.timeleft;
      let numProductions = Math.floor(elapsedTime / productionTime);

      if (numProductions > 0) {
        // Mettre à jour le score en fonction du nombre de productions complètes
        world.setMoney(world.getMoney() + product.gains * numProductions);

        // Mettre à jour le temps restant pour la prochaine production
        const remainingTime = elapsedTime % productionTime;
        product.timeleft = product.vitesse - remainingTime;
      }
    } else if (product.timeleft > 0) {
      // Mettre à jour le temps restant pour la prochaine production
      product.timeleft = Math.max(product.timeleft - elapsedTime, 0);
    }*/
  }





/*calcScore(parent, args, context) {
  const elapsedTime = Date.now() - context.world.lastUpdate;
  context.world.lastUpdate = Date.now();
 
  // Pour chaque produit
  context.world.products.forEach(product => {
    const manager = context.world.managers.find(m => m.product === product.id);
    let numProduced = 0;
 
    // Si le produit a un manager, on calcule combien de fois sa production complète a pu se produire depuis la dernière mise à jour
    if (manager) {
      const timePerCycle = product.vitesse / manager.boost;
      numProduced = Math.floor(elapsedTime / timePerCycle);
      product.timeleft = Math.max(product.timeleft - elapsedTime + numProduced * timePerCycle, 0);
    }
    // Sinon on calcule le nombre de produits créés
    else if (product.timeleft > 0) {
      const timePerProduct = product.vitesse;
      numProduced = Math.floor(elapsedTime / timePerProduct);
      product.timeleft = Math.max(product.timeleft - elapsedTime + numProduced * timePerProduct, 0);
    }
 
    // On ajoute les gains au score
    const earnings = numProduced * product.cout / 2;
    // On suppose que le prix de vente est égal à la moitié du coût d'achat
    context.world.score += earnings;
  });
}*/



