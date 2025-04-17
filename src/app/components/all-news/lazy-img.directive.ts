import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[lazyImg]',
  standalone: true
})
export class LazyImgDirective implements OnInit {
  @Input() lazyImg!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.setAttribute(this.el.nativeElement, 'src', this.lazyImg);
          observer.disconnect();
        }
      });
    });
    observer.observe(this.el.nativeElement);
  }
}
