import {App, AppPlugin, BackButtonListenerEvent} from "@capacitor/app";
import {PriorityQueue, PriorityQueueType} from "@ssibrahimbas/core";

export type NextFunction = () => void;
export type CallbackFunction = (event: BackButtonListenerEvent, next: NextFunction) => any | Promise<any>;

export interface BackButtonListener {
    /**
     * @description unique key backbutton listener
     * @used Required for the unsubscribe method
     * @since 0.0.1
     * */
    unique: string;

    /**
     * @description Determines the priority order of this function. If you enter 99 and you have another function with the value 100, your function with the value 99 will not run until the function with the value 100 calls next function.
     * @since 0.0.1
     * */
    priority: number;

    /**
     * @description Your function to call when the back button event is called.
     * @warning If your callback does not call the next function, the event will not continue to run. Call next if you want the event to go to other listeners.
     * @since 0.0.1
     * */
    callback: CallbackFunction;
}

export interface IBackButtonHardware {
    name: string;

    /**
     * @description required @capacitor/app plugin
     * @since 0.0.1
     * */
    $app: AppPlugin;

    /**
     * @description starts listening for backbutton event
     * @since 0.0.1
     * */
    listen: () => void;

    /**
     * @description add listener to backbutton priority queue
     * @params {EventListener} eventListener
     * @since 0.0.1
     * */
    subscribe: (eventListener: BackButtonListener) => void;

    /**
     * @description remove listener from the backbutton priority queue
     * @params {EventListener} eventListener
     * @since 0.0.1
     * */
    unsubscribe: (eventListener: BackButtonListener) => void;
}

export class BackButtonHardware implements IBackButtonHardware {
    name : string = "backButton";
    $app: AppPlugin;
    private $queue!: PriorityQueueType<BackButtonListener>;

    constructor(app: AppPlugin) {
        this.$app = app;
        this.initQueue();
    }

    listen(): void{
        this.$app.addListener("backButton", (event: BackButtonListenerEvent) => {
            this.publishEvent(event);
        });
    }

    private initQueue() : void  {
        this.$queue = new PriorityQueue<BackButtonListener>(BackButtonHardware.sortByPriority);
    }

    private static sortByPriority(a: BackButtonListener, b: BackButtonListener) :number {
        return b.priority - a.priority;
    };

    subscribe(eventListener: BackButtonListener) {
        this.$queue.enqueue(eventListener);
    }

    unsubscribe(eventListener: BackButtonListener) {
        const index : number = this.$queue.toArray().findIndex(e => e.unique === eventListener.unique);
        if(index !== -1) {
            this.$queue.dequeue(index);
        }
    }

    private publishEvent(event: BackButtonListenerEvent) : void {
        const eventQueue : PriorityQueueType<BackButtonListener> = this.$queue.clone();
        this.emitEvent(event, eventQueue);
    }

    private emitEvent(event: BackButtonListenerEvent, queue: PriorityQueueType<BackButtonListener>) : void {
        const listener : BackButtonListener | undefined = queue.dequeue();
        if(listener) {
            listener.callback(event, () => {
                this.emitEvent(event, queue);
            })
        }
    }
}