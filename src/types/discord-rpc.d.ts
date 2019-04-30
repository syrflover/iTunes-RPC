declare module 'discord-rpc/src/transports/ipc' {
	import * as net from 'net';
	import { Client } from 'discord-rpc';
	import { EventEmitter } from 'events';

	export = IPCTransport;

	class IPCTransport extends EventEmitter {
		constructor(client: Client);

		public socket: net.Socket;
		public client: Client;

		public connect(): Promise<void>;
		public close(): void;
		public send(): void;
		public ping(): void;
	}
}

declare module 'discord-rpc' {
	import { Socket } from 'net';
	import { EventEmitter } from 'events';
	import IPCTransport = require('discord-rpc/src/transports/ipc');

	export interface IClientOptions {
		scopes?: string[];
		transport?: 'ipc' | 'websocket';
		timeout?: number;
		force?: boolean;
	}

	export interface IActivityArguments {
		details: string;
		state: string;
		startTimestamp?: Date | number;
		endTimestamp?: Date | number;
		largeImageKey: string;
		largeImageText: string;
		smallImageKey?: string;
		smallImageText?: string;
		instance: boolean;
	}

	export interface IRPCLoginOptions {
		clientId?: string;
		clientSecret?: string;
		accessToken?: string;
		rpcToken?: string;
		tokenEndpoint?: string;
		scopes?: string[];
	}

	/* interface ITransportData {
    cmd: string;
    evt: string;
  }

  interface Transport extends EventEmitter {
    client: any;
    socket: Socket;

    /* on(event: 'message', listener: (...args: any[]) => void): this;
    on(event: 'close', listener: (...args: any[]) => void): this;
    connect(): void;
    send(data: any, op?: number): void;
    close(): void;
    ping(): void;
  } */

	class Client extends EventEmitter {
		constructor(options?: IClientOptions);

		public options: IClientOptions;
		public accessToken: null;
		public clientId: null;
		public application: null;
		public user: null;

		public transport: IPCTransport;

		public connect(clientId: string): Promise<any>;

		public login(options: IRPCLoginOptions): Promise<this>;

		public setActivity(args: IActivityArguments, pid?: any): Promise<any>;

		public clearActivity(pid?: any): Promise<any>;

		public destroy(): Promise<void>;
	}

	function register(id: string): any;
}
