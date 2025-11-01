import axios from "axios";
import { parseXMLToJSON, transformToJobObjects } from "../utils/xmlParser.js";
import { processFeedData } from "./importService.js";

const JOB_FEEDS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

export const fetchFeedData = async (feedUrl) => {
  try {
    console.log(`Fetching data from: ${feedUrl}`);

    const response = await axios.get(feedUrl, {
      timeout: 30000, // 30 sec
      headers: {
        "User-Agent": "Job Importer Bot/1.0",
        Accept: "application/xml, text/xml, */*",
      },
    });

    const xmlData = response.data;

    const parsedItems = await parseXMLToJSON(xmlData);

    const jobObjects = transformToJobObjects(parsedItems, feedUrl);

    console.log(`Fetched ${jobObjects.length} jobs from ${feedUrl}`);

    return {
      feedUrl,
      jobs: jobObjects,
      totalFetched: jobObjects.length,
    };
  } catch (error) {
    console.error(`Error fetching from ${feedUrl}:`, error.message);
    throw new Error(`Failed to fetch from ${feedUrl}: ${error.message}`);
  }
};

export const fetchAllFeeds = async () => {
  console.log("Starting fetch from all job feeds...");

  const results = [];
  const errors = [];

  for (const feedUrl of JOB_FEEDS) {
    try {
      const feedData = await fetchFeedData(feedUrl);
      results.push(feedData);

      await processFeedData(feedData);
    } catch (error) {
      console.error(`Failed to process feed ${feedUrl}:`, error);
      errors.push({
        feedUrl,
        error: error.message,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    `Fetch completed. Processed ${results.length} feeds successfully, ${errors.length} failed.`
  );

  return {
    success: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

export const fetchSingleFeed = async (feedUrl) => {
  try {
    const feedData = await fetchFeedData(feedUrl);
    await processFeedData(feedData);

    return {
      success: true,
      feedUrl,
      totalFetched: feedData.totalFetched,
    };
  } catch (error) {
    console.error(`Failed to fetch single feed ${feedUrl}:`, error);
    throw error;
  }
};
