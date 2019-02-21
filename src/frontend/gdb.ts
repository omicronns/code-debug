import { MI2DebugSession } from './mibase';
import { DebugSession } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { MI2 } from "../backend/mi2/mi2";
import { ValuesFormattingMode } from '../backend/backend';

export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	cwd: string;
	gdbpath: string;
	env: any;
	debugger_args: string[];
	arguments: string;
	autorun: string[];
	valuesFormatting: ValuesFormattingMode;
	printCalls: boolean;
	showDevDebugOutput: boolean;
}


class GDBDebugSession extends MI2DebugSession {
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		response.body.supportsHitConditionalBreakpoints = true;
		response.body.supportsConfigurationDoneRequest = true;
		response.body.supportsConditionalBreakpoints = true;
		response.body.supportsFunctionBreakpoints = true;
		response.body.supportsEvaluateForHovers = true;
		response.body.supportsSetVariable = true;
		response.body.supportsStepBack = true;
		this.sendResponse(response);
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments): void {
		this.miDebugger = new MI2(args.gdbpath || "gdb", ["-q", "--interpreter=mi2"], args.debugger_args, args.env);
		this.initDebugger();
		this.quit = false;
		this.attached = false;
		this.needContinue = false;
		this.started = false;
		this.crashed = false;
		this.debugReady = false;
		this.setValuesFormattingMode(args.valuesFormatting);
		this.miDebugger.printCalls = !!args.printCalls;
		this.miDebugger.debugOutput = !!args.showDevDebugOutput;
		this.miDebugger.spawnDebugger(args.cwd, args.arguments).then(() => {
			if (args.autorun)
				args.autorun.forEach(command => {
					this.miDebugger.sendUserInput(command);
				});
			setTimeout(() => {
				this.miDebugger.emit("ui-break-done");
			}, 50);
			this.sendResponse(response);
			this.miDebugger.start().then(() => {
				this.started = true;
				if (this.crashed)
					this.handlePause(undefined);
			}, err => {
				this.sendErrorResponse(response, 100, `Failed to Start MI Debugger: ${err.toString()}`);
			});
		}, err => {
			this.sendErrorResponse(response, 103, `Failed to load MI Debugger: ${err.toString()}`);
		});
	}
}

DebugSession.run(GDBDebugSession);
