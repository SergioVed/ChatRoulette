import styles from "../../../pages/SetupPage.module.css";

type ConversationMode = 'learn' | 'teach'

interface ConversationSettingsProps {
    mode: ConversationMode,
    skill: string,
    setMode: (mode: ConversationMode) => void,
    setSkill: (skill: string) => void
}

export const ConversationSettings = (
    {mode, skill, setMode, setSkill}: ConversationSettingsProps
) => {

    return (
        <>
            <div className={styles.modeSelector} role="group" aria-label="Conversation mode">
                <button type="button" aria-pressed={mode === 'learn'} onClick={() => setMode('learn')}>
                    Learn
                </button>
                <button type="button" aria-pressed={mode === 'teach'} onClick={() => setMode('teach')}>
                    Teach
                </button>
            </div>

            <div className={styles.skillField}>
                <label htmlFor="skill">Skill</label>
                <div className={styles.selectWrapper}>
                    <select id="skill" value={skill} onChange={(event) => setSkill(event.target.value)}>
                        <option>Guitar</option>
                        <option>Cycling</option>
                        <option>Swimming</option>
                    </select>
                    <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m5 9 7 7 7-7" />
                    </svg>
                </div>
            </div>
        </>
    )

}