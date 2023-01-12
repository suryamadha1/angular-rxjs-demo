import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

import { catchError, combineLatest, EMPTY, filter, map, Observable, of, startWith, Subject, Subscription } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories$ = this.productCategoryService.productCategories$
  .pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // subject demo
  private categorySelectedSubject = new Subject<number>();
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();


  // products: Product[] = [];
  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
    .pipe(
      startWith(0)
    )
  ])
  .pipe(
    map(
      ([products, selectedCategoryId]) => 
      products.filter(product =>  
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );


  sub!: Subscription;

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) { }


  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
