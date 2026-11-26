import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Call } from '../calls/call.entity';

@Entity('summaries')
export class Summary {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    text!: string;

    @Column({ type: 'uuid' })
    callId!: string;

    @OneToOne(() => Call, { nullable: false })
    @JoinColumn({ name: 'callId' })
    call!: Relation<Call>;
}
