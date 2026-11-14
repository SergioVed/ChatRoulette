import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Skill } from '../skills/skill.entity';
import { User } from '../users/user.entity';
import {UserSkillRole} from "./types";

@Entity('user_skills')
export class UserSkill {
    @PrimaryColumn('uuid')
    userId!: string;

    @PrimaryColumn('uuid')
    skillId!: string;

    @Column({ type: 'enum', enum: UserSkillRole })
    role!: UserSkillRole;

    @ManyToOne(() => User, (user) => user.userSkills, { nullable: false })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user!: Relation<User>;

    @ManyToOne(() => Skill, (skill) => skill.userSkills, { nullable: false })
    @JoinColumn({ name: 'skillId', referencedColumnName: 'id' })
    skill!: Relation<Skill>;
}
