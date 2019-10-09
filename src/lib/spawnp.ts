import { spawn } from 'child_process';

export const spawnp = (c: string, a: string[]): Promise<string> =>
    new Promise((resolve, reject) => {
        const cmd = spawn(c, a);

        let stdout = '';
        let stderr = '';

        cmd.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        cmd.stdout.on('error', (e) => {
            cmd.kill();
            reject(e);
        });

        cmd.stderr.on('data', (d) => {
            stderr += d.toString();
        });

        cmd.on('exit', () => {
            if (stderr.trim().length > 0) {
                reject(new Error(stderr));
                return;
            }
            resolve(stdout);
        });

        cmd.stderr.on('error', (e) => {
            cmd.kill();
            reject(e);
        });

        cmd.on('error', (e) => {
            cmd.kill();
            reject(e);
        });
    });
