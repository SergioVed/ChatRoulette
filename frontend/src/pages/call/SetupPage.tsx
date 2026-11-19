import { useState } from 'react'
import styles from './SetupPage.module.css'
import {ConversationSettings} from "../../features/chat/components/ConversationSettings.tsx";
import {VideoPreview} from "../../features/chat/components/VideoPreview.tsx";
import { MicrophoneButton } from '../../features/chat/components/controls/MicrophoneButton'
import { CameraButton } from '../../features/chat/components/controls/CameraButton'
import type {useConversation} from "../../features/chat/hooks/useConversation.ts";
import type {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";
import {useLogout} from "../../features/auth/hooks/useLogout.tsx";

export type SetupPageProps = {
  media: ReturnType<typeof useLocalMedia>,
  conversation: ReturnType<typeof useConversation>
  skillId: string,
  setSkillId: (value: string) => void
}

export const SetupPage = ({media, conversation, setSkillId, skillId}: SetupPageProps) => {

  const [localState, setLocalState] = useState('init')
  const {logout} = useLogout();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>TeacherStudent</p>
        <div className={styles.account}>
          <span>Alex</span>
          <button className={styles.logout} type="button" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="conversation-heading">
          <div className={styles.settings}>
            <h1 id="conversation-heading">Start a conversation</h1>
            <ConversationSettings  setSkillId={setSkillId} skillId={skillId}/>

            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Ready to connect.
            </p>
            <button onClick={() => {
              conversation.findPartner(skillId)
              setLocalState('searching')
            }}
                    className={styles.findButton}
                    type="button"
                    disabled={localState === 'searching'}
            >{localState === 'searching' ? "Looking for partner" : "Find partner"}</button>
          </div>

          <div className={styles.preview}>
            <VideoPreview stream={media.stream}/>
            <div className={styles.mediaControls}>
              <MicrophoneButton muted={media.muted} onClick={media.toggleMicrophone} />
              <CameraButton enabled={media.displaying} onClick={media.toggleVideo} />
            </div>
          </div>

        </section>
      </main>
    </div>
  )
}
