const TiktokScraper = require('tiktok-scraper')
let fs = require('fs').promises
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const rimraf = require('rimraf')

async function getTrending () {
	const posts = await TiktokScraper.trend('', {
		number: 50,
		download: true,
		sessionList: [ 'sid_tt=601a98c8eeea0111d6cde18e509e1ab6' ],
	})
}

async function getMusicTikTok () {
	const posts = await TiktokScraper.music('6548327243720952577', {
		number: 2,
		download: true,
		sessionList: [ 'sid_tt=601a98c8eeea0111d6cde18e509e1ab6' ],
	})
	console.log(posts)
}

// Convert Video To .ts Files
function convertVideoSync (file) {
	return new Promise((resolve => {
		ffmpeg(file)
			.videoCodec('copy')
			.audioCodec('copy')
			.outputOption('-bsf:v h264_mp4toannexb')
			.outputOption('-f mpegts')
			.saveToFile(file.replace('mp4', 'ts'))
			.on('end', () => {
				return resolve('done converting video')
			})
	}))
}

// Combines Clips Together
function combineClipsSync (input_option, user) {
	return new Promise(resolve => {
		ffmpeg(input_option)
			.videoCodec('copy')
			.audioCodec('copy')
			.outputOption('-bsf:v h264_mp4toannexb')
			.outputOption('-f mpegts')
			.saveToFile(`./videos/${ user }.mp4`)
			.on('end', () => {
				resolve(user)
			})
	})
}

async function createTikTokVideo (user = 'trend') {
	await getTrending()
	let files = await fs.readdir(user)
	files = files.map(file => {
		return path.join(user, file)
	})
	for (const file of files) {
		const res = await convertVideoSync(file)
		console.log(res)
	}
	//File Stuff
	files = await fs.readdir(user)
	files = files.filter(file => {
		return file.match(/.ts/ig)
	})
	tsfiles = files.map(file => {
		return path.join(user, file)
	})
	const input_option = 'concat:' + tsfiles.join('|')
	await combineClipsSync(input_option, user)
	// Delete Folder
	rimraf(user, () => {
		console.log('deleting folder')
	})
}

getMusicTikTok()












