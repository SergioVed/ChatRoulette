import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Skill } from '../skills/skill.entity';
import { User } from '../users/user.entity';

@Entity('calls')
export class Call {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userOneId!: string;

    @Column({ type: 'uuid' })
    userTwoId!: string;

    @Column({ type: 'uuid' })
    skillId!: string;

    @Column({ type: 'timestamptz' })
    startedAt!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    endedAt!: Date | null;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userOneId' })
    userOne!: Relation<User>;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userTwoId' })
    userTwo!: Relation<User>;

    @ManyToOne(() => Skill, { nullable: false })
    @JoinColumn({ name: 'skillId' })
    skill!: Relation<Skill>;
}
