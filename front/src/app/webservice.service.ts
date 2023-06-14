import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { GET_WORLD } from './grapqhrequests';

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
}
