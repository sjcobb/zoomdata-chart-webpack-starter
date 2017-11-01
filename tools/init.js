/**
 * This script runs automatically after your first npm-install.
 */
const _prompt = require('prompt');
const { mv, rm, which, exec } = require('shelljs');
const replace = require('replace-in-file');
const colors = require('colors');
const path = require('path');
const { readFileSync, writeFileSync } = require('fs');
const { fork } = require('child_process');
const omit = require('lodash.omit');

// Note: These should all be relative to the project root directory
const rmDirs = ['.git', 'tools'];
const rmFiles = ['tools/init.js'];
const modifyFiles = [
	'LICENSE',
	'package.json',
	'webpack.config.js',
	'src/index.js',
];
const renameFiles = [
	['src/index.js', 'src/--chartname--.js'],
	['src/index.css', 'src/--chartname--.css'],
];
const rmDevPackages = [
	'colors',
	'shelljs',
	'replace-in-file',
	'prompt',
	'lodash.omit',
	'rimraf',
];

const _promptSchemaChartName = {
	properties: {
		chart: {
			description: colors.cyan(
				'What do you want the chart to be called? (use kebab-case)'
			),
			pattern: /^[a-z]+(\-[a-z]+)*$/,
			type: 'string',
			required: true,
			message:
				'"kebab-case" uses lowercase letters, and hyphens for any punctuation',
		},
	},
};

const _promptSchemaChartSuggest = {
	properties: {
		useSuggestedName: {
			description: colors.cyan(
				'Would you like it to be called "' +
					chartNameSuggested() +
					'"? [Yes/No]'
			),
			pattern: /^(y(es)?|n(o)?)$/i,
			type: 'string',
			required: true,
			message: 'You need to type "Yes" or "No" to continue...',
		},
	},
};

_prompt.start();
_prompt.message = '';

// Clear console
let lines = process.stdout.getWindowSize()[1];
for (let i = 0; i < lines; i++) {
	console.log('\r\n');
}

if (!which('git')) {
	console.log(colors.red('Sorry, this script requires git'));
	removeItems();
	process.exit(1);
}

// Say hi!
console.log(
	colors.cyan(
		"Hi! You're almost ready to make the next great Zoomdata custom chart."
	)
);

// Generate the chart name and start the tasks
if (process.env.CI === undefined) {
	if (!chartNameSuggestedIsDefault()) {
		chartNameSuggestedAccept();
	} else {
		chartNameCreate();
	}
} else {
	// This is being run in a CI environment, so don't ask any questions
	setupChart(chartNameSuggested());
}

/**
 * Asks the user for the name of the chart if it has been cloned into the
 * default directory, or if they want a different name to the one suggested
 */
function chartNameCreate() {
	_prompt.get(_promptSchemaChartName, (err, res) => {
		if (err) {
			console.log(
				colors.red('Sorry, there was an error building the workspace :(')
			);
			removeItems();
			process.exit(1);
			return;
		}

		setupChart(res.chart);
	});
}

/**
 * Sees if the users wants to accept the suggested chart name if the project
 * has been cloned into a custom directory (i.e. it's not 'zoomdata-chart-webpack-starter')
 */
function chartNameSuggestedAccept() {
	_prompt.get(_promptSchemaChartSuggest, (err, res) => {
		if (err) {
			console.log(colors.red("Sorry, you'll need to type the chart name"));
			chartNameCreate();
		}

		if (res.useSuggestedName.toLowerCase().charAt(0) === 'y') {
			setupChart(chartNameSuggested());
		} else {
			chartNameCreate();
		}
	});
}

/**
 * The chart name is suggested by looking at the directory name of the
 * tools parent directory and converting it to kebab-case
 *
 * The regex for this looks for any non-word or non-digit character, or
 * an underscore (as it's a word character), and replaces it with a dash.
 * Any leading or trailing dashes are then removed, before the string is
 * lowercased and returned
 */
function chartNameSuggested() {
	return path
		.basename(path.resolve(__dirname, '..'))
		.replace(/[^\w\d]|_/g, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();
}

/**
 * Checks if the suggested chart name is the default, which is 'zoomdata-chart-webpack-starter'
 */
function chartNameSuggestedIsDefault() {
	return chartNameSuggested() === 'zoomdata-chart-webpack-starter';
}

/**
 * Calls all of the functions needed to setup the chart
 *
 * @param chartName
 */
function setupChart(chartName) {
	console.log(
		colors.cyan(
			'\nThanks for the info. The last few changes are being made... hang tight!\n\n'
		)
	);

	// Get the Git username and email before the .git directory is removed
	let username = exec('git config user.name').stdout.trim();
	let usermail = exec('git config user.email').stdout.trim();

	removeItems();

	modifyContents(chartName, username, usermail);

	renameItems(chartName);

	finalize();

	console.log(colors.cyan("OK, you're all set. Happy coding!! ;)\n"));
}

/**
 * Removes items from the project that aren't needed after the initial setup
 */
function removeItems() {
	console.log(colors.underline.white('Removed'));

	// The directories and files are combined here, to simplify the function,
	// as the 'rm' command checks the item type before attempting to remove it
	let rmItems = rmDirs.concat(rmFiles);
	rm('-rf', rmItems.map(f => path.resolve(__dirname, '..', f)));
	console.log(colors.red(rmItems.join('\n')));

	console.log('\n');
}

/**
 * Updates the contents of the template files with the chart name or user details
 *
 * @param chartName
 * @param username
 * @param usermail
 */
function modifyContents(chartName, username, usermail) {
	console.log(colors.underline.white('Modified'));

	let files = modifyFiles.map(f => path.resolve(__dirname, '..', f));
	try {
		const changes = replace.sync({
			files,
			from: [/--chartname--/g, /--username--/g, /--usermail--/g],
			to: [chartName, username, usermail],
		});
		console.log(colors.yellow(modifyFiles.join('\n')));
	} catch (error) {
		console.error('An error occurred modifying the file: ', error);
	}

	console.log('\n');
}

/**
 * Renames any template files to the new chart name
 *
 * @param chartName
 */
function renameItems(chartName) {
	console.log(colors.underline.white('Renamed'));

	renameFiles.forEach(function(files) {
		// Files[0] is the current filename
		// Files[1] is the new name
		let newFilename = files[1].replace(/--chartname--/g, chartName);
		mv(
			path.resolve(__dirname, '..', files[0]),
			path.resolve(__dirname, '..', newFilename)
		);
		console.log(colors.cyan(files[0] + ' => ' + newFilename));
	});

	console.log('\n');
}

/**
 * Calls any external programs to finish setting up the chart
 */
function finalize() {
	console.log(colors.underline.white('Finalizing'));

	// Recreate Git folder
	let gitInitOutput = exec('git init "' + path.resolve(__dirname, '..') + '"', {
		silent: true,
	}).stdout;
	console.log(colors.green(gitInitOutput.replace(/(\n|\r)+/g, '')));

	// Remove post-install command
	let jsonPackage = path.resolve(__dirname, '..', 'package.json');
	const pkg = JSON.parse(readFileSync(jsonPackage));

	// Note: Add items to remove from the package file here
	delete pkg.scripts.postinstall;
	pkg.devDependencies = omit(pkg.devDependencies, rmDevPackages);

	writeFileSync(jsonPackage, JSON.stringify(pkg, null, 2));
	console.log(colors.green('Postinstall script has been removed'));

	// Initialize Husky
	fork(
		path.resolve(__dirname, '..', 'node_modules', 'husky', 'bin', 'install'),
		{ silent: true }
	);
	console.log(colors.green('Git hooks set up'));

	console.log('\n');
}
