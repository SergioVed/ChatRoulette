import {Message} from "./message";
import {ErrorCode, EventType} from "../types";


export class ErrorMessage extends Message<{code: ErrorCode}> {
    constructor(code: ErrorCode) {
        super(EventType.ERROR, {code: code});
    }
}