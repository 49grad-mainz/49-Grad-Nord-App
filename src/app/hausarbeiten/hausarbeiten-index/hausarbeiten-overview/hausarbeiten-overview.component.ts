import {Component} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

interface CleaningEntry {
  kw: number;
  flat: number;
}

@Component({
    selector: 'app-hausarbeiten-overview',
    templateUrl: './hausarbeiten-overview.component.html',
    styleUrls: ['./hausarbeiten-overview.component.scss'],
    imports: [CdkDropList, CdkDrag]
})
export class HausarbeitenOverviewComponent {
  public entries: CleaningEntry[] = [];

  constructor() {
    // Initialisiere die Einträge
    this.entries = Array(9).fill(0).map((_, index) => ({
      kw: index + 1,
      flat: index + 1
    }));
  }

  drop(event: CdkDragDrop<CleaningEntry[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Aktualisiere die KW-Nummern nach dem Verschieben
      this.entries = this.entries.map((entry, index) => ({
        ...entry,
        kw: index + 1
      }));
    }
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }
}
