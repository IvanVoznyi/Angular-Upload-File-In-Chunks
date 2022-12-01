import {
  Directive,
  EventEmitter,
  Output,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { filter, fromEvent, map, merge, Subscription } from 'rxjs';

@Directive({
  selector: '[appDragDropFileUpload]',
})
export class DragDropFileUploadDirective implements OnInit, OnDestroy {

  @Output() fileDropped = new EventEmitter<FileList>();
  private subscription: Subscription | undefined;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.subscription = merge(
      fromEvent<DragEvent>(this.elementRef.nativeElement, 'dragover'),
      fromEvent<DragEvent>(this.elementRef.nativeElement, 'dragleave'),
      fromEvent<DragEvent>(this.elementRef.nativeElement, 'drop')
    )
      .pipe(
        map((event) => {
          event.preventDefault();
          event.stopPropagation();
          return event;
        }),
        map((event) => {
          if (event.type === 'dragover') {
            this.renderer.addClass(this.elementRef.nativeElement, 'drag-over')
          } else if (event.type === 'dragleave') {
            this.renderer.removeClass(this.elementRef.nativeElement, 'drag-over')
          }
          return event
        }),
        filter((event) => event.type === 'drop')
      )
      .subscribe((event) => {
        if (event.dataTransfer) {
          if(event.dataTransfer.files.length > 0) {
            this.fileDropped.emit(event.dataTransfer.files);
          }
          this.renderer.removeClass(this.elementRef.nativeElement, 'drag-over')
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
