/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { DiscordGuildMember, DiscordMessageCreate, DiscordUser, Snowflake } from '..';
import * as DiscordAPI from '../api/discord-api';
import DiscordMessageEdit from './discord-message-edit';
import DiscordReaction from './discord-reaction';

export class DiscordMessage
{
    public id!: Snowflake;	                    // Id of the message
    public channel_id!: Snowflake;              // Id of the channel the message was sent in
    public guild_id?: Snowflake;                // Id of the guild the message was sent in
    public author!: DiscordUser;                // The author of this message(not guaranteed to be a valid user, see below)
    public member?: DiscordGuildMember;         // Partial guild member object, member properties for this message's author
    public content!: string;                    // Contents of the message
    public timestamp!: string;                  // Timestamp when this message was sent
    public edited_timestamp?: string;           // Timestamp when this message was edited(or null if never)
    public tts!: boolean;                       // Whether this was a TTS message
    public mention_everyone!: boolean;          // Whether this message mentions everyone
    public mentions!: DiscordUser[];            // Users specifically mentioned in the message
    //     public mention_roles	array of role object ids	roles specifically mentioned in this message
    //     public mention_channels ?**** array of channel mention objects	channels specifically mentioned in this message
    //     public attachments	array of attachment objects	any attached files
    //     public embeds	array of embed objects	any embedded content
    public reactions?: DiscordReaction;         // reactions to the message
    //     public nonce ? integer or string	used for validating a message was sent
    //     public pinned	boolean	whether this message is pinned
    //     public webhook_id ? snowflake	if the message is generated by a webhook, this is the webhook's id
    //     public type integer	type of message
    //     public activity ? message activity object	sent with Rich Presence - related chat embeds
    //     public application ? partial application object	sent with Rich Presence - related chat embeds
    //     public application_id ? snowflake	if the message is a response to an Interaction, this is the id of the interaction's application
    //     public message_reference ? message reference object	data showing the source of a crosspost, channel follow add, pin, or reply message
    //     public flags ? integer	message flags combined as a bitfield
    //     public referenced_message ?*****	? message object	the message associated with the message_reference
    //     public interaction ? message interaction object	sent if the message is a response to an Interaction
    //     public thread ? channel object	the thread that was started from this message, includes thread member object
    //     public components ? Array of message components	sent if the message contains components like buttons, action rows, or other interactive components
    //     public sticker_items ? array of message sticker item objects	sent if the message contains stickers
    //     public stickers ? array of sticker objects	Deprecated the stickers sent with the message

    constructor(id: Snowflake, channel_id: Snowflake, author: DiscordUser, content: string, timestamp: string)
    {
        this.id = id;
        this.channel_id = channel_id;
        this.author = author;
        this.content = content;
        this.timestamp = timestamp;
    }

    static fromJson(json: any): DiscordMessage
    {
        const newInst = new DiscordMessage(
            json.id,
            json.channel_id,
            DiscordUser.fromJson(json.author),
            json.content,
            json.timestamp
        );
        newInst.guild_id = json.guild_id;
        newInst.member = DiscordGuildMember.fromJson(json.member ?? {}, newInst.author);
        newInst.edited_timestamp = json.edited_timestamp;
        newInst.tts = json.tts;
        newInst.mention_everyone = json.mention_everyone;
        newInst.mentions = json.mentions.map(DiscordUser.fromJson);
        return newInst;
    }

    public reply(message: string): Promise<DiscordMessage>
    {
        return DiscordAPI.createMessage(
            this.channel_id,
            {
                content: message,
                message_reference:
                {
                    message_id: this.id,
                    channel_id: this.channel_id,
                    guild_id: this.guild_id
                }
            }
        );
    }

    public sendMessageInChannel(message: string): Promise<DiscordMessage>
    {
        return DiscordAPI.createMessage(this.channel_id, { content: message });
    }

    public sendInChannel(message: DiscordMessageCreate): Promise<DiscordMessage>
    {
        return DiscordAPI.createMessage(this.channel_id, message);
    }

    public edit(message: DiscordMessageEdit): Promise<DiscordMessage>
    {
        return DiscordAPI.editMessage(this.channel_id, this.id, message);
    }

    public react(emoji: string): Promise<void>
    {
        return DiscordAPI.addReaction(this.channel_id, this.id, emoji);
    }

    public removeAllReactions(): Promise<void>
    {
        return DiscordAPI.deleteAllReactions(this.channel_id, this.id);
    }
}