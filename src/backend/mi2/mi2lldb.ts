import { MI2, escape } from "./mi2";
import { Breakpoint } from "../backend";
import * as ChildProcess from "child_process";
import { posix } from "path";
import * as nativePath from "path";
const path = posix;

export class MI2_LLDB extends MI2 {
	protected initCommands(target: string, cwd: string, attach: boolean = false) {
		if (!nativePath.isAbsolute(target))
			target = nativePath.join(cwd, target);
		const cmds = [
			this.sendCommand("gdb-set target-async on")
		];
		if (!attach)
			cmds.push(this.sendCommand("file-exec-and-symbols \"" + escape(target) + "\""));
		return cmds;
	}

	clearBreakPoints(): Thenable<any> {
		return new Promise((resolve, reject) => {
			const promises = [];
			this.breakpoints.forEach((k, index) => {
				promises.push(this.sendCommand("break-delete " + k).then((result) => {
					if (result.resultRecords.resultClass == "done") resolve(true);
					else resolve(false);
				}));
			});
			this.breakpoints.clear();
			Promise.all(promises).then(resolve, reject);
		});
	}

	setBreakPointCondition(bkptNum, condition): Thenable<any> {
		return this.sendCommand("break-condition " + bkptNum + " \"" + escape(condition) + "\" 1");
	}
}
