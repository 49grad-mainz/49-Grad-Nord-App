import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { environment } from "../../../environments/environment";

@Component({
    selector: 'app-datenschutz',
    imports: [],
    templateUrl: './datenschutz.component.html',
    styleUrls: ['./datenschutz.component.scss']
})
export class DatenschutzComponent implements OnInit {
  protected datenschutzText = environment.datenschutz;

  constructor(
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.route.fragment.pipe(
      filter(fragment => !!fragment)
    ).subscribe(fragment => {
      // Attempt to scroll to the element after a brief delay
      // assert fragement is defined
      if (typeof fragment !== 'string') {
        return;
      }
      setTimeout(() => this.viewportScroller.scrollToAnchor(fragment), 100);
    });
  }
}
