import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[highlight]'
})
export class HighlightDirective implements OnInit {
  @Input('highlight') searchTerm: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.searchTerm) {
      const regex = new RegExp(`(${this.searchTerm})`, 'gi');
      const htmlContent = this.el.nativeElement.innerHTML;
      const highlightedContent = htmlContent.replace(regex, '<span class="highlight">$1</span>');
      this.el.nativeElement.innerHTML = highlightedContent;
    }
  }
}
