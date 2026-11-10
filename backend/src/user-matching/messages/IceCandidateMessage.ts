import { Message } from './message';
import { EventType } from '../types';

export class IceCandidateMessage extends Message<{ candidate: unknown }> {
  constructor(candidate: unknown) {
    super(EventType.ICE_CANDIDATE, { candidate });
  }
}
