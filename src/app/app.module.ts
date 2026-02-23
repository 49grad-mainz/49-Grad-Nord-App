import { isDevMode, NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GlobalErrorHandler } from './core/global-error-handler';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { environment } from '../environments/environment';
import { MainDashboardComponent } from './core/main-dashboard/main-dashboard.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from './core/login/login.component';
import { LoginWithGoogleComponent } from './core/login/login-with-google/login-with-google.component';
import {
  LoginWithEmailAndPasswordComponent
} from './core/login/login-with-email-and-password/login-with-email-and-password.component';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatInputModule } from "@angular/material/input";
import { WaitingRoomComponent } from './core/login/waiting-room/waiting-room.component';
import { AboutWohnfeldComponent } from './core/about-wohnfeld/about-wohnfeld.component';
import { CommonSharedModule } from "./shared/common-shared.module";
import { StoreModule } from '@ngrx/store';
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { UserProfileComponent } from './core/user-profile/user-profile.component';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import {
  RegisterWithEmailAndPasswordComponent
} from "./core/login/register-with-email-and-password/register-with-email-and-password.component";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MobilityModule } from './mobility/mobility.module';

// Import AngularFire compat modules
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

// Import newer Firebase modules for compatibility
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from "@angular/material/core";
// import { NgxMatTimepickerModule } from "ngx-mat-timepicker";

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

@NgModule({
  declarations: [
    AppComponent,
    MainDashboardComponent,
    LoginComponent,
    LoginWithGoogleComponent,
    LoginWithEmailAndPasswordComponent,
    WaitingRoomComponent,
    AboutWohnfeldComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    // Initialize AngularFire compat version
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    AngularFireMessagingModule,
    AngularFireStorageModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSnackBarModule,
    CommonSharedModule,
    StoreModule.forRoot({}, {}),
    MatDialogModule,
    MatSelectModule,
    MatTabGroup,
    MatTab,
    RegisterWithEmailAndPasswordComponent,
    FormsModule,
    MatSlideToggle,
    MatProgressSpinner,
    // NgxMatTimepickerModule
    MobilityModule
  ],
  providers: [
    // Add both types of Firebase providers to ensure compatibility
    // Newer style Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
