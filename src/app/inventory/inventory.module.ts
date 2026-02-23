import { LOCALE_ID, NgModule } from "@angular/core";
import { InventoryRoutingModule } from "./inventory-routing.module";
import { registerLocaleData } from "@angular/common";
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';


@NgModule({
  declarations: [

  ],
  imports: [
    InventoryRoutingModule
  ],
  exports: [],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' }
  ],
  bootstrap: []
})
export class InventoryModule {
  constructor() {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);
  }
  // This module is currently empty, but can be expanded in the future
  // to include components, services, and other features related to inventory management.
}
