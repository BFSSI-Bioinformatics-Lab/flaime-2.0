import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Typography, Divider, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, Grid, Card, CardContent,
    CircularProgress, Alert, TextField
} from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import SourceSelector from '../../../components/inputs/SourceSelector';
import { GetSourceCollectionStats } from '../../../api/services/SourceService';

// First 10 preservatives from Health Canada's List of Permitted Preservatives.
const ADDITIVES = [
    'Acetic Acid',
    'Ascorbic Acid',
    'Ascorbyl Palmitate',
    'Ascorbyl Stearate',
    'Benzoic Acid',
    'Butylated Hydroxyanisole',
    'Butylated Hydroxytoluene',
    'Calcium Ascorbate',
    'Calcium Propionate',
    'Calcium Sorbate',
];

// Nutrient IDs confirmed against the nutrients table in the database.
const NUTRIENT_CONFIG = [
    { label: 'Sodium',        ids: [307],       unit: 'mg' },
    { label: 'Total Sugars',  ids: [269, 917],  unit: 'g'  },
    { label: 'Saturated Fat', ids: [606],        unit: 'g'  },
];

const CollectionStats = () => {
    const [sourceId, setSourceId] = useState(null);
    const [esStats, setEsStats]   = useState(null);
    const [dbStats, setDbStats]   = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState('');

    const [selectedAdditive, setSelectedAdditive]       = useState(null);
    const [additiveProducts, setAdditiveProducts]       = useState([]);
    const [additiveProductsLoading, setAdditiveProductsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSourceChange = (value) => {
        setSourceId(value === '-1' ? null : value);
        setEsStats(null);
        setDbStats(null);
        setError('');
        setSelectedAdditive(null);
        setAdditiveProducts([]);
    };

    const fetchAdditiveProducts = useCallback(async (name) => {
        setSelectedAdditive(name);
        setAdditiveProducts([]);
        setAdditiveProductsLoading(true);

        const filter = [{ match_phrase: { 'ingredients.en': name } }];
        if (sourceId) filter.push({ term: { 'source.id': parseInt(sourceId, 10) } });

        try {
            const response = await fetch(`${process.env.REACT_APP_ELASTIC_URL}/_search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: 50,
                    _source: ['id', 'site_name', 'store.name', 'source.name'],
                    query: { bool: { filter } },
                }),
            });
            const data = await response.json();
            setAdditiveProducts(data.hits?.hits?.map(h => h._source) ?? []);
        } catch {
            setAdditiveProducts([]);
        }
        setAdditiveProductsLoading(false);
    }, [sourceId]);

    const handleAdditiveClick = useCallback((name) => {
        if (selectedAdditive === name) {
            setSelectedAdditive(null);
            setAdditiveProducts([]);
        } else {
            fetchAdditiveProducts(name);
        }
    }, [selectedAdditive, fetchAdditiveProducts]);

    const handleSearch = useCallback(() => {
        const term = searchTerm.trim();
        if (term) fetchAdditiveProducts(term);
    }, [searchTerm, fetchAdditiveProducts]);

    const buildEsQuery = useCallback(() => {
        const filter = sourceId
            ? [{ term: { 'source.id': parseInt(sourceId, 10) } }]
            : [];

        const nutrientAggs = {};
        NUTRIENT_CONFIG.forEach(({ label, ids }) => {
            const key = label.toLowerCase().replace(/\s+/g, '_');
            nutrientAggs[key] = {
                nested: { path: 'nutrition_details' },
                aggs: {
                    filtered: {
                        filter: {
                            bool: {
                                should: ids.map(id => ({
                                    term: { 'nutrition_details.nutrient_id': id }
                                })),
                                minimum_should_match: 1
                            }
                        },
                        aggs: {
                            stats:  { stats:       { field: 'nutrition_details.amount' } },
                            median: { percentiles: { field: 'nutrition_details.amount', percents: [50] } }
                        }
                    }
                }
            };
        });

        const additiveFilters = {};
        ADDITIVES.forEach(name => {
            const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            additiveFilters[key] = { match_phrase: { 'ingredients.en': name } };
        });

        return {
            size: 0,
            track_total_hits: true,
            query: { bool: { filter } },
            aggs: {
                ...nutrientAggs,
                additives: { filters: { filters: additiveFilters } },
            }
        };
    }, [sourceId]);

    const handleLoadStats = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setEsStats(null);
        setDbStats(null);

        const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;

        try {
            const [esResponse, dbResult] = await Promise.all([
                fetch(elastic_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildEsQuery())
                }),
                sourceId ? GetSourceCollectionStats(sourceId) : Promise.resolve(null)
            ]);

            const esData = await esResponse.json();

            if (esResponse.ok) {
                setEsStats({ total: esData.hits.total.value, aggs: esData.aggregations });
            } else {
                setError('Failed to load statistics from the search index.');
            }

            if (dbResult && !dbResult.error) {
                setDbStats(dbResult);
            }
        } catch {
            setError('Error loading statistics.');
        }

        setIsLoading(false);
    }, [sourceId, buildEsQuery]);

    useEffect(() => {
        handleLoadStats();
    }, [handleLoadStats]);

    const fmt = (val, decimals = 2) =>
        val != null && isFinite(val) ? val.toFixed(decimals) : '—';

    const getNutrientStats = (label) => {
        const key = label.toLowerCase().replace(/\s+/g, '_');
        const data = esStats?.aggs?.[key]?.filtered;
        if (!data || data.stats.count === 0) return null;
        return {
            count:  data.stats.count,
            mean:   data.stats.avg,
            median: data.median?.values?.['50.0'],
            min:    data.stats.min,
            max:    data.stats.max,
        };
    };

    const total       = esStats?.total ?? 0;
    const reviewed    = dbStats?.manually_reviewed ?? 0;
    const notReviewed = total - reviewed;
    const hasResults  = esStats && !isLoading;

    return (
        <PageContainer>
            <Typography variant="h4" style={{ padding: '10px' }}>Collection Statistics</Typography>
            <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
                Select a collection (source) to view summary statistics for its products.
                Statistics are currently broken down by collection; breakdown by reference amount (RA) category will be added in a future update.
            </Typography>

            <Divider style={{ width: '60vw', margin: '15px auto' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px', justifyContent: 'center' }}>
                <SourceSelector
                    value={sourceId}
                    onSelect={handleSourceChange}
                    showTitle={false}
                    label="Select a collection"
                />
                <Button variant="contained" onClick={handleLoadStats} disabled={isLoading}>
                    Load Statistics
                </Button>
            </div>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress />
                </div>
            )}

            {hasResults && (
                <>
                    {/* ── Basic Stats & QC ─────────────────────────────────── */}
                    <Typography variant="h5" style={{ padding: '20px 10px 10px' }}>
                        Basic Stats &amp; QC
                    </Typography>

                    <Grid container spacing={3} style={{ padding: '0 10px 20px' }}>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Total Products
                                    </Typography>
                                    <Typography variant="h3">{total.toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Manually Reviewed
                                    </Typography>
                                    <Typography variant="h3">
                                        {dbStats ? reviewed.toLocaleString() : '—'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {dbStats ? `${dbStats.reviewed_percentage}% of total` : 'Select a collection'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Not Yet Reviewed
                                    </Typography>
                                    <Typography variant="h3">
                                        {dbStats ? notReviewed.toLocaleString() : '—'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {dbStats
                                            ? `${(100 - dbStats.reviewed_percentage).toFixed(2)}% of total`
                                            : 'Select a collection'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Divider style={{ margin: '10px 0 20px' }} />

                    {/* ── Nutrients of Concern ─────────────────────────────── */}
                    <Typography variant="h5" style={{ padding: '10px' }}>
                        Nutrients of Concern
                    </Typography>
                    <Typography variant="body2" color="text.secondary" style={{ padding: '0 10px 10px' }}>
                        Amounts per serving as recorded on the product label.
                        "Products with Data" reflects how many products have a recorded value for that nutrient.
                    </Typography>
                    {dbStats && esStats && total < dbStats.total && (
                        <Alert severity="warning" sx={{ m: 1 }}>
                            The search index (Elasticsearch) appears to be incomplete — only {total.toLocaleString()} products
                            are indexed versus {dbStats.total.toLocaleString()} in the database.
                            Nutrient statistics below only reflect indexed products and may not be representative of the full collection.
                        </Alert>
                    )}

                    <Paper variant="outlined" style={{ margin: '10px', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Nutrient</b></TableCell>
                                    <TableCell align="right"><b>Products with Data</b></TableCell>
                                    <TableCell align="right"><b>Mean</b></TableCell>
                                    <TableCell align="right"><b>Median</b></TableCell>
                                    <TableCell align="right"><b>Min</b></TableCell>
                                    <TableCell align="right"><b>Max</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {NUTRIENT_CONFIG.map(({ label, unit }) => {
                                    const s = getNutrientStats(label);
                                    return (
                                        <TableRow key={label}>
                                            <TableCell>{label}</TableCell>
                                            <TableCell align="right">
                                                {s ? s.count.toLocaleString() : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {s ? `${fmt(s.mean)} ${unit}` : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {s ? `${fmt(s.median)} ${unit}` : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {s ? `${fmt(s.min)} ${unit}` : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {s ? `${fmt(s.max)} ${unit}` : '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>

                    <Divider style={{ margin: '20px 0' }} />

                    {/* ── Front-of-Pack ────────────────────────────────────── */}
                    <Typography variant="h5" style={{ padding: '10px' }}>
                        Front-of-Pack (FOP) Symbol
                    </Typography>

                    {!sourceId ? (
                        <Alert severity="info" sx={{ m: 1 }}>
                            Select a specific collection to see FOP statistics.
                        </Alert>
                    ) : dbStats ? (
                        <Grid container spacing={3} style={{ padding: '0 10px 20px' }}>
                            <Grid item xs={12} sm={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Products with FOP Symbol
                                        </Typography>
                                        <Typography variant="h3">
                                            {dbStats.with_fop.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {dbStats.fop_percentage}% of total
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Products without FOP Symbol
                                        </Typography>
                                        <Typography variant="h3">
                                            {(dbStats.total - dbStats.with_fop).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {(100 - dbStats.fop_percentage).toFixed(2)}% of total
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="warning" sx={{ m: 1 }}>
                            FOP statistics could not be loaded.
                        </Alert>
                    )}

                    <Divider style={{ margin: '20px 0' }} />

                    {/* ── Ingredient Prevalence ─────────────────────────────── */}
                    <Typography variant="h5" style={{ padding: '10px' }}>
                        Ingredient Prevalence &amp; Additives
                    </Typography>
                    <Typography variant="body2" color="text.secondary" style={{ padding: '0 10px 10px' }}>
                        Preservatives (Health Canada List of Permitted Preservatives).
                        Counts reflect products whose English ingredient list contains the additive name.
                    </Typography>
                    <Paper variant="outlined" style={{ margin: '10px', overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Additive</b></TableCell>
                                    <TableCell align="right"><b>Products Containing</b></TableCell>
                                    <TableCell align="right"><b>% of Total</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ADDITIVES.map(name => {
                                    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                                    const count = esStats?.aggs?.additives?.buckets?.[key]?.doc_count ?? null;
                                    const pct = count != null && total > 0
                                        ? ((count / total) * 100).toFixed(2)
                                        : null;
                                    const isSelected = selectedAdditive === name;
                                    return (
                                        <TableRow
                                            key={name}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleAdditiveClick(name)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{name}</TableCell>
                                            <TableCell align="right">{count != null ? count.toLocaleString() : '—'}</TableCell>
                                            <TableCell align="right">{pct != null ? `${pct}%` : '—'}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>

                    <div style={{ display: 'flex', gap: '10px', padding: '10px 10px 0', alignItems: 'center' }}>
                        <TextField
                            size="small"
                            label="Search any ingredient"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ width: '300px' }}
                        />
                        <Button variant="outlined" onClick={handleSearch} disabled={!searchTerm.trim()}>
                            Search
                        </Button>
                    </div>

                    {selectedAdditive && (
                        <>
                            <Typography variant="h6" style={{ padding: '10px 10px 4px' }}>
                                Products containing "{selectedAdditive}"
                                {!additiveProductsLoading && ` (showing up to 50)`}
                            </Typography>
                            {additiveProductsLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <CircularProgress size={24} />
                                </div>
                            ) : (
                                <Paper variant="outlined" style={{ margin: '10px', overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><b>Product</b></TableCell>
                                                <TableCell><b>Store</b></TableCell>
                                                <TableCell><b>Collection</b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {additiveProducts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">No products found.</TableCell>
                                                </TableRow>
                                            ) : additiveProducts.map(p => (
                                                <TableRow key={p.id} hover>
                                                    <TableCell>
                                                        <Link to={`/tools/product-browser/${p.id}`} target="_blank">
                                                            {p.site_name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{p.store?.name ?? '—'}</TableCell>
                                                    <TableCell>{p.source?.name ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            )}
                        </>
                    )}
                </>
            )}
        </PageContainer>
    );
};

export default CollectionStats;
