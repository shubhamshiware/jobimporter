import xml2js from "xml2js";

export const parseXMLToJSON = async (xmlString) => {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      explicitCharkey: false,
      charkey: "_",
      trim: true,
      normalize: true,
      normalizeTags: false,
      attrkey: "$",
      explicitRoot: false,
    });

    const result = await parser.parseStringPromise(xmlString);

    let items = [];

    if (result.channel && result.channel.item) {
      items = Array.isArray(result.channel.item)
        ? result.channel.item
        : [result.channel.item];
    } else if (result.item) {
      items = Array.isArray(result.item) ? result.item : [result.item];
    } else if (Array.isArray(result)) {
      items = result;
    } else {
      throw new Error("Unsupported XML structure");
    }

    return items;
  } catch (error) {
    console.error("XML parsing error:", error);
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
};

const extractTextValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._) return value._;
  return "";
};

export const transformToJobObjects = (items, feedUrl) => {
  return items.map((item, index) => {
    const job = {
      externalId:
        extractTextValue(item.guid) ||
        extractTextValue(item.id) ||
        extractTextValue(item.link) ||
        `${feedUrl}-${index}`,
      title: extractTextValue(item.title) || "",
      description:
        extractTextValue(item.description) ||
        extractTextValue(item.summary) ||
        "",
      company:
        extractCompanyFromDescription(extractTextValue(item.description)) ||
        extractTextValue(item.author) ||
        "Unknown",
      location:
        extractTextValue(item.location) ||
        extractLocationFromDescription(extractTextValue(item.description)) ||
        "Remote",
      type:
        extractTextValue(item.type) ||
        extractJobTypeFromDescription(extractTextValue(item.description)) ||
        "Full-time",
      url: extractTextValue(item.link) || extractTextValue(item.url) || "",
      raw: item,
      feedUrl: feedUrl,
    };

    Object.keys(job).forEach((key) => {
      if (typeof job[key] === "string") {
        job[key] = job[key].trim();
      }
    });

    return job;
  });
};

const extractCompanyFromDescription = (description) => {
  if (!description) return null;

  const companyPatterns = [
    /company:?\s*([^,\n]+)/i,
    /at\s+([^,\n]+)/i,
    /by\s+([^,\n]+)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

const extractLocationFromDescription = (description) => {
  if (!description) return null;

  const locationPatterns = [
    /location:?\s*([^,\n]+)/i,
    /in\s+([^,\n]+(?:,\s*[^,\n]+)?)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

const extractJobTypeFromDescription = (description) => {
  if (!description) return null;

  const typePatterns = [
    /(full.time|part.time|contract|freelance|internship)/i,
    /(full-time|part-time)/i,
  ];

  for (const pattern of typePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};
