/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { DiscordComponentType } from '../custom-types/discord-component-types';
import { Snowflake } from '../custom-types/snowflake';
import DiscordInteractionData from './discord-interaction-data';
import DiscordUser from './discord-user';
import * as DiscordAPI from '../api/discord-api';
import { DiscordInteractionCallbackType } from '../custom-types/discord-interaction-callback-type';
import DiscordInteractionResponseData from './discord-interaction-response-data';
import DiscordGuildMember from './discord-guild-memeber';

export default class DiscordInteraction {

    public id!: Snowflake;                      // Id of the interaction
    // public application_id	snowflake	id of the application this interaction is for
    // public type	interaction type the type of interaction
    public data?: DiscordInteractionData;       // The command data payload
    public guild_id?: Snowflake	                //the guild it was sent from
    // public channel_id ? snowflake	the channel it was sent from
    public member?: DiscordGuildMember;         // Guild member data for the invoking user, including permissions
    public user?: DiscordUser;                  // User object for the invoking user, if invoked in a DM
    public token!: string;                      // A continuation token for responding to the interaction
    // public version	integer	read - only property, always 1
    // public message ? message object	for components, the message they were attached to

    constructor(json: any) {
        this.id = json.id;
        this.data = json.data ? new DiscordInteractionData(json.data) : undefined;
        this.guild_id = json.guild_id;
        this.member = json.member ? new DiscordGuildMember(json.member) : undefined;
        this.user = json.user ? new DiscordUser(json.user) : undefined;
        this.token = json.token;
    }

    public isButton(): boolean {
        return this.data?.component_type == DiscordComponentType.Button;
    }

    public update(data: DiscordInteractionResponseData): void {
        DiscordAPI.interactionCallback(this.id, this.token, {
            type: DiscordInteractionCallbackType.UPDATE_MESSAGE,
            data
        });
    }
}