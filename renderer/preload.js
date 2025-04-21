const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('hskDataAPI', {
  getHSKData: () => {
    const dataPath = path.join(__dirname, 'data', 'hsk3.json');
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
  }
});