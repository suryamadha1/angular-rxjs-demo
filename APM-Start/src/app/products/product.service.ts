import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  filter,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  scan,
  shareReplay,
  Subject,
  switchMap,
  tap,
  throwError,
  toArray,
} from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';
  errorMessage: any;

  // products
  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    // tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  // map product with category names
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$,
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price! * 1.5,
            searchKey: [product.productName],
            category: categories.find((c) => product.categoryId === c.id)?.name,
          } as Product)
      )
    ),
    shareReplay(1),
    // tap(data => console.log('share', data))
  );

  // product selected subject
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  // selected product
  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find((product) => product.id === selectedProductId)
    ),
    shareReplay(1),
    tap((product) => console.log('selected Product ', product))
  );


  // selected product with suppliers
  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$,
  ]).pipe(
    map(([selectedProduct, suppliers]) =>
      suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id))
    ),
  );

  // get suppliers (Just in time approach)
  // one way
  // suppliersForSelectedProduct$ = this.selectedProduct$
  // .pipe(
  //   switchMap(
  //     product => 
  //     from(product?.supplierIds!)
  //     .pipe(
  //       mergeMap(
  //         supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)
  //       ),
  //       toArray()
  //     )
  //   )
  // );

  // Another way

  suppliersForSelectedProduct$ = this.selectedProduct$
  .pipe(
    filter(product =>  Boolean(product)),
    switchMap(
      product => {
        if(product?.supplierIds) {
          return forkJoin(
            product?.supplierIds?.map(supplierId => 
              this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)
            )!
          );
        }
        else {
          return of([]);
        }
      }
    ),
    tap(
      suppliers => console.log('suppliers ',suppliers)
    )
  );


  // product insertion
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$.pipe(
      concatMap((prod) => this.http.post<Product>(this.productsUrl, prod))
    )
  ).pipe(
    scan(
      (acc, value) => (value instanceof Array ? [...value] : [...acc, value]),
      [] as Product[]
    )
  );

  constructor(
    private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(data => console.log('Products: ', JSON.stringify(data))),
  //       catchError(this.handleError)
  //     );
  // }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
    };
  }

  selectedProductChanged(productId: number) {
    this.productSelectedSubject.next(productId);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }
}
