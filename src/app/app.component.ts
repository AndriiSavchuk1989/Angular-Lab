import { Component, OnInit, OnDestroy } from '@angular/core';
import {Observable, Subscription, from, of, concat, fromEvent, Observer} from 'rxjs';
import {reduce, map, first, delay, filter, mergeMap} from 'rxjs/operators';
import User from './user';

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

    // task #5: Simple 'hot' and 'cold' Observable
    // cold
    const cold: Observable<number> = Observable
      .create((observer: Observer<number>) => {
        observer.next(Math.random());
      });
    console.log('task5: cold observable');
    // subscription 1
    const coldSub1 = cold.subscribe((data) => {
      console.log(`cold #1: ${data}`);
    });
    // subscription 2
    const coldSub2 = cold.subscribe((data) => {
      console.log(`cold #2: ${data}`);
    });
    this.subscriptions.push(coldSub1);
    this.subscriptions.push(coldSub2);
    // hot
    const rand: number = Math.random();
    const hotObs: Observable<number> = Observable.create((observer) => {
      observer.next(rand);
    });
    console.log('task5: hot observable');
    // subscription 1
    const hotSubscription1 = hotObs.subscribe((data) => {
      console.log(`hot #1: ${data}`);
    });
    // subscription 2
    const hotSubscription2 = hotObs.subscribe((data) => {
      console.log(`hot #2: ${data}`);
    });
    this.subscriptions.push(hotSubscription1);
    this.subscriptions.push(hotSubscription2);

    // task #6: Create observable of array, map each value to logarithm and show result in console [10, 100, 1000]
    const arr2: Array<number> = [10, 100, 1000];
    console.log('task #6: map each value to logarithm');
    const lgSubscription = from(arr2)
      .pipe(
        map((val: number) => Math.log10(val))
      )
      .subscribe((lgVal: number) => console.log(lgVal));
    this.subscriptions.push(lgSubscription);

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

    // task #9: Get values while the 'name' length === 5
    const names: Observable<string> = of('Sharon', 'Sue', 'Sally', 'Steve');
    console.log('task #9: filter array of names');
    const strFilterSub = names
      .pipe(
        filter((name: string) => name.length === 5)
      )
      .subscribe((name: string) => console.log(name));
    this.subscriptions.push(strFilterSub);

    // task #10: handling error and show previous results in console
    const observable: Observable<string> = Observable
      .create((observer: Observer<string>) => {
        observer.next('A');
        observer.next('B');
        observer.next('C');
        throw Error('catch!');
        observer.next('D');
      });
    console.log('task #10: with error thrown');
    const withErrorSubscription = observable
      .subscribe(
        (D: string) => console.log(`D: ${D}`),
        (error: string) => console.log(`error thrown: ${error}`)
      );
    this.subscriptions.push(withErrorSubscription);

    // task #11:
    const users: Array<User> = [
      { user: 1, name: 'A1', delay: 100 }, // should be shown
      { user: 1, name: 'A2', delay: 1500 }, // shouldn't be shown
      { user: 1, name: 'A3', delay: 2500 }, // shouldn't be shown
      { user: 1, name: 'A4', delay: 3500 }, // should be shown
      { user: 2, name: 'B1', delay: 200 }, // should be shown
      { user: 2, name: 'B2', delay: 300 }, // shouldn't be shown
      { user: 2, name: 'B3', delay: 3500 }, // should be shown
    ];
    console.log('task11:');
    const setOfDistinct = new Map<number, number>();
    const notificationsSubscription = from(users)
      .pipe(
        mergeMap((user: User) => {
          return of(user)
            .pipe(
              delay(user.delay),
              map((item: User) => {
                const { user, delay } = item;
                if (setOfDistinct[user] && delay - setOfDistinct[user] <= 3000) { return null; }
                setOfDistinct[user] = delay;
                return item;
              }),
              filter((item: User) => item !== null)
            );
        })
      )
      .subscribe((notification: Notification) => console.log(`task11 async item: `, notification));
    this.subscriptions.push(notificationsSubscription);
  }
  ngOnDestroy() {
    // Unsubscribe from Subscriptions
    this.subscriptions.forEach(
      (subscription: Subscription) => { subscription.unsubscribe(); }
    );
  }
}
