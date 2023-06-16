import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { ACHETER_CASHUPGRADE, ACHETER_PRODUIT, ENGAGER_MANAGER, GET_WORLD, LANCER_PRODUCTION } from './grapqhrequests';
import { Palier, Product } from 'world';

@Injectable({
  providedIn: 'root'
})
export class WebserviceService {
  server = 'http://localhost:4000';
  //server = 'https://isiscapitalistgraphql.kk.kurasawa.fr';
  user = '';
  constructor() { };
  createClient() {
    return createClient({
      url: this.server + "/graphql", fetchOptions: () => {
        return {
          headers: { 'x-user': this.user },
        };
      },
    });
  };
  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }

  lancerProduction(product: Product) {
    return this.createClient().mutation(LANCER_PRODUCTION, { id:
   product.id}).toPromise();
   }

   acheterProduit(product: Product, qt:number) {
    return this.createClient().mutation(ACHETER_PRODUIT, { id:
   product.id, quantite:qt}).toPromise();
   }

   engagerManager(manager:Palier) {
    return this.createClient().mutation(ENGAGER_MANAGER, {name:manager.name}).toPromise();
   }
   
   acheterCashUpgrade(upgrade:Palier) {
    return this.createClient().mutation(ACHETER_CASHUPGRADE, {name:upgrade.name}).toPromise();
   }
   
}
