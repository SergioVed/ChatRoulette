import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
} from 'typeorm';

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
}