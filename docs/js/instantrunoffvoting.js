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
  const UNDECIDED_ELECTION_PLACEHOLDER_TEXT = 'TIEDCANDIDATENAMES';
  const UNDECIDED_ELECTION_NOTICE_TEXT = `Undecided election due to tie between: ${UNDECIDED_ELECTION_PLACEHOLDER_TEXT}`;
  const ANIMATION_SPEED = 50;

  const ballotDataStore = {};

  let rand = null;

  // Thanks to: https://stackoverflow.com/a/9071606
  const randomChoice = choices => {
    const index = Math.floor(rand() * choices.length);
    return choices[index];
  }

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
    document.getElementById(winner.toLowerCase()).classList.add('winner');
    getBallotVisualisationElement().appendChild(createWinnerElement(winner));
  };

  const createUndecidedElectionNoticeElement = winners => {
    const noticeEl = document.createElement('p');
    noticeEl.textContent = UNDECIDED_ELECTION_NOTICE_TEXT.replace(
      UNDECIDED_ELECTION_PLACEHOLDER_TEXT, winners.join(', ')
    );
    return noticeEl;
  };

  const addUndecidedElectionNoticeToVisualisation = winners => {
    getBallotVisualisationElement().appendChild(createUndecidedElectionNoticeElement(winners));
  };

  const resetBallotData = () => {
    const store = getBallotDataStore();
    store.ballotsUndistributed = {};
    store.previousRoundTotalsByCandidate = {};
    store.currentRoundTotalsByCandidate = {};
    store.ballotsDistributedByCandidate = {};
    store.currentRoundIndex = 0;
    store.numBallots = 0;
  };

  const initialiseRoundTotalsForCandidates = () => {
    const store = getBallotDataStore();

    for (const name in store.ballotsDistributedByCandidate) {
      store.previousRoundTotalsByCandidate[name] = 0;
      store.currentRoundTotalsByCandidate[name] = 0;
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
    // Generate consistent random numbers given a set of hard-coded seed values.
    // So we can make "random" tie-breaking deterministic.
    rand = sfc32(4195720843, 3702749721, 4070552961, 2242128807);

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

  // Begin the next round of ballot distribution
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

  // Update the total number of ballots (i.e. the number of ballots in the input CSV)
  const updateNumBallots = (numBallots) => {
    updateNumBallotsInData(numBallots);
    updateNumBallotsInVisualisation(numBallots);
  };

  const removeCandidateFromData = name => {
    const store = getBallotDataStore();

    delete store.ballotsDistributedByCandidate[name];
    delete store.previousRoundTotalsByCandidate[name];
    delete store.currentRoundTotalsByCandidate[name];
  };

  const removeCandidateFromVisualisation = name => {
    document.getElementById(name.toLowerCase()).remove();
  };

  // Remove the candidate who was determined to be the loser for the round
  const removeCandidate = name => {
    removeCandidateFromData(name);
    removeCandidateFromVisualisation(name);
  };

  const removeUndistributedFromVisualisation = () => {
    getBallotsUndistributedElement().remove();
  };

  const markForRemoval = markedEl => {
    markedEl.classList.add('to-be-removed');
  };

  const markCandidateForRemoval = name => {
    markForRemoval(document.getElementById(name.toLowerCase()));
  };

  const markUndistributedForRemoval = name => {
    markForRemoval(getBallotsUndistributedElement());
  };

  // Declare one candidate as the winner of the election
  const declareWinner = winner => {
    removeContinueButtonFromVisualisation();
    addWinnerToVisualisation(winner);
  };

  // Declare that the election cannot be decided due to tied winners
  const declareUndecidedElection = winners => {
    removeContinueButtonFromVisualisation();
    addUndecidedElectionNoticeToVisualisation(winners);
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

  // Add a candidate into the simulation
  const appendCandidateFromBallot = name => {
    appendCandidateFromBallotToData(name);
    appendCandidateFromBallotToVisualisation(name);
  };

  // Add all candidates on the specified ballot into the simulation
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

  // Add the "Undistributed" ballot pile into the simulation
  const appendBallotUndistributed = (id, ballot) => {
    appendCandidatesFromBallot(id, ballot);
    const numBallots = appendBallotUndistributedData(id, ballot);
    appendBallotUndistributedVisualisation(id, ballot);

    updateNumBallots(numBallots);
  };

  // Load one ballot into the simulation, and recursively trigger loading the next one
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
      initialiseRoundTotalsForCandidates();
      appendContinueButtonToVisualisation();
    }
  };

  // Load all ballots into the simulation
  const loadBallotsFromFile = file => {
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

  // Find the candidates that are the clear losers for this round
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

  // Find the losing candidates based on results of the previous round
  const findCandidatesWithFewestBallotsPreviousRound = names => {
    const store = getBallotDataStore();
    let fewestBallotsCount = 0;

    for (const name of names) {
      const ballotsCount = store.previousRoundTotalsByCandidate[name];
      if (!fewestBallotsCount || ballotsCount < fewestBallotsCount) {
        fewestBallotsCount = ballotsCount;
      }
    }

    const losingCandidates = [];

    for (const name of names) {
      const ballotsCount = store.previousRoundTotalsByCandidate[name];
      if (ballotsCount === fewestBallotsCount) {
        losingCandidates.push(name);
      }
    }

    return losingCandidates;
  };

  // Find the losing candidate to eliminate this round, using various strategies
  const findCandidateToEliminate = () => {
    const store = getBallotDataStore();
    const candidatesWithFewestBallotsThisRound = findCandidatesWithFewestBallotsThisRound();

    // If there's a single clear loser from the current round, great, eliminate that guy
    if (candidatesWithFewestBallotsThisRound.length === 1) {
      return candidatesWithFewestBallotsThisRound[0];
    }

    // Note: if this is the final round, then we should have already (in
    // findWinningCandidates) thrown our hands up in the air and declared that "the
    // election cannot be decided", per Australia's Electoral Act 1918 (Cth) s274(9A),
    // so the below tie-breaking strategies are only used when it's NOT the final round
    const candidatesWithFewestBallotsPreviousRound =
      findCandidatesWithFewestBallotsPreviousRound(candidatesWithFewestBallotsThisRound);

    // If there are multiple losers from the current round, but of those, there's a
    // single candidate who had the fewest ballots in the previous round, then eliminate
    // that guy, per Australia's Electoral Act 1918 (Cth) s274(9)
    if (candidatesWithFewestBallotsPreviousRound.length === 1) {
      return candidatesWithFewestBallotsPreviousRound[0];
    }

    // If, of the multiple losers from the current round, two or more of them are tied
    // with having had the fewest ballots in the previous round (or if this was the
    // first round), i.e. if there's an unbreakable tie, then "decide by lot" (i.e. pick
    // a loser randomly), per Australia's Electoral Act 1918 (Cth) s274(9)
    // Note: in the interest of making this simulator deterministic (i.e. of making it
    // always produce the same result, given an input set of ballots), we initialise the
    // random number generator with a hard-coded seed value, so that it always generates
    // the same sequence of "random" numbers
    return randomChoice(candidatesWithFewestBallotsPreviousRound);
  };

  // Find the candidate(s) who has at least 50% of the ballots distributed to them
  const findWinningCandidates = () => {
    const store = getBallotDataStore();
    const winners = [];

    for (const name in store.ballotsDistributedByCandidate) {
      const numBallotsForCandidate = Object.keys(store.ballotsDistributedByCandidate[name]).length;

      if (numBallotsForCandidate / store.numBallots >= 1 / 2) {
        winners.push(name);
      }
    }

    return winners;
  };

  const saveRoundTotalsForCandidates = () => {
    const store = getBallotDataStore();

    for (const name in store.ballotsDistributedByCandidate) {
      if (store.currentRoundTotalsByCandidate[name] !== 0) {
        store.previousRoundTotalsByCandidate[name] = store.currentRoundTotalsByCandidate[name];
      }

      store.currentRoundTotalsByCandidate[name] =
        Object.keys(store.ballotsDistributedByCandidate[name]).length;
    }
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

  // Move a ballot from its current candidate to whomever is the next preference
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

  // Perform various actions at the end of a distribution round
  const finaliseRound = sourceName => {
    // Remove whichever ballot pile is now empty (because all its ballots got
    // distributed out of it and into the other piles), either the pile belonging this
    // round's losing candidate, or the "Undistributed" pile if this is the first round
    if (sourceName != null) {
      removeCandidate(sourceName);
    }
    else {
      removeUndistributedFromVisualisation();
    }

    const winners = findWinningCandidates();

    // No more rounds, we have a winner
    if (winners.length === 1) {
      declareWinner(winners[0]);
      return;
    }

    // No more rounds, this is an undecided election due to tied winners
    if (winners.length > 1) {
      declareUndecidedElection(winners);
      return;
    }

    // No winner yet, so indicate that we're ready to proceed to the next round
    saveRoundTotalsForCandidates();
    incrementRoundNumber();
  };

  // Mark a candidate or "Undistributed" for removal, then finalise the round
  const markSourceForRemovalThenFinaliseRound = sourceName => {
    if (sourceName != null) {
      markCandidateForRemoval(sourceName);
    }
    else {
      markUndistributedForRemoval();
    }

    setTimeout(
      () => {
        finaliseRound(sourceName);
      },
      getAnimationSpeed() * 20
    );
  };

  // Distribute one ballot, and recursively trigger distributing the next ballot
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
      markSourceForRemovalThenFinaliseRound(sourceName);
    }
  };

  // Distribute all ballots for this round to remaining candidates
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
