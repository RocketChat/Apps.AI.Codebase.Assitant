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

export const COMMAND = "rcc-suggest";
export const SUGGEST_COMMAND_MODAL = "suggest-command";

export async function suggestModal(): Promise<IUIKitSurfaceViewParam> {
    return {
        id: SUGGEST_COMMAND_MODAL,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: "plain_text",
            text: "Get Suggestions",
        },
        close: await getButton("Close", "", ""),
        clearOnClose: true,
        submit: await getButton("Submit", "submit", "submit", "Submit"),
        blocks: [
            await getInputBox(
                "",
                "What code you want to get suggestions for?",
                "suggest",
                "suggest",
                "",
                true
            ),
        ],
    };
}

export async function suggestModalSubmitHandler(
    view: IUIKitSurface,
    sender: IUser,
    room: IRoom,
    read: IRead,
    modify: IModify,
    http: IHttp
) {
    const state = view.state as Record<string, any> | undefined;
    if (!state) return;

    const query = state.suggest.suggest;
    const sendMessage = await handleCommandResponse(
        "\n```typescript\n" + query + "\n```",
        sender,
        room,
        modify,
        COMMAND
    );

    const res = await requestServer(http, "/suggest", { query });
    if (!res) {
        await sendMessage(
            "❌ Failed to get suggestions. Please try again later."
        );
        return;
    }

    await sendMessage(res as string);
}
