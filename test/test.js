var assert = require('assert');
var lint = require('jsonlint');
var fs = require('fs');
var read = require('fs-readdir-recursive');
var filepath = require('path');

fileNames = read('./games');
jsonFileNames = fileNames.filter(function (x) {
    return filepath.extname(x) === '.json';
});

function readGameJson(path){
    return fs.readFileSync('./games/' + path).toString();
}

describe('JSON Lint', function () {
    jsonFileNames.forEach(function (path) {
        it(path, function () {
            lint.parse(readGameJson(path)); // throws if error found
        });
    });
});

describe('Syntax', function () {
    it('dice', function () {
        jsonFileNames.forEach(function (path) {
            JSON.parse(readGameJson(path), function (k, v) {
                assert.notEqual(k, "dices", path + " contains key: 'dices'");
                assert.notEqual(k, "die", path + " contains key: 'die'");
            });
        });
    });
    it('cards', function () {
        jsonFileNames.forEach(function (path) {
            JSON.parse(readGameJson(path), function (k, v) {
                assert.notEqual(k, "card", path + " contains key of single type: 'card'");
            });
        });
    });
    it('rulebook', function () {
        jsonFileNames.forEach(function (path) {
            JSON.parse(readGameJson(path), function (k, v) {
                assert.notEqual(k, "rules", path + " contains key 'rules' instead of 'rulebook'");
                assert.notEqual(k, "rulebooks", path + " contains key 'rulebooks' instead of 'rulebook'");
                assert.notEqual(k, "rule_book", path + " contains key 'rule_book' instead of 'rulebook'");
                assert.notEqual(k, "game_manual", path + " contains key 'game_manual' instead of 'rulebook'");
            });
        });
    });
    it('lowercase filenames', function () {
        jsonFileNames.forEach(function (path) {
            assert.equal(path, path.toLowerCase(), path + " has uppercase letters.");
        });
    });
    it('spaces in keys', function () {
        jsonFileNames.forEach(function (path) {
            JSON.parse(readGameJson(path), function (k, v) {
                assert(k.indexOf(" ") < 0, path + " contains spaces in its key '" + k + "'");
            });
        });
    });
});

describe('Reality Check', function () {
    it('board count', function () {
        jsonFileNames.forEach(function (path) {
            jsonString = readGameJson(path);
            jsonObject = JSON.parse(jsonString);
            hasProperBoard = 0;
            // Check that board has count property and is only 1
            if (jsonObject.pieces) {
                if (jsonObject.pieces.board) {
                    assert.notEqual(jsonObject.pieces.board.total_count, undefined, path + " has a board without a total count.");
                    assert.equal(jsonObject.pieces.board.total_count, 1, path + " claims there is more than one board.");
                    hasProperBoard = 1;
                }
            }
            // Check for board attributes elsewhere
            boardAttributeCount = 0;
            JSON.parse(jsonString, function (k, v) {
                if (k == "board") {
                    boardAttributeCount += 1;
                }
            });
            assert.equal(boardAttributeCount, hasProperBoard, path + " might have a board attribute in the wrong place.");
        });
    });
    it('rulebook count', function () {
        jsonFileNames.forEach(function (path) {
            jsonString = readGameJson(path);
            jsonObject = JSON.parse(jsonString);
            hasProperRulebook = 0;
            // Check that board has count property and is only 1
            if (jsonObject.pieces) {
                if (jsonObject.pieces.rulebook) {
                    assert.notEqual(jsonObject.pieces.rulebook.total_count, undefined, path + " has a rulebook without a total count.");
                    // caverna does have more than one rulebook
                    if (path.indexOf("caverna") < 0) {
                        assert.equal(jsonObject.pieces.rulebook.total_count, 1, path + " claims there is more than one rulebook.");
                    }
                    hasProperRulebook = 1;
                }
            }
            // Check for board attributes elsewhere
            rulebookAttributeCount = 0;
            JSON.parse(jsonString, function (k, v) {
                if (k == "rulebook") {
                    rulebookAttributeCount += 1;
                }
            });
            assert.equal(rulebookAttributeCount, hasProperRulebook, path + " might have a rulebook attribute in the wrong place.");
        });
    });
    it('file exists', function () {
        jsonFileNames.forEach(function (path) {
            JSON.parse(readGameJson(path), function (k, v) {
                if (k == "file") {
                    var folder = filepath.dirname(path);
                    try {
                        fs.statSync(filepath.join('.', 'games', folder, v));
                    }
                    catch (err) {
                        assert(false, v + " doesn't exist in 'games/" + folder + "' folder.");
                    }
                }
            });
        });
    });
});