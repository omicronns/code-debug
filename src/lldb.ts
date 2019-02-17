import { MI2DebugSession } from './mibase';
import { DebugSession } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { MI2_LLDB } from "./backend/mi2/mi2lldb";
import { ValuesFormattingMode } from './backend/backend';

export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	cwd: string;
	target: string;
	lldbmipath: string;
	env: any;
	debugger_args: string[];
	arguments: string;
	autorun: string[];
	valuesFormatting: ValuesFormattingMode;
	printCalls: boolean;
	showDevDebugOutput: boolean;
}

class LLDBDebugSession extends MI2DebugSession {
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		response.body.supportsHitConditionalBreakpoints = true;
		response.body.supportsConfigurationDoneRequest = true;
		response.body.supportsConditionalBreakpoints = true;
		response.body.supportsFunctionBreakpoints = true;
		response.body.supportsEvaluateForHovers = true;
		this.sendResponse(response);
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments): void {
		this.miDebugger = new MI2_LLDB(args.lldbmipath || "lldb-mi", [], args.debugger_args, args.env);
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
		this.miDebugger.load(args.cwd, args.target, args.arguments).then(() => {
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
			});
		});
	}
}

DebugSession.run(LLDBDebugSession);
