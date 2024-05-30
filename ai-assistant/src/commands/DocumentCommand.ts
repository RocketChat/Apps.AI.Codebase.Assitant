import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { handleCommandResponse } from "../utils/handleCommandResponse";
import { requestServer } from "../utils/requestServer";

export class DocumentCommand implements ISlashCommand {
    public command = "rcc-document";
    public i18nParamsExample = "";
    public i18nDescription = "";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const query = context.getArguments().join(" ");
        if (!query) {
            throw new Error("Error!");
        }

        const sendEditedMessage = await handleCommandResponse(
            query,
            context.getSender(),
            context.getRoom(),
            modify,
            this.command
        );

        const res = await requestServer(http, "/document", {
            query: query,
        });
        if (!res) {
            await sendEditedMessage("❌ No references found!");
            return;
        }

        const data = res as Record<string, string>;

        await sendEditedMessage(`${data["jsDoc"]}\n\n${data["explanation"]}`);
    }
}
