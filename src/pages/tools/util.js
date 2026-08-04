import { useState } from 'react';

export const useSearchFilters = (initialFilters) => {
  const [searchInputs, setSearchInputs] = useState(initialFilters);

  const handleInputChange = (field, value) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return [searchInputs, handleInputChange];
};

export const buildTextMustClauses = (textEntries, fieldKey) => {
    return [{
        bool: {
            should: textEntries.value.map(entry => ({
                term: {
                    [fieldKey]: entry
                }
            })),
            minimum_should_match: 1
        }
    }];
};

//   FUZZY     - This PRE-DATES the concatenated-name fix and is the usual cause of noisy
//               results. Set FUZZY: false to fall back to an exact (non-fuzzy) match.
//   SUBSTRING - lowercased wildcard so names stored as one token are reachable,
//               e.g. "School" -> "SchoolSafe", "Deep" -> "DeepnDelicious". This is
//               the part that closes issue. Set SUBSTRING: false to drop it.
//
// To fully revert to the original behaviour: FUZZY true, SUBSTRING false.
const PRODUCT_NAME_MATCH = {
    FUZZY: true,
    SUBSTRING: true,
};

export const buildProductNameClause = (value) => {
    const should = [
        PRODUCT_NAME_MATCH.FUZZY
            ? { match: { site_name: { query: value, operator: "and", fuzziness: "AUTO" } } }
            : { match: { site_name: { query: value, operator: "and" } } },
    ];

    if (PRODUCT_NAME_MATCH.SUBSTRING) {
        should.push({ wildcard: { site_name: { value: `*${value.toLowerCase()}*` } } });
    }

    return { bool: { should, minimum_should_match: 1 } };
};

// --- Shared clause helpers ---

const buildSourceClause = (source) => {
    if (!source || source.value === null) return null;
    return { term: { "source.id": parseInt(source.value, 10) } };
};

const buildStoreClause = (store) => {
    if (!store || store.value === null) return null;
    return { term: { "store.id": parseInt(store.value, 10) } };
};

const buildRegionClause = (region) => {
    if (!region || region.value === null) return null;
    return { term: { "scrape_batch.region.keyword": region.value } };
};

const buildCategoriesClause = (categories) => {
    if (!categories || !categories.value || categories.value.length === 0) return null;
    return {
        nested: {
            path: "categories",
            query: { terms: { "categories.id": categories.value } }
        }
    };
};

const buildDateRangeClause = (startDate, endDate) => {
    const range = {};
    if (startDate?.value) range.gte = startDate.value;
    if (endDate?.value) range.lte = endDate.value;
    if (Object.keys(range).length === 0) return null;
    return { range: { "scrape_batch.datetime": range } };
};

export const buildTextMustClausesForAllFields = (searchInputs) => {
    const mustClauses = [];

    if (searchInputs.Names) {
        mustClauses.push(buildProductNameClause(searchInputs.Names));
    }
    if (searchInputs.IDs) {
        mustClauses.push({ term: { "id": searchInputs.IDs } });
    }
    if (searchInputs.ExternalIDs) {
        mustClauses.push({ term: { "external_id": searchInputs.ExternalIDs } });
    }
    if (searchInputs.UPCs) {
        mustClauses.push({ term: { "raw_upc.keyword": searchInputs.UPCs } });
    }
    if (searchInputs.NielsenUPCs) {
        mustClauses.push({ term: { "nielsen_upc.keyword": searchInputs.NielsenUPCs } });
    }

    const sourceClause = buildSourceClause(searchInputs.Source);
    if (sourceClause) mustClauses.push(sourceClause);

    const storeClause = buildStoreClause(searchInputs.Store);
    if (storeClause) mustClauses.push(storeClause);

    const regionClause = buildRegionClause(searchInputs.Region);
    if (regionClause) mustClauses.push(regionClause);

    if (searchInputs.Storage) {
        mustClauses.push({
            wildcard: {
                "storage_condition": { value: `*${searchInputs.Storage}*` }
            }
        });
    }
    if (searchInputs.Packaging) {
        mustClauses.push({
            bool: {
                should: [
                    { wildcard: { "primary_package_material": { value: `*${searchInputs.Packaging}*` } } },
                    { wildcard: { "secondary_package_material": { value: `*${searchInputs.Packaging}*` } } }
                ],
                minimum_should_match: 1
            }
        });
    }
    if (searchInputs.Allergens) {
        mustClauses.push({
            nested: {
                path: "allergens_warnings",
                query: {
                    bool: {
                        should: [
                            { wildcard: { "allergens_warnings.contains_en": { value: `*${searchInputs.Allergens}*` } } },
                            { wildcard: { "allergens_warnings.may_contain_en": { value: `*${searchInputs.Allergens}*` } } }
                        ],
                        minimum_should_match: 1
                    }
                }
            }
        });
    }
    if (searchInputs.Ingredients) {
        // ingredients is a plain object (not a nested type), so its sub-fields are queried directly.
        // Split on commas so each ingredient is matched independently. match_phrase analyzes the
        // query (lowercasing + tokenizing), so multi-word ingredients like "wheat flour" and any
        // letter case both work. Each ingredient may appear in the English or French list.
        const ingredientTerms = searchInputs.Ingredients
            .split(',')
            .map(term => term.trim())
            .filter(Boolean);

        const ingredientClauses = ingredientTerms.map(term => ({
            bool: {
                should: [
                    { match_phrase: { "ingredients.en": term } },
                    { match_phrase: { "ingredients.fr": term } }
                ],
                minimum_should_match: 1
            }
        }));

        if (ingredientClauses.length > 0) {
            if (searchInputs.IngredientsMatch === 'any') {
                // Match products containing at least one of the listed ingredients.
                mustClauses.push({ bool: { should: ingredientClauses, minimum_should_match: 1 } });
            } else {
                // Match products containing every listed ingredient (default).
                mustClauses.push(...ingredientClauses);
            }
        }
    }

    const categoriesClause = buildCategoriesClause(searchInputs.Categories);
    if (categoriesClause) mustClauses.push(categoriesClause);

    const dateClause = buildDateRangeClause(searchInputs.StartDate, searchInputs.EndDate);
    if (dateClause) mustClauses.push(dateClause);

    return mustClauses;
};

export const buildFilterClauses = (searchInputs) => {
    const filters = [];

    try {
        const sourceClause = buildSourceClause(searchInputs.Source);
        if (sourceClause) filters.push(sourceClause);

        const storeClause = buildStoreClause(searchInputs.Store);
        if (storeClause) filters.push(storeClause);

        const regionClause = buildRegionClause(searchInputs.Region);
        if (regionClause) filters.push(regionClause);

        const categoriesClause = buildCategoriesClause(searchInputs.Categories);
        if (categoriesClause) filters.push(categoriesClause);

        const dateClause = buildDateRangeClause(searchInputs.StartDate, searchInputs.EndDate);
        if (dateClause) filters.push(dateClause);
    } catch (error) {
        console.error('Error building filter clauses:', error);
    }

    return filters;
};

export const getFieldKey = (inputMode) => {
    switch(inputMode) {
        case 'Name':
            return 'site_name.keyword';
        case 'ID':
            return 'id';
        case 'UPC':
            return 'raw_upc.keyword';
        case 'Nielsen_UPC':
            return 'nielsen_upc.keyword';
        default:
            return 'site_name.keyword';
    }
};
