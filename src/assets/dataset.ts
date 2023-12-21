export const datasetConfig = {
  mayday: {
    name: '五月天',
    downUrl: 'https://wx-static.ddiu.site/dataset/mayday.json',
  },
  jayzhou: {
    name: '周杰伦',
    downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
  },
  jjlin: {
    name: '林俊杰',
    downUrl: 'https://wx-static.ddiu.site/dataset/jjlin.json',
  },
} as Record<string, {
  name: string
  downUrl: string
}>