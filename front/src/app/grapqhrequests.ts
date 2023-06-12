import { gql } from "@urql/core";

export const GET_WORLD = gql`
query getWorld {
  getWorld {
   name
   logo
   money
   score
   totalangels
   activeangels
   angelbonus
   lastupdate
   products {
     id
     name
     logo
     cout
     croissance
     revenu
     vitesse
     quantite
     timeleft
     managerUnlocked
     paliers {
       name
       logo
       seuil
       idcible
       ratio
       typeratio
       unlocked
     }
   }
   allunlocks {
     name
     logo
     seuil
     idcible
     ratio
     typeratio
     unlocked
   }
   upgrades {
     name
     logo
     seuil
     idcible
     ratio
     typeratio
     unlocked
   }
   angelupgrades {
     name
     logo
     seuil
     idcible
     ratio
     typeratio
     unlocked
   }
   managers {
     name
     logo
     seuil
     idcible
     ratio
     typeratio
     unlocked
   }
 }
 }
   ` ;
