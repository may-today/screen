export const datasetConfig = {
  mayday: {
    name: '五月天',
    downUrl: 'https://wx-static.ddiu.site/dataset/mayday-5525.json',
  },
  jayzhou: {
    name: '周杰伦',
    downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
  },
  jjlin: {
    name: '林俊杰',
    downUrl: 'https://wx-static.ddiu.site/dataset/jjlin.json',
  },
  fhcq: {
    name: '凤凰传奇',
    downUrl: 'https://wx-static.ddiu.site/dataset/fhcq.json',
  },
} as Record<string, {
  name: string
  downUrl: string
}>