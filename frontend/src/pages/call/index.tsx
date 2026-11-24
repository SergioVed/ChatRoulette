import {useConversation} from "../../features/chat/hooks/useConversation.ts";
import {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";
import {CallPage} from "./CallPage.tsx";
import {SetupPage} from "./SetupPage.tsx";
import {useState} from "react";
import {ConversationState} from "../../features/chat/types.ts";

export const Chat = () => {

    const media = useLocalMedia()
    const conversation = useConversation(media.stream)

    const [skillId, setSkillId] = useState<string>('')

    const showCallPage =
        conversation.conversationState === ConversationState.SEARCHING ||
        conversation.conversationState === ConversationState.MATCHED

    if (showCallPage) {
        return (
            <CallPage skillId={skillId} conversation={conversation} media={media} />
        )
    } else {
        return (
            <SetupPage skillId={skillId} setSkillId={setSkillId} conversation={conversation} media={media}/>
        )
    }

}