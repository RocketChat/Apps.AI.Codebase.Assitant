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

export class ImportanceCommand implements ISlashCommand {
    public command = "rcc-importance";
    public i18nParamsExample = "";
    public i18nDescription = "";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const [query] = context.getArguments();
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

        const res = await requestServer(http, "/importance", { query });
        if (!res) {
            await sendEditedMessage("Error!");
            return;
        }

        const data = res as Record<string, number>;

        let message = "";
        message += `1. Criticality: ${Math.round(data.criticality * 100)}%\n`;
        message += `2. Centrality: ${Math.round(data.centrality * 100)}%\n`;
        message += `3. Importance: ${Math.round(data.importance * 100)}%\n`;
        message += `4. LOC: ${data.loc}\n`;

        await sendEditedMessage(message);
    }
}
