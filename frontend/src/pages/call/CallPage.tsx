import { MicrophoneButton } from '../../features/chat/components/controls/MicrophoneButton'
import { CameraButton } from '../../features/chat/components/controls/CameraButton'
import { EndCallButton } from '../../features/chat/components/controls/EndCallButton'
import { VideoPreview } from '../../features/chat/components/VideoPreview'
import shell from './SetupPage.module.css'
import styles from './CallPage.module.css'
import type {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";
import type {useConversation} from "../../features/chat/hooks/useConversation.ts";
import {NextTeacherButton} from "../../features/chat/components/controls/NextTeacherButton.tsx";

export type CallPageProps = {
  media: ReturnType<typeof useLocalMedia>,
  conversation: ReturnType<typeof useConversation>,
  skillId: string,
}

export const CallPage = ({media, conversation, skillId}: CallPageProps) => {


  return (
      <div className={shell.page}>
        <header className={shell.header}>
          <p className={shell.brand}>TeacherStudent</p>
          <div className={shell.account}>
            <span>Alex</span>
            <button className={shell.logout} type="button">Log out</button>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.card} aria-label="Video call with Maria">
            <div className={styles.callInfo}>
              <h1 className={styles.partner}>
                <span className={shell.statusDot} aria-hidden="true"/>
                Maria
              </h1>
              <p className={styles.skill}>Skill: Guitar</p>
            </div>

            <div className={styles.videoArea}>
              <VideoPreview
                  stream={conversation.remoteStream}
                  className={styles.remoteVideo}
                  ariaLabel="Maria's video placeholder"
                  muted={false}
              />
              <VideoPreview
                  stream={media.stream}
                  className={styles.selfPreview}
                  ariaLabel="Your video placeholder"
              />
            </div>

            <div className={styles.controls}>
              <div className={shell.mediaControls}>
                <MicrophoneButton muted={media.muted} onClick={media.toggleMicrophone} />
                <CameraButton enabled={media.displaying} onClick={media.toggleVideo} />
              </div>
              <EndCallButton onClick={conversation.endCall}/>
              <NextTeacherButton onClick={() => conversation.next(skillId)}/>
              {/*<button onClick={conversation.testDisc}>test disc</button>*/}
            </div>
          </section>
        </main>
      </div>
  )
}
