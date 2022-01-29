import {App, AppPlugin, BackButtonListenerEvent} from "@capacitor/app";
import {PriorityQueue, PriorityQueueType} from "@ssibrahimbas/core";

export type NextFunction = () => void;
export type CallbackFunction = (event: BackButtonListenerEvent, next: NextFunction) => any | Promise<any>;

export interface BackButtonListener {
    unique: string;
    priority: number;
    callback: CallbackFunction;
}

export interface IBackButtonHardware {
    name: string;
    $app: AppPlugin;

    listen: () => void;
    subscribe: (eventListener: BackButtonListener) => void;
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