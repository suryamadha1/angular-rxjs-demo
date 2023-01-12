import { Component, ChangeDetectionStrategy } from '@angular/core';

import { catchError, EMPTY, Subject, Subscription } from 'rxjs';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();
  selectedProductId = 0;

  

  products$ = this.productService.productsWithCategory$
  .pipe(
      catchError( err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );


  selectedProduct$ = this.productService.selectedProduct$;

  sub!: Subscription;

  constructor(private productService: ProductService) { }


  onSelected(productId: number): void {
    this.productService.selectedProductChanged(+productId);
  }
}
