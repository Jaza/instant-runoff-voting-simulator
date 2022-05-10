ready(() => {
  const NUM_BALLOTS_PLACEHOLDER_TEXT = 'NUMBALLOTS';
  const BALLOTS_TITLE = `Results (from ${NUM_BALLOTS_PLACEHOLDER_TEXT} ballots)`;
  const BALLOT_FILE_ELEMENT_ID = 'ballot-file';
  const BALLOT_VISUALISATION_ELEMENT_ID = 'ballot-visualisation';
  const BALLOT_VISUALISATION_INNER_ELEMENT_ID = 'ballot-visualisation-inner';
  const BALLOT_CONTINUE_BUTTON_ID = 'ballot-continue-button';
  const BALLOTS_UNDISTRIBUTED_LABEL = 'Undistributed';
  const ROUND_NUMBER_PLACEHOLDER_TEXT = 'ROUNDNUM';
  const EXECUTE_NEXT_ROUND_BUTTON_LABEL = `Run round ${ROUND_NUMBER_PLACEHOLDER_TEXT}`;
  const WINNER_PLACEHOLDER_TEXT = 'WINNERNAME';
  const WINNER_TEXT = `${WINNER_PLACEHOLDER_TEXT} is the winner!`;
  const ANIMATION_SPEED = 50;

  const ballotDataStore = {};

  const getAnimationSpeed = () => {
    return ANIMATION_SPEED;
  };

  const getBallotDataStore = () => {
    return ballotDataStore;
  };

  const getBallotVisualisationElement = () => {
    return document.getElementById(BALLOT_VISUALISATION_ELEMENT_ID);
  };

  const getBallotVisualisationInnerElement = () => {
    return document.getElementById(BALLOT_VISUALISATION_INNER_ELEMENT_ID);
  };

  const getBallotsUndistributedElement = () => {
    return document.getElementById(BALLOTS_UNDISTRIBUTED_LABEL.toLowerCase());
  };

  const createBallotElement = (id, ballot) => {
    const ballotEl = document.createElement('li');
    ballotEl.id = id;

    for (const name in ballot) {
      const preferenceEl = document.createElement('p');
      const nameEl = document.createElement('span');
      nameEl.textContent = name[0];
      preferenceEl.appendChild(nameEl);
      const voteEl = document.createElement('span');
      voteEl.textContent = `${ballot[name]}`;
      preferenceEl.appendChild(voteEl);
      ballotEl.appendChild(preferenceEl);
    }

    return ballotEl;
  };

  const createBallotsElement = name => {
    const ballotsEl = document.createElement('div');
    ballotsEl.id = name.toLowerCase();
    const ballotsListEl = document.createElement('ul');
    ballotsEl.appendChild(ballotsListEl);
    labelEl = document.createElement('h3');
    labelEl.textContent = name;
    ballotsEl.appendChild(labelEl);
    return ballotsEl;
  };

  const createContinueButton = () => {
    const store = getBallotDataStore();
    const buttonContainerEl = document.createElement('p');
    const buttonEl = document.createElement('button');
    buttonEl.id = BALLOT_CONTINUE_BUTTON_ID;
    buttonEl.textContent = EXECUTE_NEXT_ROUND_BUTTON_LABEL.replace(
      ROUND_NUMBER_PLACEHOLDER_TEXT, `${store.currentRoundIndex + 1}`
    );
    buttonContainerEl.appendChild(buttonEl);
    return buttonContainerEl;
  };

  const appendContinueButtonToVisualisation = () => {
    const buttonContainerEl = createContinueButton();
    buttonContainerEl.querySelector('button').addEventListener('click', continueButtonListener);
    getBallotVisualisationElement().appendChild(buttonContainerEl);
  };

  const removeContinueButtonFromVisualisation = () => {
    document.getElementById(BALLOT_CONTINUE_BUTTON_ID).parentNode.remove();
  };

  const createWinnerElement = winner => {
    const winnerEl = document.createElement('p');
    winnerEl.textContent = WINNER_TEXT.replace(WINNER_PLACEHOLDER_TEXT, winner);
    return winnerEl;
  };

  const addWinnerToVisualisation = winner => {
    getBallotVisualisationElement().appendChild(createWinnerElement(winner));
  };

  const resetBallotData = () => {
    const store = getBallotDataStore();
    store.ballotsUndistributed = {};
    store.previousRoundTotalsByCandidate = {};
    store.ballotsDistributedByCandidate = {};
    store.currentRoundIndex = 0;
    store.numBallots = 0;
  };

  const initialisePreviousRoundTotalsForCandidates = () => {
    const store = getBallotDataStore();

    for (const name in store.ballotsDistributedByCandidate) {
      store.previousRoundTotalsByCandidate[name] = 0;
    }
  };

  const resetBallotVisualisation = () => {
    const container = getBallotVisualisationElement();

    let child = container.lastElementChild;
    while (child != null) {
      container.removeChild(child);
      child = container.lastElementChild;
    }

    const titleEl = document.createElement('h2');
    titleEl.textContent = BALLOTS_TITLE.replace(NUM_BALLOTS_PLACEHOLDER_TEXT, '0');
    container.appendChild(titleEl);

    const innerEl = document.createElement('div');
    innerEl.id = BALLOT_VISUALISATION_INNER_ELEMENT_ID;
    container.appendChild(innerEl);

    const undistributedEl = createBallotsElement(BALLOTS_UNDISTRIBUTED_LABEL);
    innerEl.appendChild(undistributedEl);
  };

  const resetBallots = () => {
    resetBallotData();
    resetBallotVisualisation();
  };

  const incrementRoundNumberInData = () => {
    const store = getBallotDataStore();
    store.currentRoundIndex += 1;
    return store.currentRoundIndex;
  };

  const incrementRoundNumberInVisualisation = (roundIndex) => {
    const buttonEl = document.getElementById(BALLOT_CONTINUE_BUTTON_ID);
    buttonEl.textContent = EXECUTE_NEXT_ROUND_BUTTON_LABEL.replace(
      ROUND_NUMBER_PLACEHOLDER_TEXT, `${roundIndex + 1}`
    );
  };

  const incrementRoundNumber = () => {
    const roundIndex = incrementRoundNumberInData();
    incrementRoundNumberInVisualisation(roundIndex);
  };

  const updateNumBallotsInData = (numBallots) => {
    const store = getBallotDataStore();
    store.numBallots = numBallots;
  };

  const updateNumBallotsInVisualisation = (numBallots) => {
    const container = getBallotVisualisationElement();
    container.querySelector('h2').textContent = BALLOTS_TITLE.replace(
      NUM_BALLOTS_PLACEHOLDER_TEXT, `${numBallots}`
    );
  };

  const updateNumBallots = (numBallots) => {
    updateNumBallotsInData(numBallots);
    updateNumBallotsInVisualisation(numBallots);
  };

  const removeCandidateFromData = name => {
    const store = getBallotDataStore();

    delete store.ballotsDistributedByCandidate[name];
    delete store.previousRoundTotalsByCandidate[name];
  };

  const removeCandidateFromVisualisation = name => {
    document.getElementById(name.toLowerCase()).remove();
  };

  const removeCandidate = name => {
    removeCandidateFromData(name);
    removeCandidateFromVisualisation(name);
  };

  const removeUndistributedFromVisualisation = () => {
    getBallotsUndistributedElement().remove();
  };

  const declareWinner = winner => {
    removeContinueButtonFromVisualisation();
    addWinnerToVisualisation(winner);
  };

  const appendCandidateFromBallotToData = name => {
    const store = getBallotDataStore();
    store.ballotsDistributedByCandidate[name] = {};
  };

  const appendCandidateFromBallotToVisualisation = name => {
    const container = getBallotVisualisationInnerElement();

    const candidateEl = createBallotsElement(name);
    container.appendChild(candidateEl);
  };

  const appendCandidateFromBallot = name => {
    appendCandidateFromBallotToData(name);
    appendCandidateFromBallotToVisualisation(name);
  };

  const appendCandidatesFromBallot = (id, ballot) => {
    const store = getBallotDataStore();

    for (const name in ballot) {
      if (!(name in store.ballotsDistributedByCandidate)) {
        appendCandidateFromBallot(name);
      }
    }
  };

  const appendBallotUndistributedData = (id, ballot) => {
    const store = getBallotDataStore();
    store.ballotsUndistributed[id] = ballot;
    return Object.keys(store.ballotsUndistributed).length;
  };

  const appendBallotUndistributedVisualisation = (id, ballot) => {
    const undistributedEl = getBallotsUndistributedElement();
    undistributedEl.querySelector('ul').prepend(createBallotElement(id, ballot));
  };

  const appendBallotUndistributed = (id, ballot) => {
    appendCandidatesFromBallot(id, ballot);
    const numBallots = appendBallotUndistributedData(id, ballot);
    appendBallotUndistributedVisualisation(id, ballot);

    updateNumBallots(numBallots);
  };

  const loadNextBallotFromfile = (result, results) => {
    const id = crypto.randomUUID();
    const ballot = {
      ...result
    };

    appendBallotUndistributed(id, ballot);

    if (results.length) {
      setTimeout(
        () => {
          const moreResults = results.slice();
          const nextResult = moreResults.pop();
          loadNextBallotFromfile(nextResult, moreResults);
        },
        getAnimationSpeed()
      );
    }
    else {
      initialisePreviousRoundTotalsForCandidates();
      appendContinueButtonToVisualisation();
    }
  };

  const loadBallotsFromFile = (file) => {
    Papa.parse(
      file,
      {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: results => {
          if (results.data.length) {
            const moreResults = results.data.slice();
            const nextResult = moreResults.pop();
            loadNextBallotFromfile(nextResult, moreResults);
          }
        }
      }
    );
  };

  const findCandidatesWithFewestBallotsThisRound = () => {
    const store = getBallotDataStore();
    let fewestBallotsCount = 0;

    for (const name in store.ballotsDistributedByCandidate) {
      const ballotsCount = Object.keys(store.ballotsDistributedByCandidate[name]).length;
      if (!fewestBallotsCount || ballotsCount < fewestBallotsCount) {
        fewestBallotsCount = ballotsCount;
      }
    }

    const losingCandidates = [];

    for (const name in store.ballotsDistributedByCandidate) {
      const ballotsCount = Object.keys(store.ballotsDistributedByCandidate[name]).length;
      if (ballotsCount === fewestBallotsCount) {
        losingCandidates.push(name);
      }
    }

    return losingCandidates;
  };

  const findCandidateToEliminate = () => {
    const candidatesWithFewestBallotsThisRound = findCandidatesWithFewestBallotsThisRound();

    if (candidatesWithFewestBallotsThisRound.length === 1) {
      return candidatesWithFewestBallotsThisRound[0];
    }

    throw new Error('TODO: resolve tied losing candidates');
  };

  const findWinningCandidate = () => {
    const store = getBallotDataStore();
    const winners = []

    for (const name in store.ballotsDistributedByCandidate) {
      const numBallotsForCandidate = Object.keys(store.ballotsDistributedByCandidate[name]).length;

      if (numBallotsForCandidate / store.numBallots >= 1 / 2) {
        winners.push(name);
      }
    }

    if (winners.length > 1) {
      throw new Error('Only one may emerge victorious');
    }

    if (!winners.length) {
      return null;
    }

    return winners[0];
  };

  const distributeBallotInData = (id, sourceBallots, vote) => {
    const store = getBallotDataStore();

    if (!(vote in store.ballotsDistributedByCandidate)) {
      throw new Error(`Unable to distribute ballot to ${vote}`);
    }

    const ballot = sourceBallots[id];
    delete sourceBallots[id];
    store.ballotsDistributedByCandidate[vote][id] = ballot;
  };

  const distributeBallotInVisualisation = (id, vote) => {
    const ballotEl = document.getElementById(id);
    const ballotsEl = document.getElementById(vote.toLowerCase());
    ballotsEl.querySelector('ul').appendChild(ballotEl);
  };

  const distributeBallot = (id, sourceName, sourceBallots) => {
    const store = getBallotDataStore();

    const ballot = sourceBallots[id];
    const sourcePreference = sourceName != null ? ballot[sourceName] : 0;

    let vote = null;
    let currentPreferenceDelta = 0;

    while (vote == null && currentPreferenceDelta < Object.keys(ballot).length - 1) {
      const currentPreference = sourcePreference + currentPreferenceDelta + 1;

      for (const name in ballot) {
        if (ballot[name] === currentPreference && (name in store.ballotsDistributedByCandidate)) {
          vote = name;
        }
      }

      currentPreferenceDelta += 1;
    }

    if (vote == null) {
      throw new Error(
        `Found a ballot with source preference ${sourcePreference} but no further valid preferences`
      );
    }

    distributeBallotInData(id, sourceBallots, vote);
    distributeBallotInVisualisation(id, vote);
  };

  const distributeNextBallotForRound = (roundIndex, id, sourceName, sourceBallots) => {
    distributeBallot(id, sourceName, sourceBallots);

    if (Object.keys(sourceBallots).length) {
      setTimeout(
        () => {
          const nextId = Object.keys(sourceBallots)[0];
          distributeNextBallotForRound(roundIndex, nextId, sourceName, sourceBallots);
        },
        getAnimationSpeed()
      );
    }
    else {
      if (sourceName != null) {
        removeCandidate(sourceName);
      }
      else {
        removeUndistributedFromVisualisation();
      }

      const winner = findWinningCandidate();

      if (winner != null) {
        declareWinner(winner);
      }
      else {
        incrementRoundNumber();
      }
    }
  };

  const distributeBallotsForRound = roundIndex => {
    const store = getBallotDataStore();
    const sourceName = !!roundIndex ? findCandidateToEliminate() : null;
    const sourceBallots = sourceName != null
      ? store.ballotsDistributedByCandidate[sourceName]
      : store.ballotsUndistributed;

    if (!Object.keys(sourceBallots).length) {
      throw new Error('No source ballots found, unable to distribute ballots');
    }

    const nextId = Object.keys(sourceBallots)[0];

    distributeNextBallotForRound(roundIndex, nextId, sourceName, sourceBallots);
  };

  const continueButtonListener = e => {
    const store = getBallotDataStore();
    distributeBallotsForRound(store.currentRoundIndex);
  };

  const ballotFileListener = e => {
    const fileList = e.target.files;

    if (!fileList.length) {
      return;
    }

    resetBallots();
    loadBallotsFromFile(fileList[0]);
  };

  const init = () => {
    const fileSelector = document.getElementById(BALLOT_FILE_ELEMENT_ID);
    fileSelector.addEventListener('change', ballotFileListener);
  };

  init();
});
