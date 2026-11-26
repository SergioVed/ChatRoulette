import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Skill } from './skills/skill.entity';
import { UserSkill } from './user-skills/user-skill.entity';
import {Summary} from "./AISummary/summary.entity";
import { Call } from './calls/call.entity';

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [User, Skill, UserSkill, Call, Summary],
    migrations: [__dirname + '/migrations/*{.js,.ts}'],

    synchronize: false,
});
