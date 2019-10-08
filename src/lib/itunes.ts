import * as os from 'os';
import { pathExists } from '@syrflover/simple-store';
import env from '../env';
import { spawnp } from './spawnp';

interface IPlayTime {
	position: number;
	start: number;
	duration: number;
	finish: number;
}

// type PlayStateType = 'playing' | 'paused' | 'stopped';

export interface IPlayInfo {
	time: IPlayTime;
	title: string;
	artist: string;
	album: string;
	// state: PlayStateType;
}

/* export const checkItunes = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    await exec(
      'osascript -e \'tell application "System Events" to (name of processes) contains "iTunes"\'',
    )
      .then(({ stdout }) => {
        resolve(stdout.trim() === 'true');
      })
      .catch(reject);
  });
}; */

const iTunes =
	parseInt(os.release().split('.')[0], 10) === 19 ? 'Music' : 'iTunes';

export const isStopped = (): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		await spawnp('osascript', [
			'-e',
			`tell application "${iTunes}" to {player state}`,
		])
			.then((stdout) => {
				resolve(stdout.trim() === 'stopped');
			})
			.catch(reject);
	});
};

export const saveArtWorkOfCurrentTrack = (
	fileName: string,
): Promise<{ exists: boolean; path: string }> => {
	return new Promise(async (resolve, reject) => {
		const filePath = `${env.ASSET_FOLDER}/${fileName}.jpg`;

		/*     const script = `try
set p to "${filePath}"
set fileName to POSIX file p as text

	tell application "System Events"
		if exists file fileName then
			tell application "System Events" to delete alias fileName
		end if
	end tell

	tell application "iTunes" to tell artwork 1 of current track
		set srcBytes to raw data
	end tell

	try
		set outFile to open for access file fileName with write permission

		set eof outFile to 0

		write srcBytes to outFile
		close access outFile
	on error

	end try
on error

end try`; */

		const scripts = [
			'-e',
			'try',
			'-e',
			`set p to "${filePath}"`,
			'-e',
			'set fileName to POSIX file p as text',
			'-e',
			'tell application "System Events"',
			'-e',
			'if exists file fileName then',
			'-e',
			'tell application "System Events" to delete alias fileName',
			'-e',
			'end if',
			'-e',
			'end tell',
			'-e',
			`tell application "${iTunes}" to tell artwork 1 of current track`,
			'-e',
			'set srcBytes to raw data',
			'-e',
			'end tell',
			'-e',
			'try',
			'-e',
			'set outFile to open for access file fileName with write permission',
			'-e',
			'set eof outFile to 0',
			'-e',
			'write srcBytes to outFile',
			'-e',
			'close access outFile',
			'-e',
			'on error',
			'-e',
			'',
			'-e',
			'end try',
			'-e',
			'on error',
			'-e',
			'',
			'-e',
			'end try',
		];

		await spawnp('osascript', scripts)
			.then(async () => {
				const exists = await pathExists(filePath);

				resolve({
					exists,
					path: filePath,
				});
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getCurrentPlayingInfo = (): Promise<IPlayInfo> => {
	return new Promise(async (resolve, reject) => {
		// osascript -e 'tell application "iTunes" to {position: player position} & {start: start, duration: duration, finish: finish, name: name, artist: artist, album: album} of current track & {state: player state}'

		const script = `tell application "${iTunes}" to {position: player position} & {start: start, duration: duration, finish: finish, name: name, artist: artist, album: album} of current track`; // & {state: player state}

		await spawnp('osascript', ['-e', script])
			.then((stdout) => {
				/*
        [ '',
          '169.335006713867',
          '0.0',
          '268.85400390625',
          '268.85400390625',
          '하루도 Spectre를 내가 저지르지 않은 적이 없었다 (J.E.B Mashup)',
          'Alan Walker vs 임창정 (Im Chang Jung)',
          'MASHUPTHEDANCE',
          'playing\n' ]
        */
				const [
					,
					position,
					start,
					duration,
					finish,
					title,
					artist,
					album,
				] = stdout
					.replace(
						// /(position:|, start:|, duration:|, finish:|, name:|, artist:|, album:|, state:)/gs,
						/(position:|, start:|, duration:|, finish:|, name:|, artist:|, album:)/gs,
						'<||>',
					)
					.split('<||>');

				const playInfo: IPlayInfo = {
					title: title.trim().length > 0 ? title : 'Unknown Title',
					artist:
						artist.trim().length > 0 ? artist : 'Unknown Artist',
					album: album.trim().length > 0 ? album : 'Unknown Album',
					// state: state.trim() as PlayStateType,
					time: {
						position: parseFloat(position),
						start: parseFloat(start),
						duration: parseFloat(duration),
						finish: parseFloat(finish),
					},
				};

				resolve(playInfo);
			})
			.catch((error) => {
				reject(error);
			});
	});
};
