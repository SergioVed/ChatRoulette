import { useState } from 'react'
import styles from './SetupPage.module.css'
import {ConversationSettings} from "../features/chat/components/ConversationSettings.tsx";
import {VideoPreview} from "../features/chat/components/VideoPreview.tsx";
import {MediaControls} from "../features/chat/components/MediaControls.tsx";
import {useLocalMedia} from "../features/chat/hooks/useLocalMedia.ts";
import {useConversation} from "../features/chat/hooks/useConversation.ts";

export const SetupPage = () => {
  const [mode, setMode] = useState<'learn' | 'teach'>('learn')
  const [skill, setSkill] = useState('Guitar')

  const {stream, toggleMicrophone, toggleVideo} = useLocalMedia();
  const {remoteStream, findPartner} = useConversation(stream)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>TeacherStudent</p>
        <div className={styles.account}>
          <span>Alex</span>
          <button className={styles.logout} type="button">Log out</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="conversation-heading">
          <div className={styles.settings}>
            <h1 id="conversation-heading">Start a conversation</h1>
            <ConversationSettings mode={mode} skill={skill} setMode={setMode} setSkill={setSkill}/>

            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Ready to connect.
            </p>
            <button className={styles.findButton} type="button">Find teacher</button>
          </div>

          <div className={styles.preview}>
            <VideoPreview stream={stream}/>
            <VideoPreview stream={remoteStream}/>
            <MediaControls toggleMicrophone={toggleMicrophone} toggleVideo={toggleVideo}/>
          </div>

          <button onClick={findPartner}>find</button>
        </section>
      </main>
    </div>
  )
}
