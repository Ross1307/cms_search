import { articleSearch, publicationSearch, specialSearch } from './cms'
import dataResolver from './data/dataResolver'
import datasetSearch from './datasets'
import datasetFilters from './datasets/filters'

export default {
  Query: {
    articleSearch,
    dataSearch: dataResolver,
    datasetSearch,
    publicationSearch,
    specialSearch,
    getDatasetFilters: datasetFilters,
  },
}
