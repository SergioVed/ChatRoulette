import {EventType} from "../types";


export class Message<D> {
    public event!: EventType
    public data!: D

    constructor(event: EventType, data: D) {
        this.data = data;
        this.event = event
    }
}