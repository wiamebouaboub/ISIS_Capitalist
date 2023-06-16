import { Component } from '@angular/core';
import { Product, World, Palier } from 'world';
import { WebserviceService } from './webservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ISIS_Capitalist';
  world: World = new World();
  server: any;
  compteur = 0;
  showManagers: boolean = false;
  badgeManagers: number = 0;
  showUnlockeds: boolean = false;
  showCash: boolean = false;
  badgeCash: number = 0;




  
  constructor(public service: WebserviceService,private snackBar: MatSnackBar) {
    this.service.getWorld().then(
      world => {
        this.world = world.data.getWorld;
      });

  }
  popMessage(message : string) : void { this.snackBar.open(message, "", { duration : 3000 })}
  onProductionDone(event: { p: Product, qt: number }) {
    this.world.score += event.p.quantite * event.p.revenu * event.qt
    this.world.money += event.p.quantite * event.p.revenu * event.qt
    this.updateBadgeManagers();

  }

  onProductBuy(event: {p:Product, cout: number }) {
    this.world.money -= event.cout;
    this.updateBadgeManagers();
    this.debloqueUnlocked(event.p);
    console.log("vitesse"+event.p.vitesse)
  }

  qtmulti: string = 'x1';
  changeQtmulti() {
    switch (this.qtmulti) {
      case 'x1':
        this.qtmulti = 'x10';
        break;
      case 'x10':
        this.qtmulti = 'x100';
        break;
      case 'x100':
        this.qtmulti = 'Max';
        break;
      case 'Max':
        this.qtmulti = 'x1';
        break;
      default:
        this.qtmulti = 'x1';
        break;
    }


  }

  afficherManagers() {
    this.showManagers = !this.showManagers;
  }

  hireManager(manager: Palier) {
    if (this.world.money >= manager.seuil) {
      let product = this.world.products[manager.idcible - 1];
      if(product.quantite>=1){
      product.managerUnlocked=true;
      manager.unlocked = true;
      product.timeleft = product.vitesse;
      this.world.money -= manager.seuil;
      const message = 'Vous avez embauché un nouveau manager !';
      this.popMessage(message);
      this.service.engagerManager(manager);
      }
      else{
        const msg='Il faut acheter un produit pour pouvoir acheter le manager.'
        this.popMessage(msg);
      }
    }
    else{
      const msg='Vous n`avez pas assez d`argent pour acheter ce manager.'
      this.popMessage(msg)
    }
  }

  updateBadgeManagers() {
    const managers = this.world.managers;
    const availableManagers = managers.filter(manager => manager.seuil <= this.world.money && !manager.unlocked);
    this.badgeManagers = availableManagers.length;
  }

 debloqueUnlocked(p:Product) {
  for (let i = 0; i <= p.paliers.length; i++) {
  if (!p.paliers[i].unlocked) {
      if(p.quantite>=p.paliers[i].seuil){
        p.paliers[i].unlocked=true;
        if (p.paliers[i].typeratio == "vitesse") {
          p.timeleft/= p.paliers[i].ratio;
          p.vitesse/= p.paliers[i].ratio;
          }
          else if (p.paliers[i].typeratio == "gain") {
            p.revenu *= p.paliers[i].ratio
          }
      }
    }
  }
  }
  getNextFalseElement(product:Product): Palier  | undefined{
    return product.paliers.find((item) => item.unlocked === false);
  }

  afficherUnlocked() {
    this.showUnlockeds = !this.showUnlockeds;
  }

  afficherCashUpgrade() {
    this.showCash = !this.showCash;
  }

  updateBadgeCash() {
    const upgrades = this.world.upgrades;
    const availableCash = upgrades.filter(upgrade => upgrade.seuil <= this.world.money && !upgrade.unlocked);
    this.badgeCash = availableCash.length;
  }

  acheterCashUpgrades(upgrade: Palier){
    console.log("unlocked "+upgrade.unlocked)
    console.log("name "+upgrade.name)
    console.log("typeratio "+upgrade.typeratio)
    console.log(this.world.products[0].vitesse)
    if (this.world.money >= upgrade.seuil) {
      upgrade.unlocked = true;
      if (upgrade.idcible == -1) {
        for (let i = 0; i < this.world.products.length; i++) {
          if (upgrade.typeratio == "vitesse") {
            this.world.products[i].timeleft /= upgrade.ratio;
            this.world.products[i].vitesse /= upgrade.ratio;
          }
          else if (upgrade.typeratio == "gain") {
            this.world.products[i].revenu *= upgrade.ratio
          }
        }
      }
      else {
        debugger;
        let product=this.world.products[upgrade.idcible-1]
            if (upgrade.typeratio == 'vitesse') {
              product.timeleft /= upgrade.ratio;
              product.vitesse /= upgrade.ratio;
            }
            if (upgrade.typeratio == 'gain') {
              product.revenu*=upgrade.ratio
            }
          }
          console.log(upgrade.unlocked)
          console.log("name "+upgrade.name)
          console.log("typeratio "+upgrade.typeratio)
          console.log(this.world.products[0].vitesse)
    this.service.acheterCashUpgrade(upgrade);

    }
  } 
}

  /*const availableUnlocked = managers.filter(manager => manager.seuil <= this.world.money && !manager.unlocked);
  */

