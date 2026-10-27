/* Preserve provenance to the original college plans without editing generated study-content.js. */
(function () {
  const mapping = {"k1-1": [1], "k1-2": [7], "k1-3": [5], "k1-4": [12, 13], "k1-5": [1, 5, 12], "k1-6": [6], "k1-7": [8], "k1-8": [9], "k1-9": [10], "k1-10": [2], "k1-11": [3], "k1-12": [4], "k1-13": [11], "k1-14": [13], "k1-15": [14], "k1-16": [15], "k1-17": [16], "k1-18": [17], "k1-19": [18], "k1-20": [19], "k1-21": [20], "k1-22": [21], "k1-23": [22], "k1-24": [23], "k1-25": [24, 25], "k1-26": [26]};
  const source = {...window.STUDY_CONTENT.lessons};
  for (const [id, originals] of Object.entries(mapping)) {
    const pair = window.LEARN_PAIRS[id], prior = source['k1-' + originals[0]];
    const topicOverrides = {'k1-4':['bug-report','severity-priority','tool-evidence'], 'k1-5':['testing-qa','test-case','bug-report','severity-priority'], 'k1-14':['api-basics','tool-console','tool-network','tool-evidence']};
    if (pair?.originalPairs) window.STUDY_CONTENT.lessons[id] = {...prior, ...pair,
      source: {...prior.source, pair: Number(id.slice(3)), originalPairs: originals},
      topics: topicOverrides[id] || [...new Set(originals.flatMap(n => source['k1-' + n].topics))]};
  }
  const oldToNew = {"1": 1, "7": 2, "5": 3, "12": 4, "6": 6, "8": 7, "9": 8, "10": 9, "2": 10, "3": 11, "4": 12, "11": 13, "13": 14, "14": 15, "15": 16, "16": 17, "17": 18, "18": 19, "19": 20, "20": 21, "21": 22, "22": 23, "23": 24, "24": 25, "26": 26, "25": 25};
  for (const topic of window.STUDY_CONTENT.topics) {
    if (topic.pairs?.k1) topic.pairs.k1 = [...new Set(topic.pairs.k1.map(n => oldToNew[n] || n))].sort((a,b)=>a-b);
    const exact = {'severity-priority':[4,5,15,21,24], 'defense':[25,26], 'api-basics':[14], 'tool-console':[14], 'tool-network':[14], 'test-statuses':[2,3,18,24]}[topic.id];
    if (exact) { topic.pairs ||= {}; topic.pairs.k1 = exact; }
  }
  window.K1_CURRICULUM = {revision: '20261027', mapping};
})();
