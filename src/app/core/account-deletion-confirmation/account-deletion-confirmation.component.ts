import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-account-deletion-confirmation',
    imports: [
        RouterLink,
        MatButton
    ],
    templateUrl: './account-deletion-confirmation.component.html',
    styleUrl: './account-deletion-confirmation.component.scss'
})
export class AccountDeletionConfirmationComponent {

}
