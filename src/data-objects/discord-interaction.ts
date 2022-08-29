/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    DiscordComponentType,
    DiscordGuildMember,
    DiscordInteractionCallbackType,
    DiscordInteractionType,
    DiscordMessage,
    DiscordMessageCreate,
    DiscordUser,
    Snowflake
} from '..';
import DiscordInteractionData from './discord-interaction-data';
import DiscordInteractionResponseData from './discord-interaction-response-message-data';
import * as DiscordAPI from '../api/discord-api';
import DiscordInteractionResponseModalData from './discord-interaction-response-modal-data';

export class DiscordInteraction {

    /**
     * Id of the interaction
     */
    public id!: Snowflake;

    /**
     * Id of the application this interaction is for
     */
    public application_id!: Snowflake;

    /**
     * Interaction type the type of interaction
     */
    public type!: DiscordInteractionType;

    /**
     * The command data payload
     */
    public data?: DiscordInteractionData;

    /**
     * The guild it was sent from
     */
    public guild_id?: Snowflake;

    /**
     * The channel it was sent from
     */
    public channel_id?: Snowflake;

    /**
     * Guild member data for the invoking user, including permissions
     */
    public member?: DiscordGuildMember;

    /**
     * User object for the invoking user, if invoked in a DM
     */
    public user?: DiscordUser;

    /**
     * A continuation token for responding to the interaction
     */
    public token!: string;

    /**
     * Read-only property, always 1
     */
    public version?: number;

    /**
     * For components, the message they were attached to
     */
    public message?: DiscordMessage;

    constructor(id: Snowflake, application_id: Snowflake, type: DiscordInteractionType, token: string) {
        this.id = id;
        this.application_id = application_id;
        this.type = type;
        this.token = token;
    }

    static fromJson(json: any): DiscordInteraction {
        const newInst = new DiscordInteraction(json.id, json.application_id, json.type, json.token);
        newInst.data = json.data && DiscordInteractionData.fromJson(json.data);
        newInst.guild_id = json.guild_id;
        newInst.channel_id = json.channel_id;
        newInst.member = json.member && DiscordGuildMember.fromJson(json.member);
        newInst.user = json.user && DiscordUser.fromJson(json.user);
        newInst.version = json.version;
        newInst.message = json.message && DiscordMessage.fromJson(json.message);
        return newInst;
    }

    public isButton(): boolean {
        return this.data?.component_type == DiscordComponentType.BUTTON;
    }

    public isAppCommand(): boolean {
        return this.type == DiscordInteractionType.APPLICATION_COMMAND;
    }

    public isModalSubmit(): boolean {
        return this.type == DiscordInteractionType.MODAL_SUBMIT;
    }

    public update(data: DiscordInteractionResponseData): Promise<void> {
        return DiscordAPI.interactionCallback(this.id, this.token, {
            type: DiscordInteractionCallbackType.UPDATE_MESSAGE,
            data
        });
    }

    public respond(data: DiscordInteractionResponseData): Promise<void> {
        return DiscordAPI.interactionCallback(this.id, this.token, {
            type: DiscordInteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data
        });
    }

    public respondWithModal(data: DiscordInteractionResponseModalData): Promise<void> {
        return DiscordAPI.interactionCallback(this.id, this.token, {
            type: DiscordInteractionCallbackType.MODAL,
            data
        });
    }

    public respondText(message: string): Promise<void> {
        const data = new DiscordInteractionResponseData();
        data.content = message;
        return this.respond(data);
    }

    public sendMessageInChannel(message: DiscordMessageCreate): Promise<DiscordMessage> {
        // -1? Should never call this if the channel_id is not set
        return DiscordAPI.createMessage(this.channel_id ?? -1, message);
    }

    public deferUpdate(): Promise<void> {
        return DiscordAPI.interactionCallback(this.id, this.token, {
            type: DiscordInteractionCallbackType.DEFERRED_UPDATE_MESSAGE
        });
    }
}