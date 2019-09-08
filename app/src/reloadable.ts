import RxJS from "rxjs";

export default abstract class Reloadable {
  subscriptions: RxJS.Subscription[] = [];

  abstract init(): void;

  subscribe<T>(observable: RxJS.Observable<T>, listener: (arg: T) => any) {
    const subscription = observable.subscribe(listener);
    this.subscriptions.push(subscription);

    return subscription;
  }

  setReloadHook(m: any) {
    if (m.hot) {
      m.hot.dispose(() => this.destroy());
    }
  }

  destroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
