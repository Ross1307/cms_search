import { DatasetSearchResult, QueryDatasetSearchArgs } from '../../../generated/graphql'
import { getDatasetsEndpoint, normalizeDatasets } from './normalize'
import getFilters from './filters'
import DataError from '../../utils/DataError'
import getPageInfo from '../../utils/getPageInfo'
import { DCAT_ENDPOINTS } from './config'
import { Context, DEFAULT_LIMIT } from '../../config'

export default async (
  _: any,
  { q = '', input }: QueryDatasetSearchArgs,
  context: Context,
): Promise<DatasetSearchResult> => {
  const { loaders } = context
  let { page, limit, filters: filterInput } = input || {}

  // Get the page and limit from the input, otherwise use the defaults
  page = page || 1
  limit = limit || DEFAULT_LIMIT

  const from = (page - 1) * limit

  // Constructs the url to retrieve the datasets
  const datasetsUrl = getDatasetsEndpoint(q, from, limit, filterInput || [])

  let results: any = []
  let totalCount = 0

  // Get the results from the DataLoader
  const [datasets, openApiResults]: any = await Promise.all([
    await loaders.datasets.load(datasetsUrl),
    await loaders.datasets.load(DCAT_ENDPOINTS['openapi']),
  ])

  // If an error is thrown, delete the key from the cache and throw an error
  if (datasets.status && datasets.status !== 200 && datasets.message) {
    loaders.datasets.clear(datasetsUrl)

    results = new DataError(null, 'datasets', 'Datasets')
  } else {
    results = normalizeDatasets(datasets['dcat:dataset'], openApiResults)
  }

  totalCount = datasets['void:documents']

  // Get the available filters and merge with the results to get a count
  const filters = getFilters(datasets['ams:facet_info'], openApiResults)

  // Get the page info details
  const pageInfo = getPageInfo(totalCount, page, limit)

  return {
    totalCount,
    results,
    ...filters,
    ...pageInfo,
  }
}
