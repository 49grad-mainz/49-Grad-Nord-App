import { NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes, withViewTransitions } from '@angular/router';
import { MainDashboardComponent } from "./core/main-dashboard/main-dashboard.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { LoginComponent } from "./core/login/login.component";
import { WaitingRoomComponent } from "./core/login/waiting-room/waiting-room.component";
import { UserConfirmedGuard } from "./core/guards/user-confirmed.guard";
import { AboutWohnfeldComponent } from "./core/about-wohnfeld/about-wohnfeld.component";
import { UserProfileComponent } from './core/user-profile/user-profile.component';
import {
  AccountDeletionConfirmationComponent
} from "./core/account-deletion-confirmation/account-deletion-confirmation.component";
import { ImpressumComponent } from "./info/impressum/impressum.component";
import { DatenschutzComponent } from "./info/datenschutz/datenschutz.component";
import { AppNewsUpdatesComponent } from "./core/app-news-updates/app-news-updates.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: MainDashboardComponent, canActivate: [AuthGuard, UserConfirmedGuard] },
  { path: 'waiting-room', component: WaitingRoomComponent },
  { path: 'about', component: AboutWohnfeldComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard, UserConfirmedGuard] },
  { path: 'app-news', component: AppNewsUpdatesComponent, canActivate: [AuthGuard, UserConfirmedGuard] },
  { path: 'till-next-time', component: AccountDeletionConfirmationComponent },
  {
    path: 'waschen',
    loadChildren: () => import('./waschen/waschen.module').then(m => m.WaschenModule)
  },
  {
    path: 'coworking',
    loadChildren: () => import('./coworking/coworking.module').then(m => m.CoworkingModule)
  },
  {
    path: 'mein-haushalt',
    loadChildren: () => import('./mein-haushalt/mein-haushalt.module').then(m => m.MeinHaushaltModule)
  },
  {
    path: 'gemeinschafts-haushalt',
    loadChildren: () => import('./gemeinschafts-haushalt/gemeinschafts-haushalt.module').then(m => m.GemeinschaftsHaushaltModule)
  },
  {
    path: 'raumbelegung',
    loadChildren: () => import('./raumbelegung/raumbelegung.module').then(m => m.RaumbelegungModule)
  },
  {
    path: 'mobility',
    loadChildren: () => import('./mobility/mobility.module').then(m => m.MobilityModule)
  },
  // {
  //   path: 'inventory',
  //   loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule)
  // },
  // {
  //   path: 'hausarbeiten',
  //   loadChildren: () => import('./hausarbeiten/hausarbeiten.module').then(m => m.HausarbeitenModule)
  // },
  {
    path: 'impressum',
    component: ImpressumComponent
  },
  {
    path: 'datenschutz',
    component: DatenschutzComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes, withViewTransitions()),
  ]
})
export class AppRoutingModule {
}
