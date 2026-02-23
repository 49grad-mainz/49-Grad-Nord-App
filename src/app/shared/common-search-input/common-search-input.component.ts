import { Component } from '@angular/core';
import { FormControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { Observable, startWith } from "rxjs";

@Component({
    selector: 'app-common-search-input',
    templateUrl: './common-search-input.component.html',
    styleUrls: ['./common-search-input.component.scss'],
    standalone: false
})
export class CommonSearchInputComponent {
  control = new FormControl('');
  streets: string[] = [
    'Gitarre',
    'Bass',
    'Schlagzeug',
    'Keyboard',
    'Akkordeon',
    'Klavier',
    'Harfe',
    'Geige',
    'Violine',
    'Cello',
    'Flöte',
    'Saxophon',
    'Posaune',
    'Trompete',
    'Tuba',
    'Klarinette',
    'Oboe',
    'Fagott',
    'Querflöte',
    'Blockflöte',
    'Krummhorn',
    'Pauken',
    'Percussion',
    'Glockenspiel',
    'Xylophon',
  ];
  filteredStreets: Observable<string[]> | undefined;

  ngOnInit() {
    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.streets.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
}
