import React, { useState, useEffect } from 'react';
import {
    Typography, Divider, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, Grid, Card, CardContent,
    CircularProgress, Alert
} from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import SourceSelector from '../../../components/inputs/SourceSelector';
import { GetSourceCollectionStats } from '../../../api/services/SourceService';
import { GetAllNutrients } from '../../../api/services/NutrientService';

const NUTRIENT_CONFIG = [
    { label: 'Sodium',        names: ['Sodium'],                              unit: 'mg' },
    { label: 'Total Sugars',  names: ['Total Sugars', 'Total Sugars (NLEA)'], unit: 'g'  },
    { label: 'Saturated Fat', names: ['Saturated Fat'],                       unit: 'g'  },
];

const CollectionStats = () => {
    const [sourceId, setSourceId]         = useState(null);
    const [esStats, setEsStats]           = useState(null);
    const [dbStats, setDbStats]           = useState(null);
    const [nutrientIds, setNutrientIds]   = useState(null);
    const [isLoading, setIsLoading]       = useState(false);
    const [error, setError]               = useState('');

    // Fetch nutrients once on mount and resolve IDs by name
    useEffect(() => {
        GetAllNutrients().then(result => {
            if (result.error) return;
            const resolved = NUTRIENT_CONFIG.map(config => ({
                ...config,
                ids: result.nutrients
                    .filter(n => config.names.includes(n.name))
                    .map(n => n.id),
            }));
            setNutrientIds(resolved);
        });
    }, []);

    const handleSourceChange = (value) => {
        setSourceId(value === '-1' ? null : value);
        setEsStats(null);
        setDbStats(null);
        setError('');
    };

    const buildEsQuery = (resolvedNutrients) => {
        const filter = sourceId
            ? [{ term: { 'source.id': parseInt(sourceId, 10) } }]
            : [];

        const nutrientAggs = {};
        resolvedNutrients.forEach(({ label, ids }) => {
            if (ids.length === 0) return;
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

        return {
            size: 0,
            query: { bool: { filter } },
            aggs: nutrientAggs
        };
    };

    const handleLoadStats = async () => {
        if (!nutrientIds) return;
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
                    body: JSON.stringify(buildEsQuery(nutrientIds))
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
    };

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

    const hasResults = esStats && !isLoading;

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
                <Button
                    variant="contained"
                    onClick={handleLoadStats}
                    disabled={isLoading || !nutrientIds}
                >
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
                                {nutrientIds.map(({ label, unit, ids }) => {
                                    const s = getNutrientStats(label);
                                    return (
                                        <TableRow key={label}>
                                            <TableCell>{label}</TableCell>
                                            <TableCell align="right">
                                                {ids.length === 0
                                                    ? 'Not found in DB'
                                                    : s ? s.count.toLocaleString() : '—'}
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
                    <Alert severity="info" sx={{ m: 1 }}>
                        Ingredient search terms for Vitamin D and additive lists are pending. This section will be populated once the ingredient lists are provided.
                    </Alert>
                </>
            )}
        </PageContainer>
    );
};

export default CollectionStats;
