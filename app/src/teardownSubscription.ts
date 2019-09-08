import { Subscription } from "rxjs"

const teardownSubscription = (subscription: Subscription, m: any) => {
    if (m.hot) {
        m.hot.dispose(() => {
            subscription.unsubscribe();
        });
    }
}

export {teardownSubscription};