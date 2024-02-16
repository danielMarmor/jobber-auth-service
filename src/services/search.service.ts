import { elasticeSearchClient, getDocumentById } from "@auth/elasticsearch"
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerGig } from "@danielmarmor/jobber-shared";
import { SearchResponse, SearchRequest, SortResults } from "@elastic/elasticsearch/lib/api/types";

export const getGigById = async (index: string, gigId: string): Promise<ISellerGig | undefined> => {
    const result = await getDocumentById(index, gigId);
    return result;
}

export const searchGigs = async (searchQuery: string,
    paginate: IPaginateProps,
    deliveryTime?: string,
    min?: number,
    max?: number): Promise<ISearchResult> => {
    const { from, size, type } = paginate;
    const queryList: IQueryList[] = [
        {
            query_string: {
                fields: ["username", "title", "description", "basicDescription",
                    "basicTitle", "categories", "subCategories", "tags"],
                query: `${searchQuery}`
            }
        },
        {
            term: {
                active: true
            }
        }
    ];
    if (deliveryTime !== "undefined") {
        queryList.push({
            query_string: {
                fields: ["expectedDelivery"],
                query: `*${deliveryTime}*`
            }
        })
    }
    const isRange = (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`)));
    if (isRange) {
        queryList.push({
            range: {
                price: {
                    gte: min,
                    lte: max
                }
            }
        })
    }

    const request: SearchRequest = {
        index: 'gigs',
        size: size,
        query: {
            bool: {
                must: [...queryList]
            }
        },
    }
    if (from !== "0") {
        request.search_after = [from];
    }

    const result: SearchResponse = await elasticeSearchClient.search(request);
    const total = result.hits.total as IHitsTotal;
    const hits = result.hits.hits;

    return {
        total: total.value,
        hits: hits
    }
} 