import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserSkill } from '../user-skills/user-skill.entity';

@Entity('skills')
export class Skill {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    icon!: string | null;

    @OneToMany(() => UserSkill, (userSkill) => userSkill.skill)
    userSkills?: UserSkill[];
}
