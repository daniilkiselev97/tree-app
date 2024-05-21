import { Directive, ElementRef, Input, OnChanges, AfterViewInit, AfterViewChecked, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[highlight]'
})
export class HighlightDirective implements OnChanges, AfterViewInit, AfterViewChecked {
  @Input('highlight') searchTerm: string = '';

  private previousSearchTerm: string = '';

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['searchTerm']) {
      this.highlightText();
    }
  }

  ngAfterViewInit(): void {
    this.highlightText();
  }

  ngAfterViewChecked(): void {
    if (this.previousSearchTerm !== this.searchTerm) {
      this.highlightText();
      this.previousSearchTerm = this.searchTerm;
    }
  }

	private highlightText(): void {
    const textContent = this.el.nativeElement.textContent;
    if (this.searchTerm && textContent) {
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        const highlightedContent = textContent.replace(regex, '<span class="highlight">$1</span>');
        this.el.nativeElement.innerHTML = highlightedContent;
    }
}

}



