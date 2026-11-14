import {useConversation} from "../../features/chat/hooks/useConversation.ts";
import {useLocalMedia} from "../../features/chat/hooks/useLocalMedia.ts";
import {CallPage} from "./CallPage.tsx";
import {SetupPage} from "./SetupPage.tsx";


export const Chat = () => {

    const media = useLocalMedia()
    const conversation = useConversation(media.stream)


    if (conversation.isConnected) {
        return (
            <CallPage conversation={conversation} media={media} />
        )
    } else {
        return (
            <SetupPage conversation={conversation} media={media}/>
        )
    }

}