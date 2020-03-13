import { getCmsFromElasticSearch } from '../../../es/cms'
import { CmsSearchResult } from '../../../generated/graphql'
import { Context, DEFAULT_LIMIT } from '../../config'
import getPageInfo from '../../utils/getPageInfo'
import { CmsType } from './config'
import getCmsFilters from './filters'
import getFormattedResults, { QueryCmsSearchArgs } from './normalize'

const cmsSearch = (type: string) => async (
  _: any,
  { q, input }: QueryCmsSearchArgs,
  { loaders }: Context,
): Promise<CmsSearchResult> => {
  let { page, limit, filters: filterInput, sort } = input || {}

  // Get the page and limit from the input, otherwise use the defaults
  page = page || 1
  limit = limit || DEFAULT_LIMIT

  const from = (page - 1) * limit

  const { results, totalCount, filterCount } = await getCmsFromElasticSearch({
    q,
    limit,
    from,
    types: [type],
    filters: filterInput,
    sort,
  })

  const cmsFilters: any = await loaders.cms.load(
    `${process.env.CMS_URL}/jsonapi/taxonomy_term/themes`,
  )

  const filters = getCmsFilters(cmsFilters.value, filterCount)

  const formattedResults = getFormattedResults(results)

  return {
    totalCount,
    results: formattedResults.filter(({ type: resultType }) => type === resultType),
    pageInfo: getPageInfo(totalCount, page, limit), // Get the page info details
    filters,
  }
}

const articleSearch = cmsSearch(CmsType.Article)

const publicationSearch = cmsSearch(CmsType.Publication)

const specialSearch = cmsSearch(CmsType.Special)

export { articleSearch, publicationSearch, specialSearch }
