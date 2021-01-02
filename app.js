const TiktokScraper = require('tiktok-scraper')
let fs = require('fs').promises
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const rimraf = require('rimraf')

/* Services Get TikTok Data */
async function getTrending () {
	const posts = await TiktokScraper.trend('', {
		number: 50,
		download: true,
		sessionList: [ 'sid_tt=601a98c8eeea0111d6cde18e509e1ab6' ],
	})
}

async function getMusicTikTok (music_id = '6548327243720952577') {
	const posts = await TiktokScraper.music(music_id, {
		number: 2,
		download: true,
		fileName: 'music',
		sessionList: [ 'sid_tt=601a98c8eeea0111d6cde18e509e1ab6' ],
	})
}

async function getHashTagTikToks (hashtag = 'lesbian') {
	const posts = await TiktokScraper.hashtag(hashtag, {
		number: 50,
		download: true,
		sessionList: [ 'sid_tt=601a98c8eeea0111d6cde18e509e1ab6' ],
	})
}

/* FFmpeg Conversions */

// Convert Video To .ts Files
function convertVideoSync (file) {
	return new Promise(resolve => {
		ffmpeg(file)
			.videoCodec('copy')
			.audioCodec('copy')
			.outputOption('-bsf:v h264_mp4toannexb')
			.outputOption('-f mpegts')
			.saveToFile(file.replace('mp4', 'ts'))
			.on('end', () => {
				return resolve('done converting video')
			})
	})
}

// Combines Clips Together
function combineClipsSync (input_option, videoname) {
	return new Promise(resolve => {
		ffmpeg(input_option)
			.videoCodec('copy')
			.audioCodec('copy')
			.outputOption('-bsf:v h264_mp4toannexb')
			.outputOption('-f mpegts')
			.saveToFile(`./videos/${ videoname }.mp4`)
			.on('end', () => {
				console.log('done')
				resolve(videoname)
			})
	})
}


/* FilePath Helpers */

// Returns Relative Paths
async function getFilesPath (foldername) {
	let files = await fs.readdir(foldername)
	files = files.map(file => {
		return path.resolve(foldername, file)
	})
	return files
}

async function filtertsFiles (foldername) {
	let files = await fs.readdir(foldername)
	let ts_files = files.filter(file => {
		return file.match(/.ts/gi)
	})
	ts_files = ts_files.map(file => {
		return path.resolve(foldername, file)
	})
	return ts_files
}


/* Create Functions */

// Trend TikTok
async function createTrendTikTok () {
	const foldername = 'trend'
	await getTrending()
	// Get Files Paths To Downloaded Videos
	const files = await getFilesPath(foldername)
	
	// Convert mp4 to .ts files
	for (const file of files) {
		const res = await convertVideoSync(file)
		console.log(res)
	}
	// //Filter ts files
	const ts_files = await filtertsFiles(foldername)
	
	// // Create Commans
	const input_option = 'concat:' + ts_files.join('|')
	await combineClipsSync(input_option, foldername + Date.now())
	// // Delete Folder
	rimraf(foldername, () => {
		console.log('deleting folder')
	})
}



// Music Tiktok
async function createMusicTiktok (music_id = '6912957665299745542') {
	await getMusicTikTok(music_id)
	const foldername = 'music-' + music_id
	
	// Get Files Paths To Downloaded Videos
	const files = await getFilesPath(foldername)
	// Convert mp4 to .ts files
	for (const file of files) {
		const res = await convertVideoSync(file)
		console.log(res)
	}
	
	// //Filter ts files
	const ts_files = await filtertsFiles(foldername)
	
	// // Create Commans
	const input_option = 'concat:' + ts_files.join('|')
	await combineClipsSync(input_option, foldername)
	// Delete Folder
	rimraf(foldername, () => {
		console.log('deleting folder')
	})
}


// Hash Tag TikTok
async function createHashTagTikTok (hastag = 'lesbian') {
	await getHashTagTikToks(hastag)
	const foldername = '#' + hastag
	// Get Files Paths To Downloaded Videos
	const files = await getFilesPath(foldername)
	
	// Convert mp4 to .ts files
	//
	for (const file of files) {
		const res = await convertVideoSync(file)
		console.log(res)
	}
	
	// //Filter ts files
	const ts_files = await filtertsFiles(foldername)
	
	// // Create Commans
	const input_option = 'concat:' + ts_files.join('|')
	await combineClipsSync(input_option, foldername)
	// // Delete Folder
	rimraf(foldername, () => {
		console.log('deleting folder')
	})
}

