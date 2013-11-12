jQuery.noConflict();

(function ($, undefined) {
    var searchForm, submitBtn, resetBtn, inputText, outputText,

        // Return status constants.
        LINES_LESS_THAN_THREE      = 0,
        NUM_SEARCH_WORDS_INVALID   = 1,
        SEARCH_WORDS_LESS_THAN_ONE = 2,
        NUM_SEARCH_WORDS_MISMATCH  = 3,
        INPUT_OK                   = 4,

        state = {
            searchText: '',
            numSearchWords: 0,
            searchWords: []
        };

    $(document).ready(init);

    return;

    function init() {
        searchForm = $('form[name="search_form"]');
        searchForm.submit(submitForm);

        submitBtn = searchForm.find('input[type="submit"]');
        submitBtn.on('click', submitBtnClick);

        resetBtn = searchForm.find('input[type="reset"]');
        resetBtn.on('click', resetBtnClick);

        inputText = searchForm.find('textarea[name="input_text"]');
        outputText = searchForm.find('textarea[name="output_text"]');
    }

    // In reality, this callback method will never be called. The submit
    // button has a handler attached which prevents the default action - the
    // submission of the form.
    //
    // But just in case we will later rewrite things, keep this method for now.
    function submitForm(e) {
        e.preventDefault();
    }

    function submitBtnClick(e) {
        var errStatus;

        e.preventDefault();

        errStatus = parseRawText();
        if (errStatus !== INPUT_OK) {
            outputError(errStatus);
        }

        stripUnwantedChars();

        writeTextToOuput(state.searchText);
    }

    function resetBtnClick(e) {
        e.preventDefault();

        inputText.val('');
    }

    function getRawText() {
        return inputText.val();
    }

    function allowAlphaAndSpace(text) {
        // We only allow a-z, A-Z, and space characters.
        return text.replace(/[^A-Za-z\s]/g, '');
    }

    function allowOnlyAlpha(text) {
        // We only allow a-z, and A-Z characters.
        return text.replace(/[^A-Za-z]/g, '');
    }

    function replaceMultipleSpacesWithOne(text) {
        // Multiple consequent spaces will be replaced with 1 space.
        return text.replace(/\s{2,}/g, ' ');
    }

    function stripUnwantedChars() {
        state.searchText = allowAlphaAndSpace(state.searchText);
        state.searchText = replaceMultipleSpacesWithOne(state.searchText);

        $.each(state.searchWords, function (index, word) {
            state.searchWords[index] = allowOnlyAlpha(
                state.searchWords[index]
            );
        });
    }

    function parseRawText() {
        var rawText, tempLines, searchText, numSearchWords;

        // Get the raw text.
        rawText = getRawText();
        tempLines = rawText.split('\n');

        if (tempLines.length < 3) {
            return LINES_LESS_THAN_THREE;
        }

        // The first line of test is the one that we will be search in.
        searchText = tempLines.shift();

        // The second line of text contains the number of search words.
        numSearchWords = parseInt(tempLines.shift(), 10);

        if (!isFinite(numSearchWords)) {
            return NUM_SEARCH_WORDS_INVALID;
        }

        if (numSearchWords < 1) {
            return SEARCH_WORDS_LESS_THAN_ONE;
        }

        // The rest of the lines contain search words, one word per line.
        if (numSearchWords != tempLines.length) {
            return NUM_SEARCH_WORDS_MISMATCH;
        }

        // Store the parsed data.
        state.searchText = searchText;
        state.numSearchWords = numSearchWords;
        state.searchWords = tempLines;

        return INPUT_OK;
    }

    function outputError(errStatus) {
        var e = '[ERROR]: ';

        switch (errStatus) {
            case LINES_LESS_THAN_THREE:
                writeTextToOuput(e + 'Input is less than 3 lines!');
                break;

            case NUM_SEARCH_WORDS_INVALID:
                writeTextToOuput(e + 'Number of search words is invalid!');
                break;

            case SEARCH_WORDS_LESS_THAN_ONE:
                writeTextToOuput(e + 'Number of search words less than 1!');
                break;

            case NUM_SEARCH_WORDS_MISMATCH:
                writeTextToOuput(
                    e + 'Number of search words does not match ' +
                    'actual number of lines with search words!'
                );
                break;

            default:
                writeTextToOuput(e + 'Something went wrong!');
                break;
        }

        throw '"output error"';
    }

    function writeTextToOuput(text) {
        outputText.val(text);
    }
}(jQuery));
