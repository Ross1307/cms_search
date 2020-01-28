import { DATA_SEARCH_FILTER, DATA_SEARCH_ENDPOINTS } from './config'
import { DataSearchResultType, FilterOptions, Filter } from '../../../generated/graphql'

export default (results: DataSearchResultType[]): { filters: Array<Filter> } => {
  const filters = [
    {
      type: DATA_SEARCH_FILTER.type,
      label: DATA_SEARCH_FILTER.label,
      options: DATA_SEARCH_ENDPOINTS.map(
        // Return all the available data types as filter options
        (result: any): FilterOptions => {
          const { count = 0 } = results.find(({ type }: any) => type === result.type) || {}

          return {
            id: result.type,
            label: result.label,
            count,
          }
        },
      ),
    },
  ]

  return {
    filters,
  }
}
