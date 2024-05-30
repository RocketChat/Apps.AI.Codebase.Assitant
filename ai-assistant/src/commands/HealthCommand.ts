import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { API_BASE_URI } from "../constants";
import { handleCommandResponse } from "../utils/handleCommandResponse";

export class HealthCommand implements ISlashCommand {
    public command = "rcc-health";
    public i18nParamsExample = "";
    public i18nDescription = "";
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        const sendEditedMessage = await handleCommandResponse(
            "",
            context.getSender(),
            context.getRoom(),
            modify,
            this.command
        );

        const res = await http.get(`${API_BASE_URI}/health`);
        if (!res) {
            await sendEditedMessage("❌ Health check failed");
            return;
        }

        await sendEditedMessage("✅ Health check successful");
    }
}
