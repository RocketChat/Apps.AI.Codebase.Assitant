import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";

import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { AskCommand } from "./commands/AskCommand";
import { DiagramCommand } from "./commands/DiagramCommand";
import { DocumentCommand } from "./commands/DocumentCommand";
import { FindSimilarCommand } from "./commands/FindSimilar";
import { HealthCommand } from "./commands/HealthCommand";
import { ImportanceCommand } from "./commands/ImportanceCommand";
import { StyleguideCommand } from "./commands/Styleguide";
import { SuggestCommand } from "./commands/SuggestCommand";
import { TranslateCommand } from "./commands/TranslateCommand";
import { WhyUsedCommand } from "./commands/WhyUsedCommand";
import { handleModalViewSubmit } from "./utils/handleModalViewSubmit";

export class RocketChatterApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        handleModalViewSubmit(context, read, http, modify);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        configuration.slashCommands.provideSlashCommand(new HealthCommand());

        configuration.slashCommands.provideSlashCommand(new AskCommand());
        configuration.slashCommands.provideSlashCommand(new DiagramCommand());
        configuration.slashCommands.provideSlashCommand(new DocumentCommand());
        configuration.slashCommands.provideSlashCommand(
            new FindSimilarCommand()
        );
        configuration.slashCommands.provideSlashCommand(
            new ImportanceCommand()
        );
        configuration.slashCommands.provideSlashCommand(
            new StyleguideCommand()
        );
        configuration.slashCommands.provideSlashCommand(new SuggestCommand());
        configuration.slashCommands.provideSlashCommand(new TranslateCommand());
        configuration.slashCommands.provideSlashCommand(new WhyUsedCommand());
    }
}
