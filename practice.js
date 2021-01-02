const fs = require('fs').promises
const music_id = '6889529191637714946'
const music_folder = 'music:' + music_id
const path = require('path')

async function getMusicFolder (music_id) {
	const music_folder = 'music:' + music_id
	let music_videos = await fs.readdir(music_folder)
	return music_videos
}

async function getHashTagFolder (hastag = 'summer') {
	const foldername = '#' + hastag
	let summer_folder = path.join(__dirname, foldername)
	const videos = await fs.readdir(summer_folder)
	console.log(videos)
}
