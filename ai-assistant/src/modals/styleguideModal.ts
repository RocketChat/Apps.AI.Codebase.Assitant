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

export const COMMAND = "rcc-styleguide";
export const STYLEGUIDE_COMMAND_MODAL = "styleguide-command";

export async function styleguideModal(): Promise<IUIKitSurfaceViewParam> {
    return {
        id: STYLEGUIDE_COMMAND_MODAL,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: "plain_text",
            text: "Use the styleguide",
        },
        close: await getButton("Close", "", ""),
        clearOnClose: true,
        submit: await getButton("Submit", "submit", "submit", "Submit"),
        blocks: [
            await getInputBox(
                "",
                "What code you want to follow the styleguide?",
                "styleguide",
                "styleguide",
                "",
                true
            ),
        ],
    };
}

export async function styleguideModalSubmitHandler(
    view: IUIKitSurface,
    sender: IUser,
    room: IRoom,
    read: IRead,
    modify: IModify,
    http: IHttp
) {
    const state = view.state as Record<string, any> | undefined;
    if (!state) return;

    const query = state.styleguide.styleguide;
    const sendMessage = await handleCommandResponse(
        "\n```typescript\n" + query + "\n```",
        sender,
        room,
        modify,
        COMMAND
    );

    const res = await requestServer(http, "/styleguide", { query });
    if (!res) {
        await sendMessage(
            "❌ Failed to match the styleguide. Please try again later."
        );
        return;
    }

    console.log(res);

    await sendMessage(res as string);
}
