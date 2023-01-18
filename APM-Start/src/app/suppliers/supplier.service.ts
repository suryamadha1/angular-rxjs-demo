import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { throwError, Observable, of, map, concatMap, tap, mergeMap, switchMap, shareReplay, catchError, delay, interval, take, share } from 'rxjs';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl)
    .pipe(
      tap(data => console.log('suppliers ', JSON.stringify(data))),
      shareReplay(1),
      catchError(this.handleError)
    )

  suppliersWithMap$ = of(1, 5, 8).pipe(
    map((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  suppliersWithConcatMap$ = of(1, 5, 8).pipe(
    // tap((id) => console.log('concatMap source observable ', id)),
    concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  suppliersWithMergeMap$ = of(1, 5, 8).pipe(
    // tap((id) => console.log('mergeMap source observable ', id)),
    mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );
  suppliersWithSwitchMap$ = of(1, 5, 8).pipe(
    // tap((id) => console.log('switchMap source observable ', id)),
    switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    // switchMap(item => of(item * 2))
  );



  constructor(private http: HttpClient) {
    // this.suppliersWithConcatMap$.subscribe(
    //   item => console.log('concatMap result ', item)
    // );

    // this.suppliersWithMergeMap$.subscribe(
    //   item => console.log('mergeMap result ', item)
    // );

    // this.suppliersWithSwitchMap$.subscribe(
    //   item => console.log('switchMap result ', item)
    // );
    // this.suppliersWithMap$.subscribe((o) =>
    //   o.subscribe((item) => console.log('map result ', item))
    // );


    // const source = of(2000, 1000);
    // // map value from source into inner observable, when complete emit result and move to next
    // const example = source.pipe(
    //   switchMap(val => of(`Delayed by: ${val}ms`).pipe(delay(val)))
    // );
    // //output: With concatMap: Delayed by: 2000ms, With concatMap: Delayed by: 1000ms
    // const subscribe = example.subscribe(val =>
    //   console.log(`With concatMap: ${val}`)
    // );

    // subscribe;

    // const source = interval(1000).pipe(
    //   tap(x => console.log('Processing: ', x)),
    //   map(x => x * x),
    //   take(6),
    //   share()
    // );
     
    // source.subscribe(x => console.log('subscription 1: ', x));
    // source.subscribe(x => console.log('subscription 2: ', x));

    // const shared$ = interval(2000).pipe(
    //   take(6),
    //   shareReplay(1)
    // );
     
    // shared$.subscribe(x => console.log('sub A: ', x));
    // shared$.subscribe(y => console.log('sub B: ', y));
     
    // setTimeout(() => {
    //   shared$.subscribe(y => console.log('sub C: ', y));
    // }, 11000);

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
