import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, from, of, concat, fromEvent } from 'rxjs';
import { reduce, map, first, delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subscriptions: Array<Subscription> = [];

  ngOnInit() {
    // task #1: From an array emit items one by one [1,2,3];

    const arr = [1, 2, 3];
    console.log('task #1: from');
    const fromSub = from(arr)
      .subscribe((elem: number) => console.log(elem));
    this.subscriptions.push(fromSub);
    console.log('task #1: of');
    const ofSub = of(arr)
      .subscribe((arr: number[]) => {
        for (const elem in arr) { console.log(elem); } // fields
      });
    this.subscriptions.push(ofSub);

    // task #2: Combine the results and multiply them
    const getConversionRate$: Observable<number> = of(0.5);
    const getAmountToConvert$: Observable<number> = of(100);
    console.log('task #2: combine & multiply');
    const concatSub = concat(getConversionRate$, getAmountToConvert$)
      .pipe(
        reduce((acc: number, value: number) => acc * value, 1)
      )
      .subscribe((res: number) => console.log(res));
    this.subscriptions.push(concatSub);

    // task #3: Create an observable from window mouse clicks and show coordinates in console.
    console.log('task #3');
    const coordsSubscription = fromEvent<MouseEvent>(document, 'click')
      .subscribe((e: MouseEvent) =>
        console.log(`x-cords: ${e.screenX}`, `y-cords: ${e.screenY}`)
      );
    this.subscriptions.push(coordsSubscription);

    // task #4: Convert a promise to an observable
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('resolved!');
      }, 3000);
    });
    console.log('task #4: from promise');
    const timeoutSub = from(promise)
      .subscribe((res: string) => console.log('Async task #4 result: ', res));
    this.subscriptions.push(timeoutSub);

    // task #7: Get only first value from Observable.
    console.log('task #7: only first name');
    const firstFromSub = from(['Richard', 'Erlich', 'Dinesh', 'Gilfoyle'])
      .pipe(first())
      .subscribe((coder: string) => console.log(coder));
    this.subscriptions.push(firstFromSub);

    // task #8: Get value from Observable A, then emit Observable B
    const A$: Observable<number> = of(0.5).pipe(delay(1500));
    const B$: Observable<number> = of(100);
    console.log('task #8:');
    const withDelaySub = concat(A$, B$)
      .subscribe((val: number) => console.log(`task #8 async value: ${val}`));
    this.subscriptions.push(withDelaySub);
    console.log(this.subscriptions);
  }

  ngOnDestroy() {
    // Unsubscribe from Subscriptions
    this.subscriptions.forEach(
      (subscription: Subscription) => { subscription.unsubscribe(); }
    );
  }
}
