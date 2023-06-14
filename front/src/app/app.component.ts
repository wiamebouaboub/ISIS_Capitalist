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


  
  constructor(private service: WebserviceService,private snackBar: MatSnackBar) {
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
      product.managerUnlocked=true;
      manager.unlocked = true;
      product.timeleft = product.vitesse;
      this.world.money -= manager.seuil;
      const message = 'Vous avez embauché un nouveau manager !';
      this.popMessage(message);
    }
  }

  updateBadgeManagers() {
    const managers = this.world.managers;
    const availableManagers = managers.filter(manager => manager.seuil <= this.world.money && !manager.unlocked);
    this.badgeManagers = availableManagers.length;
  }

 debloqueUnlocked(p:Product) {
  for (let i = 0; i < p.paliers.length; i++) {
  if (!p.paliers[i].unlocked) {
      if(p.quantite>=p.paliers[i].seuil){
        p.paliers[i].unlocked=true;
        p.timeleft/=2;
        p.vitesse/=2;
      }
    }
  }
  }

  afficherUnlocked() {
    this.showUnlockeds = !this.showUnlockeds;
  }

  /*const availableUnlocked = managers.filter(manager => manager.seuil <= this.world.money && !manager.unlocked);
  */
}
