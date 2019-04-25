// Sets up the options object needed to send with GetProblems request
const options = (
  pageNum,
  problemsPerPage,
  setupId = 15,
  holdSets = [],
  configAngle = ''
) => {
  const setupFilter = `setupId~eq~'${setupId}'`;
  const holdsetsFilter =
    holdSets.length > 0 ? `~and~Holdsets~eq~'${holdSets.join()}'` : '';
  const configAngleFilter =
    configAngle.length > 0 ? `~and~Configuration~eq~'${configAngle}'` : '';

  return {
    method: 'POST',
    mode: 'cors',
    referrer: 'https://www.moonboard.com/Problems/Index',
    referrerPolicy: 'no-referrer-when-downgrade',
    crossDomain: true,
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest'
    },
    body: `sort=&page=${pageNum}&pageSize=${problemsPerPage}&group=&filter=${setupFilter}${holdsetsFilter}${configAngleFilter}`
  };
};

// Sends data GET request with specified options and chunk size
const getProblemDataChunk = async (pageNum, problemChunkSize) => {
  let response = await fetch(
    'https://www.moonboard.com/Problems/GetProblems',
    options(pageNum, problemChunkSize)
  );

  if (response && response.ok) {
    return (await response.json()).Data;
  } else {
    console.log(`Something went wrong with request ${pageNum}`);
    return [];
  }
};

// Set the filters on the page and look at how many problems there are and enter that here.
const getAllProblems = async (
  totalNumberOfProblems,
  problemChunkSize = 500
) => {
  const numberOfRequestsNecessary = Math.ceil(
    totalNumberOfProblems / problemChunkSize
  );
  const leftOvers = totalNumberOfProblems % problemChunkSize;

  let allProblems = [];

  for (let i = 0; i < numberOfRequestsNecessary; i++) {
    const chunkNum = i + 1;
    let problemChunk;

    console.log(`Request ${chunkNum}/${numberOfRequestsNecessary}`);

    if (i + 1 !== numberOfRequestsNecessary) {
      problemChunk = await getProblemDataChunk(chunkNum, problemChunkSize);
    } else {
      problemChunk = await getProblemDataChunk(
        chunkNum,
        leftOvers !== 0 ? leftOvers : problemChunkSize
      );
    }

    allProblems = [...allProblems, ...problemChunk];
  }

  return allProblems;
};

const saveData = function(data, console) {
  if (!data) {
    console.error('No data to save!');
    return;
  }

  var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  const filename = `moonboard_problems_${[year, month, day].join('')}`;

  if (typeof data === 'object') {
    data = JSON.stringify(data, undefined, 4);
  }

  var blob = new Blob([data], { type: 'text/json' }),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a');

  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initMouseEvent('click');
  a.dispatchEvent(e);
};

const problems = await getAllProblems(100, 50);
saveData(problems, console);
