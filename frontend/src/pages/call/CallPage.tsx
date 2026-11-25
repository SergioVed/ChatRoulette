import { MicrophoneButton } from '../../features/chat/components/controls/MicrophoneButton'
import { CameraButton } from '../../features/chat/components/controls/CameraButton'
import { EndCallButton } from '../../features/chat/components/controls/EndCallButton'
import { VideoPreview } from '../../features/chat/components/VideoPreview'
import setupStyles from './SetupPage.module.css'
import { ConversationState } from "../../features/chat/types.ts"
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

  const searching = conversation.conversationState === ConversationState.SEARCHING
  const partner = conversation.partner
  const remoteStream = !searching && conversation.connectionState === 'connected'
    ? conversation.remoteStream
    : null
  const status = searching ? 'Looking for a partner…' : 'Connecting…'

  return (
    <main className={styles.main}>
      <section className={styles.card} aria-labelledby="call-heading">
        <div className={styles.callInfo}>
          <h1 id="call-heading" className={styles.partner} aria-live="polite">
            {remoteStream && <span className={setupStyles.statusDot} aria-hidden="true" />}
            {partner?.name ?? status}
          </h1>
          {partner && <p className={styles.skill}>Skill: {partner.skill}</p>}
        </div>

        <div className={styles.videoArea}>
          {remoteStream ? (
            <VideoPreview
              stream={remoteStream}
              className={styles.remoteVideo}
              ariaLabel={partner ? `${partner.name}'s video` : 'Partner video'}
              muted={false}
            />
          ) : (
            <div className={styles.remotePlaceholder} aria-hidden={!partner}>
              <span role={partner ? 'status' : undefined}>{status}</span>
            </div>
          )}
          <VideoPreview
              stream={media.stream}
              className={styles.selfPreview}
              ariaLabel="Your video placeholder"
          />
        </div>

        <div className={styles.controls}>
          <div className={setupStyles.mediaControls}>
            <MicrophoneButton muted={media.muted} onClick={media.toggleMicrophone} />
            <CameraButton enabled={media.displaying} onClick={media.toggleVideo} />
          </div>
          <EndCallButton
            onClick={() => conversation.endCall(skillId)}
            label={searching ? 'Cancel search' : 'End call'}
          />
          {!searching && <NextTeacherButton onClick={() => conversation.next(skillId)} />}
        </div>
      </section>
    </main>
  )
}
