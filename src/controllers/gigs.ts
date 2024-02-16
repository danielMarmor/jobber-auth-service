import { getGigById, searchGigs } from "@auth/services/search.service";
import { IPaginateProps, ISearchResult } from "@danielmarmor/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sortBy } from "lodash";

export const GIGS_INDEX = "gigs";

export const gigs = async (req: Request, res: Response) => {
    const { from, size, type } = req.params;
    const paginate: IPaginateProps = {
        from: from,
        size: parseInt(size),
        type: type
    }
    let resultsHits: unknown[] = [];
    const search: ISearchResult = await searchGigs(
        `${req.query.query}`,
        paginate,
        `${req.query.deliveryTime}`,
        parseInt(`${req.query.minPrice}`),
        parseInt(`${req.query.maxPrice}`)
    );
    for (const item of search.hits) {
        resultsHits.push(item._source)
    }
    if (type === "backward") {
        resultsHits = sortBy(resultsHits, ["sortId"]);
    }
    res.status(StatusCodes.OK).json({ message: "gigs search results", total: search.total, gigs: resultsHits })
}

export const singleGig = async (req: Request, res: Response) => {
    const gig = await getGigById(GIGS_INDEX, req.params.gigId);
    res.status(StatusCodes.OK).json({ message: "sigle gig result", gig: gig })
}