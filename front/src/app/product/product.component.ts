import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product,  Palier } from 'world';
import { Orientation } from '../myprogressbar.component';
import { WebserviceService } from '../webservice.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  world: any;
  product!: Product;
  manager!:Palier;
  run = false;
  auto = false;
  orientation = Orientation.horizontal;
  lastUpdate = Date.now();
  initialValue = 0;
  progressBarValue: number | undefined;
  argentProduit:number=0

  
  @Input()
  set prod(value: Product) {
    this.product = value;

  }

  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    if (this._qtmulti && this.product) this.calcMaxCanBuy();
  }
  _qtmulti!: string;

  @Input()
  set money(value: number) {
    this._money = value;
    this.calcMaxCanBuy();
  }
  _money: number = 0;

  qt: number = 0;
  coutQt: number = 0;
  @Output() notifyProduction: EventEmitter<{ p: Product, qt: number }> = new
    EventEmitter();

  @Output() notifyBuy: EventEmitter<{p:Product, cout: number }> = new
    EventEmitter();


  constructor(public service: WebserviceService) {
    setInterval(() => {
      this.calcScore()
    }, 100);

  }

  startFabrication() {
    if(this.product.quantite>0){
      this.auto = false;
      this.product.timeleft = this.product.vitesse;
      this.run = true;
      this.service.lancerProduction(this.product);
    }
  }

  calcnbrproduction(product: Product, elapsetime: number): number {
    let production = 0
    if (product.timeleft > 0) {
      if (product.timeleft > elapsetime) {
        product.timeleft -= elapsetime
      }
      else {
        if (product.managerUnlocked) {
          production = 1 + Math.floor((elapsetime - product.timeleft) / product.vitesse)
          product.timeleft = product.vitesse - ((elapsetime - product.timeleft) % product.vitesse)
        } else {
          production = 1
          product.timeleft = 0
        }
      }
    }
    return production;

  }

  calcScore() {

    const elapsetime = Date.now() - this.lastUpdate;
    const nbrprod = this.calcnbrproduction(this.product, elapsetime)
    if (nbrprod > 0 && !this.product.managerUnlocked) { this.run = false;
    }
    if(this.product.managerUnlocked){
      this.run=true;
      this.auto=true;
      
    }
    this.notifyProduction.emit({ p: this.product, qt: nbrprod });

    let newTimeLeft = this.product.timeleft - elapsetime;

    if (newTimeLeft <= 0) {
      newTimeLeft = 0;
      this.progressBarValue = 0;
    } else {
      this.progressBarValue = ((this.product.vitesse - newTimeLeft) / this.product.vitesse) * 100;
    }
    this.lastUpdate = Date.now()
  }

  
  calcMaxCanBuy() {
    const cout = this.product.cout;
    const croissance = this.product.croissance;
    const money = this._money;
    if (this._qtmulti !== 'Max') {
      const multiplier = parseFloat(this._qtmulti.substr(1));
      this.coutQt = cout * (1 - Math.pow(croissance, multiplier)) / (1 - croissance);
      this.qt = Math.round(multiplier);
    } else {
      this.qt = Math.round((Math.log(1 - (money * (1 - croissance) / cout)) / Math.log(croissance)))
      this.coutQt = cout * (1 - Math.pow(croissance, this.qt)) / (1 - croissance)
    }
  }

  acheterProduit() {
    if (this._money >= this.coutQt) {
      this._money -= this.coutQt
      this.product.quantite += this.qt
      this.notifyBuy.emit({p:this.product, cout: this.coutQt });
      this.product.cout = this.product.cout * Math.pow(this.product.croissance, this.product.quantite)
      this.service.acheterProduit(this.product,this.qt);
      console.log(this._money)
    }
  }

  calculeArgentProduit(): void {
    if (this.product && this.product.quantite !== undefined && this.product.revenu !== undefined) {
      this.argentProduit = this.product.quantite * this.product.revenu;
    } else {
      this.argentProduit = 0;
    }
  }

}




