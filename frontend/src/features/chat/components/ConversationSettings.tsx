import styles from "../../../pages/call/SetupPage.module.css";
import {useGetSkills} from "../hooks/useGetSkills.ts";
import type {UserSkill} from "../types.ts";
import {useEffect} from "react";


interface ConversationSettingsProps {
    skillId: string,
    setSkillId: (value: string) => void
}

export const ConversationSettings = ({setSkillId, skillId}: ConversationSettingsProps) => {

    const {skills, getSkills} = useGetSkills();

    useEffect(() => {
        void getSkills()
    }, [])

    useEffect(() => {
        const selectionExists = skills.some(skill => skill.skillId === skillId)
        if (selectionExists) return

        setSkillId(skills[0]?.skillId ?? '')
    }, [skills, skillId, setSkillId])

    console.log(skillId)

    return (
        <>
            <div className={styles.skillField}>
                <label htmlFor="skill">Skill</label>
                <div className={styles.selectWrapper}>
                    <select id="skill" value={skillId ?? ''} onChange={(event) => setSkillId(event.target.value)}>
                        {skills.map((skill: UserSkill) => (
                            <option key={skill.skillId} value={skill.skill.id}>{skill.skill.name}</option>
                        ))}
                    </select>
                    <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m5 9 7 7 7-7" />
                    </svg>
                </div>
            </div>
        </>
    )

}