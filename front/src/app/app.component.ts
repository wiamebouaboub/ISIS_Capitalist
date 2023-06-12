import { Component } from '@angular/core';
import { Product, World, Pallier } from 'world';
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

  onProductBuy(event: { cout: number }) {
    this.world.money -= event.cout;
    this.updateBadgeManagers();

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

  hireManager(manager: Pallier) {
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
}
