import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[appChildRouterPadding]',
    standalone: false
})
export class ChildRouterPaddingDirective implements AfterViewInit{

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.style.padding = '12px';
  }

}
