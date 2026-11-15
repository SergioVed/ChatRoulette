import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    OneToMany,
} from 'typeorm';
import { UserSkill } from '../user-skills/user-skill.entity';

@Index('UQ_users_normalized_email', { synchronize: false })
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false })
    passwordHash!: string | null;

    @Column({ type: 'boolean', default: false })
    onboardingCompleted!: boolean;

    @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
    userSkills?: UserSkill[];
}
