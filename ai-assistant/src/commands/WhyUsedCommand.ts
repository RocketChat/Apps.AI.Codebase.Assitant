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

export class WhyUsedCommand implements ISlashCommand {
    public command = "rcc-whyused";
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

        const res = await requestServer(http, "/whyUsed", { query });
        if (!res) {
            await sendEditedMessage("❌ No references found!");
            return;
        }

        const data = res as Record<string, string>;

        await sendEditedMessage(
            `\n${data.explanation}\n\n**Impact:** ${data.impact}`,
            [data.diagram]
        );
    }
}
