import {useConversation} from "../../features/chat/hooks/useConversation.ts";
import {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";
import {CallPage} from "./CallPage.tsx";
import {SetupPage} from "./SetupPage.tsx";
import {useState} from "react";


export const Chat = () => {

    const media = useLocalMedia()
    const conversation = useConversation(media.stream)
    const [skillId, setSkillId] = useState<string>('')

    if (conversation.connectionState === 'connected' || conversation.connectionState === 'connecting') {
        return (
            <CallPage skillId={skillId} conversation={conversation} media={media} />
        )
    } else {
        return (
            <SetupPage skillId={skillId} setSkillId={setSkillId} conversation={conversation} media={media}/>
        )
    }

}