import {
    IHttp,
    IModify,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    IUIKitSurface,
    UIKitSurfaceType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getButton, getInputBox } from "../utils/blockBuilders";
import { handleCommandResponse } from "../utils/handleCommandResponse";
import { requestServer } from "../utils/requestServer";

export const COMMAND = "rcc-findsimilar";
export const FIND_SIMILAR_COMMAND_MODAL = "findsimilar-command";

export async function findSimilarModal(): Promise<IUIKitSurfaceViewParam> {
    return {
        id: FIND_SIMILAR_COMMAND_MODAL,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: "plain_text",
            text: "Find similar chunks",
        },
        close: await getButton("Close", "", ""),
        clearOnClose: true,
        submit: await getButton("Submit", "submit", "submit", "Submit"),
        blocks: [
            await getInputBox(
                "",
                "Insert the code for which you want to find similar chunks here",
                "findsimilar",
                "findsimilar",
                "",
                true
            ),
        ],
    };
}

export async function findSimilarModalSubmitHandler(
    view: IUIKitSurface,
    sender: IUser,
    room: IRoom,
    read: IRead,
    modify: IModify,
    http: IHttp
) {
    const state = view.state as Record<string, any> | undefined;
    if (!state) return;

    const query = state.findsimilar.findsimilar;
    const sendMessage = await handleCommandResponse(
        "\n```typescript\n" + query + "\n```",
        sender,
        room,
        modify,
        COMMAND
    );

    const res = await requestServer(http, "/findSimilar", { query });
    if (!res) {
        await sendMessage(
            "❌ Failed to find similar chunks. Please try again later."
        );
        return;
    }

    const data = res as Record<string, any>;

    const codeNodes = data["result"];
    if (!codeNodes || !codeNodes.length) {
        await sendMessage("No similar chunks found.");
        return;
    }

    let message = "**Similar chunks found:**\n";
    for (let i = 0; i < codeNodes.length; i++) {
        const node = codeNodes[i];

        let codeNodeSegment = "";
        codeNodeSegment += `\n${i + 1}. ${node["filePath"]}\n`;
        codeNodeSegment += "```typescript\n";
        codeNodeSegment += node["code"];
        codeNodeSegment += "\n```";

        message += codeNodeSegment;
    }

    await sendMessage(message);
}
