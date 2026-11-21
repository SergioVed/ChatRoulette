import { Message } from './message';
import { EventType } from '../types';

export class OfferAnswerMessage extends Message<{ description: unknown }> {
  constructor(event: EventType.OFFER | EventType.ANSWER, description: unknown) {
    super(event, { description });
  }
}
