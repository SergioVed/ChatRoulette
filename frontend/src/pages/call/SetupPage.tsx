import styles from './SetupPage.module.css'
import {ConversationSettings} from "../../features/chat/components/ConversationSettings.tsx";
import {VideoPreview} from "../../features/chat/components/VideoPreview.tsx";
import { MicrophoneButton } from '../../features/chat/components/controls/MicrophoneButton'
import { CameraButton } from '../../features/chat/components/controls/CameraButton'
import type {useConversation} from "../../features/chat/hooks/useConversation.ts";
import type {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";

export type SetupPageProps = {
  media: ReturnType<typeof useLocalMedia>,
  conversation: ReturnType<typeof useConversation>
  skillId: string,
  setSkillId: (value: string) => void
}

export const SetupPage = ({media, conversation, setSkillId, skillId}: SetupPageProps) => {

  return (
    <main className={styles.main}>
      <section className={styles.card} aria-labelledby="conversation-heading">
        <div className={styles.settings}>
          <h1 id="conversation-heading">Start a conversation</h1>
          <ConversationSettings setSkillId={setSkillId} skillId={skillId}/>

          <p className={conversation.socketReady ? styles.status : styles.statusDis}>
            <span className={conversation.socketReady ? styles.statusDot : styles.statusDotDis} aria-hidden="true" />
            {conversation.socketReady ? "Ready to connect" : "NOT ready to connect"}
          </p>
          {conversation.connectionError && <p role="alert">{conversation.connectionError}</p>}
          <button
            onClick={() => conversation.findPartner(skillId)}
            className={styles.findButton}
            type="button"
            disabled={!conversation.socketReady || !skillId || !media.stream}
          >
            Find partner
          </button>
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
  )
}
