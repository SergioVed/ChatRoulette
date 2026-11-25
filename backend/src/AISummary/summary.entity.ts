import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('summaries')
export class Summary {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    text!: string;

    @Column({ type: 'uuid' })
    skillId!: string;

    @Column({ type: 'uuid' })
    userId!: string;
}
